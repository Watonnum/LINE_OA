import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockProducts = [
  {
    name: "DoiTung Macadamia Latte",
    description: "Signature latte infused with premium macadamia syrup and topped with crushed DoiTung roasted macadamia nuts.",
    price: 120,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Espresso",
    description: "Rich, intense, and full-bodied espresso shot brewed from 100% DoiTung Arabica beans.",
    price: 80,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1510707513156-4b8d6be960f2?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Iced Americano",
    description: "Classic espresso shot diluted with cold water and served over ice. Perfect for a clean coffee taste.",
    price: 95,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1551046713-bc725b022b8f?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Iced Latte",
    description: "Smooth espresso shot combined with chilled fresh milk and served over ice.",
    price: 100,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Iced Cappuccino",
    description: "Espresso combined with fresh milk, topped with a thick, luxurious layer of cold milk foam and dusted with cocoa powder.",
    price: 100,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Iced Matcha Latte",
    description: "Premium Japanese Uji matcha green tea whisked with fresh milk and ice.",
    price: 105,
    category: "Non-Coffee",
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Iced Premium Cocoa",
    description: "Rich, velvety premium cocoa syrup blended with fresh milk and ice.",
    price: 95,
    category: "Non-Coffee",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "DoiTung Macadamia Cookie",
    description: "Crispy and buttery cookie packed with chunks of premium DoiTung roasted macadamias.",
    price: 60,
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
  {
    name: "Butter Croissant",
    description: "Warm, flaky, and buttery French croissant baked fresh daily.",
    price: 75,
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
  },
];

async function seedDatabase() {
  console.log("Starting Firebase Firestore seeding...");
  console.log(`Connected to Firebase Project ID: ${firebaseConfig.projectId}`);

  const productsCollection = collection(db, "products");

  // 1. Fetch and clean up existing products
  console.log("Fetching existing products to clean up...");
  try {
    const existingSnapshot = await getDocs(productsCollection);
    console.log(`Found ${existingSnapshot.size} existing products. Deleting...`);
    const deletePromises = existingSnapshot.docs.map((document) =>
      deleteDoc(doc(db, "products", document.id))
    );
    await Promise.all(deletePromises);
    console.log("Cleanup finished.");
  } catch (error) {
    console.error("Warning during cleanup (this might happen if rules are not set yet):", error.message);
  }

  // 2. Insert mock products
  console.log("Inserting new mock products...");
  let count = 0;
  for (const product of mockProducts) {
    try {
      const docRef = await addDoc(productsCollection, product);
      console.log(`[Success] Added ${product.name} with ID: ${docRef.id}`);
      count++;
    } catch (error) {
      console.error(`[Error] Failed to add ${product.name}:`, error.message);
    }
  }

  console.log(`Seeding completed. Successfully seeded ${count}/${mockProducts.length} products.`);
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
