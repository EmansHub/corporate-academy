// Firebase initialization for the Training Course Display app.
//
// SETUP: Replace the placeholder values below with your own Firebase project's
// web app config (Firebase Console -> Project settings -> Your apps -> Web app).
// This project uses Firebase Authentication (Google Sign-In) and Cloud Firestore.
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// When the config still holds placeholders, we run in a demo/mock mode so the
// app is fully explorable in preview without a live Firebase backend.
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
