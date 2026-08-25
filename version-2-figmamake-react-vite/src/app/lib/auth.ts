// Authentication + admin-authorization layer.
//
// Only administrators sign in (Google Sign-In). On sign-in we look up the user's
// UID in the `users` Firestore collection; access is granted only if it exists.
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db, isFirebaseConfigured } from "../firebase";
import type { AppUser } from "./types";
import { mockUsers, DEMO_ADMIN_USER } from "./mockStore";

// Look up the admin record for a UID in the `users` collection.
async function fetchAdmin(uid: string): Promise<AppUser | null> {
  if (!isFirebaseConfigured) {
    return mockUsers.find((u) => u.uid === uid) ?? null;
  }
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { uid, email: data.email, department: data.department };
}

// Trigger Google Sign-In, then verify the user is a registered admin.
// Throws with a friendly message when the account is not authorized.
export async function signInAdmin(): Promise<AppUser> {
  if (!isFirebaseConfigured) {
    // Demo mode: sign in as the seeded demo admin.
    return DEMO_ADMIN_USER;
  }
  const cred = await signInWithPopup(auth, googleProvider);
  const admin = await fetchAdmin(cred.user.uid);
  if (!admin) {
    await fbSignOut(auth);
    throw new Error(
      "This account is not authorized. Please contact your administrator."
    );
  }
  return admin;
}

export async function signOutAdmin(): Promise<void> {
  if (!isFirebaseConfigured) return;
  await fbSignOut(auth);
}

// Subscribe to auth state and resolve the current admin (or null).
// Returns an unsubscribe function.
export function subscribeAdmin(
  cb: (admin: AppUser | null) => void
): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      cb(null);
      return;
    }
    cb(await fetchAdmin(user.uid));
  });
}
