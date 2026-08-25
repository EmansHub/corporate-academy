import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCmTH6WYm7k0Mwd8mPGOGC5TeSvDeU1uxk",
  authDomain: "weekly-courses.firebaseapp.com",
  projectId: "weekly-courses",
  storageBucket: "weekly-courses.firebasestorage.app",
  messagingSenderId: "175899784359",
  appId: "1:175899784359:web:6afabadb8ea5d8787e5782"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
