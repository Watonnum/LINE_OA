import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { LineUserProfile, InvitedFriend, CouponReward, UserCoupon } from '../types';

// In-memory fallback only for offline / non-firebase demo mode
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
        await setDoc(userRef, {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || '',
          statusMessage: profile.statusMessage || '',
          points: 380, // New user bonus points
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return 380;
      }
    } catch (error) {
      console.error('Firestore syncUserProfile error:', error);
    }
  }

  if (mockUserPointsMemory[profile.userId] === undefined) {
    mockUserPointsMemory[profile.userId] = 380;
  }
  return mockUserPointsMemory[profile.userId];
}

/**
 * Save user points balance directly to Firestore Database
 */
export async function saveUserPoints(userId: string, points: number): Promise<number> {
  const effectiveUserId = userId || 'guest_user';
  const cleanPoints = Math.max(0, points);

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
      console.error('Firestore saveUserPoints error:', error);
    }
  }

  return cleanPoints;
}

/**
 * Fetch customer points balance directly from Firestore Database
 */
export async function getUserPoints(userId: string): Promise<number> {
  const effectiveUserId = userId || 'guest_user';

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', effectiveUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const points = userSnap.data().points ?? 0;
        mockUserPointsMemory[effectiveUserId] = points;
        return points;
      }
    } catch (error) {
      console.error('Firestore getUserPoints error:', error);
    }
  }

  return mockUserPointsMemory[effectiveUserId] ?? 0;
}

/**
 * Realtime listener for User Points balance from Firestore DB
 */
export function subscribeUserPoints(userId: string, callback: (points: number) => void) {
  const effectiveUserId = userId || 'guest_user';
  if (isFirebaseConfigured() && db) {
    const userRef = doc(db, 'users', effectiveUserId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const pts = snapshot.data().points ?? 0;
        mockUserPointsMemory[effectiveUserId] = pts;
        callback(pts);
      }
    });
  }
  callback(mockUserPointsMemory[effectiveUserId] ?? 0);
  return () => {};
}

/**
 * Add loyalty points earned from purchases directly to Firestore DB
 */
export async function addPointsToUser(userId: string, pointsToAdd: number): Promise<number> {
  const effectiveUserId = userId || 'guest_user';
  if (pointsToAdd <= 0) return await getUserPoints(effectiveUserId);

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', effectiveUserId);
      await setDoc(
        userRef,
        {
          points: increment(pointsToAdd),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const newPts = updatedSnap.data().points ?? 0;
        mockUserPointsMemory[effectiveUserId] = newPts;
        return newPts;
      }
    } catch (error) {
      console.error('Firestore addPointsToUser error:', error);
    }
  }

  const currentPoints = mockUserPointsMemory[effectiveUserId] || 0;
  mockUserPointsMemory[effectiveUserId] = currentPoints + pointsToAdd;
  return mockUserPointsMemory[effectiveUserId];
}

/**
 * Fetch list of friends referred by user
 */
export async function fetchReferredFriends(userId: string): Promise<InvitedFriend[]> {
  const effectiveUserId = userId || 'guest_user';
  if (isFirebaseConfigured() && db) {
    try {
      const refCollection = collection(db, 'referrals');
      const q = query(refCollection, where('referrerUserId', '==', effectiveUserId));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const list: InvitedFriend[] = [];
        querySnap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            name: d.referredName || 'Friend',
            avatar: d.referredAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            joinedDate: d.joinedAt ? new Date(d.joinedAt).toLocaleDateString('th-TH') : 'Recently',
            pointsEarned: d.pointsAwarded || 1,
            status: 'Joined'
          });
        });
        return list;
      }
    } catch (error) {
      console.error('Firestore fetchReferredFriends error:', error);
    }
  }
  return mockReferralsMemory[effectiveUserId] || [];
}

export const fetchUserReferrals = fetchReferredFriends;


/**
 * Record friend referral and grant +1 point to referrer
 */
export async function processReferral(referrerUserId: string, friendProfile: LineUserProfile): Promise<boolean> {
  if (!referrerUserId || !friendProfile || !friendProfile.userId) return false;

  if (isFirebaseConfigured() && db) {
    try {
      const referrerRef = doc(db, 'users', referrerUserId);
      await updateDoc(referrerRef, {
        points: increment(1),
        updatedAt: new Date().toISOString()
      });

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

  mockUserPointsMemory[referrerUserId] = (mockUserPointsMemory[referrerUserId] || 0) + 1;
  return true;
}

/**
 * Fetch redeemed user coupons directly from Firestore DB
 */
export async function fetchUserCoupons(userId: string): Promise<UserCoupon[]> {
  const effectiveUserId = userId || 'guest_user';

  if (isFirebaseConfigured() && db) {
    try {
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('userId', '==', effectiveUserId));
      const querySnap = await getDocs(q);

      const dbCoupons: UserCoupon[] = [];
      querySnap.forEach((docSnap) => {
        dbCoupons.push({ id: docSnap.id, ...docSnap.data() } as UserCoupon);
      });

      dbCoupons.sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
      mockCouponsMemory[effectiveUserId] = dbCoupons;
      return dbCoupons;
    } catch (error) {
      console.error('Firestore fetchUserCoupons error:', error);
    }
  }

  return mockCouponsMemory[effectiveUserId] || [];
}

/**
 * Realtime listener for User Coupons from Firestore DB
 */
export function subscribeUserCoupons(userId: string, callback: (coupons: UserCoupon[]) => void) {
  const effectiveUserId = userId || 'guest_user';
  if (isFirebaseConfigured() && db) {
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('userId', '==', effectiveUserId));
    return onSnapshot(q, (snapshot) => {
      const dbCoupons: UserCoupon[] = [];
      snapshot.forEach((docSnap) => {
        dbCoupons.push({ id: docSnap.id, ...docSnap.data() } as UserCoupon);
      });
      dbCoupons.sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
      mockCouponsMemory[effectiveUserId] = dbCoupons;
      callback(dbCoupons);
    });
  }
  callback(mockCouponsMemory[effectiveUserId] || []);
  return () => {};
}

/**
 * Redeem points for a coupon directly in Firestore DB
 */
export async function redeemUserCoupon(
  userId: string,
  reward: CouponReward,
  activeUserBeans?: number
): Promise<{ success: boolean; newPoints: number; coupon?: UserCoupon }> {
  if (!reward) return { success: false, newPoints: 0 };
  const effectiveUserId = userId || 'guest_user';

  const dbPoints = await getUserPoints(effectiveUserId);
  const currentPoints = activeUserBeans !== undefined ? Math.min(activeUserBeans, dbPoints) : dbPoints;

  if (currentPoints < reward.pointsRequired) {
    return { success: false, newPoints: currentPoints };
  }

  const remainingPoints = Math.max(0, currentPoints - reward.pointsRequired);

  // 1. Update user points in DB
  await saveUserPoints(effectiveUserId, remainingPoints);

  // 2. Create coupon in DB
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
      console.error('Firestore redeemUserCoupon error:', error);
    }
  }

  if (!mockCouponsMemory[effectiveUserId]) {
    mockCouponsMemory[effectiveUserId] = [];
  }
  mockCouponsMemory[effectiveUserId].unshift(newCoupon);

  return { success: true, newPoints: remainingPoints, coupon: newCoupon };
}

/**
 * Mark a user coupon as used after order completion directly in Firestore DB
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

  if (mockCouponsMemory[effectiveUserId]) {
    mockCouponsMemory[effectiveUserId] = mockCouponsMemory[effectiveUserId].map((c) =>
      c.id === couponId || c.couponId === couponId
        ? { ...c, isUsed: true, usedAt: new Date().toISOString() }
        : c
    );
  }

  return true;
}
