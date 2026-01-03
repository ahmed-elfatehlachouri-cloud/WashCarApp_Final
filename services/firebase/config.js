// services/firebase/config.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⬇️ Garde SEULEMENT cet objet firebaseConfig, avec TES valeurs
const firebaseConfig = {
  apiKey: "AIzaSyBKcsXltDRaZRdBON-unFJ1VhvVtUg57lA",
  authDomain: "washcarapp-university-8fca3.firebaseapp.com",
  projectId: "washcarapp-university-8fca3",
  storageBucket: "washcarapp-university-8fca3.firebasestorage.app",
  messagingSenderId: "957206120972",
  appId: "1:957206120972:web:b8a98b7860b300e3e2fc29",
  measurementId: "G-0CNFLT9765", // facultatif, mais ça ne gêne pas
};

// Initialisation Firebase (UNE seule fois)
const app = initializeApp(firebaseConfig);

// Auth avec persistence (Expo / React Native)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);