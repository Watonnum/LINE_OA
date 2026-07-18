import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

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

const targetUserId = "U7fd7c4f082e1540514a49c6f0014ece7";

async function fixUserPoints() {
  const userRef = doc(db, "users", targetUserId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    const currentPoints = data.rewardPoints || 0;
    const currentSpent = data.totalSpent || 0;
    
    // Add 100 welcome points to their current points
    const targetPoints = currentPoints === 10 ? 110 : (currentPoints + 100);
    const targetTier = currentSpent >= 3000 ? "Gold" : (currentSpent >= 1000 ? "Silver" : "Bronze");

    console.log(`Current data for user ${targetUserId}:`, data);
    console.log(`Updating points to ${targetPoints} and tier to ${targetTier}...`);

    await updateDoc(userRef, {
      rewardPoints: targetPoints,
      membershipTier: targetTier
    });

    console.log("Update completed successfully!");
  } else {
    console.error(`User with ID ${targetUserId} not found in Firestore users collection.`);
  }
}

fixUserPoints().catch(console.error);
