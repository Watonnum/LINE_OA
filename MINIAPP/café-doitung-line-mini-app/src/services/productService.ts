import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';

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
 * Seed initial products to Firestore database
 */
export async function seedProductsToFirestore(): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    for (const item of MENU_ITEMS) {
      await setDoc(doc(db, 'products', item.id), item, { merge: true });
    }
    console.log('Products seeded successfully into Firestore DB');
    return true;
  } catch (error) {
    console.error('Firestore seed error:', error);
    return false;
  }
}
