import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "portal-414c0.firebaseapp.com",
  projectId: "portal-414c0",
  storageBucket: "portal-414c0.firebasestorage.app",
  messagingSenderId: "63514398861",
  appId: "1:63514398861:web:1f19386282b84cb63152c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();