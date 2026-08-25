import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import type { AdminUser, AdminInput } from "./types";
import { mockAdmins } from "./mockStore";

export async function fetchAdmins(): Promise<AdminUser[]> {
  if (!isFirebaseConfigured) {
    return [...mockAdmins];
  }
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "",
      email: data.email ?? "",
      department: data.department ?? "",
    } as AdminUser;
  });
}

export async function addAdmin(input: AdminInput): Promise<void> {
  if (!isFirebaseConfigured) {
    mockAdmins.push({ id: `mock-${Date.now()}`, ...input });
    return;
  }
  await addDoc(collection(db, "users"), {
    name: input.name,
    email: input.email,
    department: input.department,
  });
}

export async function updateAdmin(id: string, input: AdminInput): Promise<void> {
  if (!isFirebaseConfigured) {
    const idx = mockAdmins.findIndex((a) => a.id === id);
    if (idx >= 0) mockAdmins[idx] = { ...mockAdmins[idx], ...input };
    return;
  }
  await updateDoc(doc(db, "users", id), {
    name: input.name,
    email: input.email,
    department: input.department,
  });
}

export async function deleteAdmin(id: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const idx = mockAdmins.findIndex((a) => a.id === id);
    if (idx >= 0) mockAdmins.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "users", id));
}
