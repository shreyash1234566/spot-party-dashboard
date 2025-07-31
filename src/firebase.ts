import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions } from "firebase/functions"; // 1. Import getFunctions

const firebaseConfig = {
  apiKey: "AIzaSyDDnIXYDzIa024DGRJnDBYWPO0vS6pCLaQ",
  authDomain: "partyspot-a68fb.firebaseapp.com",
  projectId: "partyspot-a68fb",
  storageBucket: "partyspot-a68fb.firebasestorage.app",
  messagingSenderId: "739174236154",
  appId: "1:739174236154:web:202a7d054c25c72298ae43",
  measurementId: "G-06JXZH559P"
};

// Initialize Firebase App (your logic is correct)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firebase Services
const functions = getFunctions(app);
// You can also initialize other services here, e.g.:
// const db = getFirestore(app);
// const auth = getAuth(app);

// 3. Use named exports to provide access to all services
export { app, functions };

// If you absolutely need a default export for `app`, you can do this:
// export { functions };
export default app;
// But using only named exports is often cleaner.