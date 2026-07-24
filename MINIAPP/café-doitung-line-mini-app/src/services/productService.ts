import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { MenuItem, Branch } from '../types';
import { MENU_ITEMS, BRANCHES } from '../data/menuData';

/**
 * Fetch products from Firestore 'products' collection.
 * If empty, automatically seeds Firestore 'products' collection.
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
      } else {
        // Automatically seed products into Firestore database on first fetch
        console.log('Seeding products into Firestore database...');
        await seedProductsToFirestore();
        return MENU_ITEMS;
      }
    } catch (error) {
      console.error('Firestore fetchProducts error:', error);
    }
  }

  return MENU_ITEMS;
}

/**
 * Fetch branches from Firestore 'branches' collection.
 * If empty, automatically seeds Firestore 'branches' collection.
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
      } else {
        await seedProductsToFirestore();
        return BRANCHES;
      }
    } catch (error) {
      console.error('Firestore fetchBranches error:', error);
    }
  }

  return BRANCHES;
}

/**
 * Seed initial products to Firestore database
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
    console.log('Products and branches seeded successfully into Firestore DB');
    return true;
  } catch (error) {
    console.error('Firestore seed error:', error);
    return false;
  }
}
