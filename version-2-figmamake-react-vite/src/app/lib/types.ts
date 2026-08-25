// Shared domain types for the app.

export interface AppUser {
  uid: string;
  email: string;
  department: string;
}

export interface Course {
  id: string;
  courseName: string;
  department: string;
  instructor: string;
  room: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
}

// Payload used when creating/updating a course from the admin form.
export interface CourseInput {
  courseName: string;
  department: string;
  instructor: string;
  room: string;
  startDate: Date;
  endDate: Date;
}
