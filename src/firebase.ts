// src/firebase.ts - KEEP but simplified:
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDDnIXYDzIa024DGRJnDBYWPO0vS6pCLaQ",
  authDomain: "partyspot-a68fb.firebaseapp.com",
  projectId: "partyspot-a68fb",
  storageBucket: "partyspot-a68fb.firebasestorage.app",
  // REMOVE: messagingSenderId (not needed for sending)
  appId: "1:739174236154:web:202a7d054c25c72298ae43",
  measurementId: "G-06JXZH559P"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const functions = getFunctions(app);

export { app, functions };
export default app;