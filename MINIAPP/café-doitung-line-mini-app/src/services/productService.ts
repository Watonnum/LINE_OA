import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { MenuItem, Branch } from '../types';
import { MENU_ITEMS, BRANCHES } from '../data/menuData';

/**
 * Fetch products from Firestore 'products' collection or return default seed data
 */
export async function fetchProducts(): Promise<MenuItem[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const productsRef = collection(db, 'products');
      const snap = await getDocs(productsRef);
      if (!snap.empty) {
        const items: MenuItem[] = [];
        snap.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
        });
        return items;
      }
    } catch (error) {
      console.error('Firestore fetchProducts error:', error);
    }
  }

  return MENU_ITEMS;
}

/**
 * Fetch branches from Firestore 'branches' collection or return default seed data
 */
export async function fetchBranches(): Promise<Branch[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const branchesRef = collection(db, 'branches');
      const snap = await getDocs(branchesRef);
      if (!snap.empty) {
        const list: Branch[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Branch);
        });
        return list;
      }
    } catch (error) {
      console.error('Firestore fetchBranches error:', error);
    }
  }

  return BRANCHES;
}

/**
 * Seed initial products to Firestore (Utility helper for initial admin setup)
 */
export async function seedProductsToFirestore(): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    for (const item of MENU_ITEMS) {
      await setDoc(doc(db, 'products', item.id), item, { merge: true });
    }
    for (const branch of BRANCHES) {
      await setDoc(doc(db, 'branches', branch.id), branch, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Firestore seed error:', error);
    return false;
  }
}
