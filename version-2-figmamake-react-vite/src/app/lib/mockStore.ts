// In-memory demo store used only when Firebase is not yet configured, so the
// app is fully explorable inside the preview. Once real Firebase credentials
// are added to firebase.ts, all data flows through Firestore instead.
import type { AppUser, Course, AdminUser } from "./types";

const DEMO_ADMIN: AppUser = {
  uid: "demo-admin-uid",
  email: "admin@company.com",
  department: "SDU",
};

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export const mockUsers: AppUser[] = [
  DEMO_ADMIN,
  { uid: "demo-admin-2", email: "sara@company.com", department: "DTU" },
];

export const mockCourses: Course[] = [
  {
    id: "c1",
    courseName: "Workplace Safety Fundamentals",
    department: "SDU",
    instructor: "Maria Nour",
    room: "Room 7",
    startDate: daysFromNow(-1),
    endDate: daysFromNow(2),
    createdBy: DEMO_ADMIN.uid,
  },
  {
    id: "c2",
    courseName: "Advanced Project Management",
    department: "DTU",
    instructor: "James Al-Farsi",
    room: "PC 20",
    startDate: daysFromNow(0),
    endDate: daysFromNow(3),
    createdBy: "demo-admin-2",
  },
  {
    id: "c3",
    courseName: "Effective Communication Skills",
    department: "SDU",
    instructor: "Lena Ibrahim",
    room: "Room 6",
    startDate: daysFromNow(-2),
    endDate: daysFromNow(1),
    createdBy: DEMO_ADMIN.uid,
  },
  {
    id: "c4",
    courseName: "Data Analysis with Excel",
    department: "DTU",
    instructor: "David Chen",
    room: "PC 22",
    startDate: daysFromNow(1),
    endDate: daysFromNow(4),
    createdBy: "demo-admin-2",
  },
  {
    id: "c5",
    courseName: "Leadership Essentials",
    department: "SDU",
    instructor: "Sara Al-Otaibi",
    room: "Room 13",
    startDate: daysFromNow(0),
    endDate: daysFromNow(2),
    createdBy: DEMO_ADMIN.uid,
  },
  {
    id: "c6",
    courseName: "Cybersecurity Awareness",
    department: "DTU",
    instructor: "Khalid Hassan",
    room: "PC 20",
    startDate: daysFromNow(20),
    endDate: daysFromNow(23),
    createdBy: "demo-admin-2",
  },
];

export const DEMO_ADMIN_USER = DEMO_ADMIN;

export const mockAdmins: AdminUser[] = [
  { id: "demo-admin-uid", name: "Alex Johnson", email: "admin@company.com", department: "SDU" },
  { id: "demo-admin-2", name: "Sara Ahmed", email: "sara@company.com", department: "DTU" },
];
