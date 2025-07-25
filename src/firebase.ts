// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCIkj7tF81qD35As_FBDFtXriFP-0D0CU4",
  authDomain: "part-sport.firebaseapp.com",
  projectId: "part-sport",
  storageBucket: "part-sport.firebasestorage.app",
  messagingSenderId: "351917712538",
  appId: "1:351917712538:web:f3c3278bf15849b479ab23",
  measurementId: "G-PZ0GPBQ2K1",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
