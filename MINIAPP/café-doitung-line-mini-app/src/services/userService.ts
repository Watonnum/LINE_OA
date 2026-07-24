import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { LineUserProfile, InvitedFriend } from '../types';

// Mock storage in memory for fallback when Firebase credentials are not yet set
const mockUserPointsMemory: Record<string, number> = {};
const mockReferralsMemory: Record<string, InvitedFriend[]> = {};

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
 * Fetch customer points balance
 */
export async function getUserPoints(userId: string): Promise<number> {
  if (!userId) return 0;

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data().points ?? 0;
      }
    } catch (error) {
      console.error('Firestore getUserPoints error:', error);
    }
  }

  return mockUserPointsMemory[userId] ?? 0;
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
