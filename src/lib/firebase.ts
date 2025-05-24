// src/lib/firebase.ts
// Initializes Firebase and Firestore for the SCSD app

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqbNyr8ZfeIbh5uf6xD-cj0Z8VGaGQQ30",
  authDomain: "scsd-app-f5e79.firebaseapp.com",
  projectId: "scsd-app-f5e79",
  storageBucket: "scsd-app-f5e79.firebasestorage.app",
  messagingSenderId: "71511720888",
  appId: "1:71511720888:web:f71a1102b213d62991854d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
