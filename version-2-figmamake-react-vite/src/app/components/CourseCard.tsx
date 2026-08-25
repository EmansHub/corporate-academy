import { MapPin, Building2, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import type { Course } from "../lib/types";
import { formatDate } from "../lib/week";

// Compact, read-only course card used on the public display.
export function CourseCard({ course }: { course: Course }) {
  const now = new Date();
  const isLive = course.startDate <= now && course.endDate >= now;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-foreground">{course.courseName}</h3>
        {isLive && (
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            In progress
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#0033a0]" />
          {course.department}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#0033a0]" />
          {course.room}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#0033a0]" />
          {formatDate(course.startDate)} – {formatDate(course.endDate)}
        </p>
      </div>
    </Card>
  );
}
