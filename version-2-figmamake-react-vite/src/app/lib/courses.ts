// Firestore data access for the `courses` collection (with demo fallback).
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import type { Course, CourseInput } from "./types";
import { mockCourses } from "./mockStore";
import { getStartOfWeek } from "./week";

// Read every course, newest start date first.
export async function fetchCourses(): Promise<Course[]> {
  if (!isFirebaseConfigured) {
    return [...mockCourses].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
  }
  const snap = await getDocs(collection(db, "courses"));
  const courses = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      courseName: data.courseName,
      department: data.department,
      instructor: data.instructor ?? "",
      room: data.room,
      startDate: (data.startDate as Timestamp).toDate(),
      endDate: (data.endDate as Timestamp).toDate(),
      createdBy: data.createdBy,
    } as Course;
  });
  return courses.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export async function addCourse(
  input: CourseInput,
  createdBy: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    mockCourses.push({
      ...input,
      id: `mock-${Date.now()}`,
      createdBy,
    });
    return;
  }
  await addDoc(collection(db, "courses"), {
    courseName: input.courseName,
    department: input.department,
    instructor: input.instructor,
    room: input.room,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    createdBy,
  });
}

export async function updateCourse(
  id: string,
  input: CourseInput
): Promise<void> {
  if (!isFirebaseConfigured) {
    const idx = mockCourses.findIndex((c) => c.id === id);
    if (idx >= 0) mockCourses[idx] = { ...mockCourses[idx], ...input };
    return;
  }
  await updateDoc(doc(db, "courses", id), {
    courseName: input.courseName,
    department: input.department,
    instructor: input.instructor,
    room: input.room,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
  });
}

export async function deleteCourse(id: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const idx = mockCourses.findIndex((c) => c.id === id);
    if (idx >= 0) mockCourses.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "courses", id));
}

// Remove courses whose end date is before the current week began.
export async function purgeExpiredCourses(courses: Course[]): Promise<void> {
  const cutoff = getStartOfWeek();
  const expired = courses.filter((c) => c.endDate < cutoff);
  await Promise.all(expired.map((c) => deleteCourse(c.id)));
}
