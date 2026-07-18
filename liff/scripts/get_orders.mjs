import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAR4_jIfiJcPBj4pMOgJfTpQr4FSEPpcA0",
  authDomain: "test-3f164.firebaseapp.com",
  projectId: "test-3f164",
  storageBucket: "test-3f164.firebasestorage.app",
  messagingSenderId: "559997350631",
  appId: "1:559997350631:web:e1d625bfa399151a932842",
  measurementId: "G-SQ0S31M59R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getOrders() {
  console.log("Fetching all orders from Firestore...");
  const querySnapshot = await getDocs(collection(db, "orders"));
  const list = [];
  querySnapshot.forEach(doc => {
    list.push({
      id: doc.id,
      ...doc.data()
    });
  });
  console.log("Total orders in database:", list.length);
  console.log("Orders:", JSON.stringify(list, null, 2));
}

getOrders().catch(console.error);
