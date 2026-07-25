import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { LineUserProfile, InvitedFriend, CouponReward, UserCoupon } from '../types';

// Mock storage in memory for fallback when Firebase credentials are not yet set
const mockUserPointsMemory: Record<string, number> = {};
const mockReferralsMemory: Record<string, InvitedFriend[]> = {};
const mockCouponsMemory: Record<string, UserCoupon[]> = {};

/**
 * Sync LINE user profile to Firestore 'users' collection
 */
export async function syncUserProfile(profile: LineUserProfile): Promise<number> {
  if (!profile || !profile.userId) return 0;

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', profile.userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        await updateDoc(userRef, {
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || '',
          statusMessage: profile.statusMessage || '',
          updatedAt: new Date().toISOString()
        });
        return data.points ?? 0;
      } else {
        const initialUserData = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || '',
          statusMessage: profile.statusMessage || '',
          points: 0,
          referredBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, initialUserData);
        return 0;
      }
    } catch (error) {
      console.error('Firestore syncUserProfile error:', error);
    }
  }

  // Fallback in-memory behavior
  if (mockUserPointsMemory[profile.userId] === undefined) {
    mockUserPointsMemory[profile.userId] = 0;
  }
  return mockUserPointsMemory[profile.userId];
}

/**
 * Save user points balance to localStorage and Firestore
 */
export async function saveUserPoints(userId: string, points: number): Promise<number> {
  const effectiveUserId = userId || 'guest_user';
  const cleanPoints = Math.max(0, points);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cafe_doitung_user_points_${effectiveUserId}`, cleanPoints.toString());
    } catch (err) {
      console.error('Failed to save points to localStorage:', err);
    }
  }

  mockUserPointsMemory[effectiveUserId] = cleanPoints;

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', effectiveUserId);
      await setDoc(
        userRef,
        {
          points: cleanPoints,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Firestore saveUserPoints warning:', error);
    }
  }

  return cleanPoints;
}

/**
 * Fetch customer points balance
 */
export async function getUserPoints(userId: string): Promise<number> {
  const effectiveUserId = userId || 'guest_user';
  let localPoints: number | null = null;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`cafe_doitung_user_points_${effectiveUserId}`);
      if (saved !== null) {
        localPoints = parseInt(saved, 10);
      }
    } catch (err) {
      console.error('Failed to read points from localStorage:', err);
    }
  }

  let dbPoints: number | null = null;
  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', effectiveUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        dbPoints = userSnap.data().points ?? 0;
      }
    } catch (error) {
      console.error('Firestore getUserPoints error:', error);
    }
  }

  const finalPoints = Math.max(
    localPoints !== null ? localPoints : 0,
    dbPoints !== null ? dbPoints : 0,
    mockUserPointsMemory[effectiveUserId] ?? 0
  );

  return finalPoints;
}

/**
 * Add loyalty points earned from purchases
 */
export async function addPointsToUser(userId: string, pointsToAdd: number): Promise<number> {
  const effectiveUserId = userId || 'guest_user';
  if (pointsToAdd <= 0) return await getUserPoints(effectiveUserId);

  const currentPoints = await getUserPoints(effectiveUserId);
  const newPoints = currentPoints + pointsToAdd;

  return await saveUserPoints(effectiveUserId, newPoints);
}


/**
 * Fetch list of friends referred by user
 */
export async function fetchUserReferrals(userId: string): Promise<InvitedFriend[]> {
  if (!userId) return [];

  if (isFirebaseConfigured() && db) {
    try {
      const referralsRef = collection(db, 'referrals');
      const q = query(referralsRef, where('referrerUserId', '==', userId));
      const querySnap = await getDocs(q);

      const list: InvitedFriend[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.referredName || 'LINE Friend',
          avatar: data.referredAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          joinedDate: data.joinedAt ? new Date(data.joinedAt).toLocaleDateString('th-TH') : 'recently',
          pointsEarned: data.pointsAwarded || 1,
          status: 'Active'
        });
      });
      return list;
    } catch (error) {
      console.error('Firestore fetchUserReferrals error:', error);
    }
  }

  return mockReferralsMemory[userId] || [];
}

/**
 * Record friend referral and grant +1 point to referrer
 */
export async function processReferral(referrerUserId: string, friendProfile: LineUserProfile): Promise<boolean> {
  if (!referrerUserId || !friendProfile || !friendProfile.userId) return false;

  if (isFirebaseConfigured() && db) {
    try {
      // 1. Grant +1 point to referrer user document
      const referrerRef = doc(db, 'users', referrerUserId);
      await updateDoc(referrerRef, {
        points: increment(1),
        updatedAt: new Date().toISOString()
      });

      // 2. Add referral record in 'referrals' collection
      await addDoc(collection(db, 'referrals'), {
        referrerUserId,
        referredUserId: friendProfile.userId,
        referredName: friendProfile.displayName,
        referredAvatar: friendProfile.pictureUrl || '',
        pointsAwarded: 1,
        joinedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Firestore processReferral error:', error);
    }
  }

  // Fallback in-memory
  mockUserPointsMemory[referrerUserId] = (mockUserPointsMemory[referrerUserId] || 0) + 1;
  if (!mockReferralsMemory[referrerUserId]) {
    mockReferralsMemory[referrerUserId] = [];
  }
  mockReferralsMemory[referrerUserId].push({
    id: `ref_${Date.now()}`,
    name: friendProfile.displayName,
    avatar: friendProfile.pictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    joinedDate: 'Just now',
    pointsEarned: 1,
    status: 'Joined'
  });

  return true;
}

/**
 * Fetch redeemed user coupons
 */
export async function fetchUserCoupons(userId: string): Promise<UserCoupon[]> {
  const effectiveUserId = userId || 'guest_user';
  let localCoupons: UserCoupon[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`cafe_doitung_user_coupons_${effectiveUserId}`);
      if (saved) {
        localCoupons = JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to parse local coupons:', err);
    }
  }

  if (isFirebaseConfigured() && db) {
    try {
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('userId', '==', effectiveUserId));
      const querySnap = await getDocs(q);

      const dbCoupons: UserCoupon[] = [];
      querySnap.forEach((docSnap) => {
        dbCoupons.push({ id: docSnap.id, ...docSnap.data() } as UserCoupon);
      });

      const mergedMap = new Map<string, UserCoupon>();
      localCoupons.forEach((c) => mergedMap.set(c.id || c.code, c));
      dbCoupons.forEach((c) => {
        const key = c.id || c.code;
        const local = mergedMap.get(key);
        if (local) {
          const isUsed = Boolean(local.isUsed || c.isUsed);
          mergedMap.set(key, { ...c, ...local, isUsed });
        } else {
          mergedMap.set(key, c);
        }
      });

      const merged = Array.from(mergedMap.values());

      if (typeof window !== 'undefined') {
        localStorage.setItem(`cafe_doitung_user_coupons_${effectiveUserId}`, JSON.stringify(merged));
      }
      return merged;
    } catch (error) {
      console.error('Firestore fetchUserCoupons error:', error);
    }
  }

  return localCoupons.length > 0 ? localCoupons : (mockCouponsMemory[effectiveUserId] || []);
}

/**
 * Redeem points for a coupon
 */
export async function redeemUserCoupon(
  userId: string,
  reward: CouponReward,
  activeUserBeans?: number
): Promise<{ success: boolean; newPoints: number; coupon?: UserCoupon }> {
  if (!reward) return { success: false, newPoints: 0 };
  const effectiveUserId = userId || 'guest_user';

  const dbPoints = await getUserPoints(effectiveUserId);
  const currentPoints = activeUserBeans !== undefined ? Math.max(activeUserBeans, dbPoints) : dbPoints;

  if (currentPoints < reward.pointsRequired) {
    return { success: false, newPoints: currentPoints };
  }

  const remainingPoints = Math.max(0, currentPoints - reward.pointsRequired);

  // Persist updated points immediately to localStorage, memory, and Firestore
  await saveUserPoints(effectiveUserId, remainingPoints);


  const newCoupon: UserCoupon = {
    id: `coup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    couponId: reward.id,
    title: reward.title,
    thTitle: reward.thTitle,
    discountAmount: reward.discountAmount,
    minSpend: reward.minSpend,
    code: `${reward.code}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    redeemedAt: new Date().toISOString(),
    isUsed: false
  };


  if (isFirebaseConfigured() && db) {
    try {
      const couponRef = doc(db, 'coupons', newCoupon.id);
      await setDoc(couponRef, {
        userId: effectiveUserId,
        ...newCoupon
      });
    } catch (error) {
      console.error('Firestore redeemUserCoupon warning:', error);
    }
  }

  // Always update in-memory and localStorage for instant offline/online availability
  if (!mockCouponsMemory[effectiveUserId]) {
    mockCouponsMemory[effectiveUserId] = [];
  }
  mockCouponsMemory[effectiveUserId].unshift(newCoupon);


  if (typeof window !== 'undefined') {
    try {
      const existingStr = localStorage.getItem(`cafe_doitung_user_coupons_${effectiveUserId}`);
      const existingList: UserCoupon[] = existingStr ? JSON.parse(existingStr) : [];
      const updatedList = [newCoupon, ...existingList.filter((c) => c.id !== newCoupon.id)];
      localStorage.setItem(`cafe_doitung_user_coupons_${effectiveUserId}`, JSON.stringify(updatedList));
    } catch (err) {
      console.error('Failed to save redeemed coupon to localStorage:', err);
    }
  }

  return { success: true, newPoints: remainingPoints, coupon: newCoupon };
}

/**
 * Mark a user coupon as used after order completion (Single-use enforcement)
 */
export async function markCouponAsUsed(userId: string, couponId: string): Promise<boolean> {
  const effectiveUserId = userId || 'guest_user';
  if (!couponId) return false;

  if (isFirebaseConfigured() && db) {
    try {
      const couponRef = doc(db, 'coupons', couponId);
      await setDoc(
        couponRef,
        {
          isUsed: true,
          usedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Firestore markCouponAsUsed error:', error);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const key = `cafe_doitung_user_coupons_${effectiveUserId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const list: UserCoupon[] = JSON.parse(saved);
        const updated = list.map((c) =>
          c.id === couponId || c.couponId === couponId
            ? { ...c, isUsed: true, usedAt: new Date().toISOString() }
            : c
        );
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to update used coupon in localStorage:', err);
    }
  }

  return true;
}



