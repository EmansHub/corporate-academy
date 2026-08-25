import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { getStartOfWeek } from "./week.js";

export async function fetchCourses() {
  const snap = await getDocs(collection(db, "courses"));
  const courses = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      courseName: data.courseName,
      department: data.department,
      room: data.room,
      instructor: data.instructor || "",
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdBy: data.createdBy,     
    };
  });
  return courses.sort((a, b) => a.startDate - b.startDate);
}

export function addCourse(input, createdBy) {
  return addDoc(collection(db, "courses"), {
    courseName: input.courseName,
    department: input.department,
    room: input.room,
    instructor: input.instructor,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    //createdBy,               Optional until auth. 
    createdBy: createdBy ?? null,
  });
}

export function updateCourse(id, input) {
  return updateDoc(doc(db, "courses", id), {
    courseName: input.courseName,
    department: input.department,
    room: input.room,
    instructor: input.instructor,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
  });
}

export function deleteCourse(id) {
  return deleteDoc(doc(db, "courses", id));
}

export async function purgeExpiredCourses() {
  // 1. Get today's local date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // 2. Fetch the tracking document from Firestore
    const statusRef = doc(db, "system", "status");
    const statusSnap = await getDoc(statusRef);

    if (statusSnap.exists()) {
      const data = statusSnap.data();
      // If a deletion already occurred today, exit immediately! Saves network traffic.
      if (data.lastPurgeDate === todayStr) {
        console.log("Cleanup already completed today. Skipping.");
        return;
      }
    }

    // 3. If we reached this point, it's a new day! Run the cleanup process.
    console.log("First login of the day. Purging expired courses...");
    const courses = await fetchCourses();
    const cutoff = getStartOfWeek(); // Sunday 00:00:00

    // Filter and delete courses that ended before this week started
    await Promise.all(
      courses
        .filter(course => course.endDate < cutoff)
        .map(course => deleteCourse(course.id))
    );

    // 4. Update the tracking document so nobody else runs this deletion today
    await setDoc(statusRef, { lastPurgeDate: todayStr }, { merge: true });

  } catch (error) {
    console.error("Error during daily course purge processing:", error);
  }
}