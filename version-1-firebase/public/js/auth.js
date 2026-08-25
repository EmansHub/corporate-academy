import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { auth, googleProvider, db } from "./firebase.js";

export async function fetchAdmin(email) {
  const snap = await getDoc(doc(db, "users", email));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { email: email, department: data.department };
}

export async function signInAdmin() {
  const cred = await signInWithPopup(auth, googleProvider);
  const admin = await fetchAdmin(cred.user.email);
  if (!admin) {
    await signOut(auth);
    throw new Error("This account is not authorized.");
  }
  return admin;
}

export function signOutAdmin() {
  return signOut(auth);
}

export function subscribeAdmin(cb) {
  return onAuthStateChanged(auth, async (user) => {
    cb(user ? await fetchAdmin(user.email) : null);
  });
}