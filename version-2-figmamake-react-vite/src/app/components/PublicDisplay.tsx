import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, User, MapPin, CalendarRange } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import buildingImg from "@/imports/buildingg.jpg";
import type { Course } from "../lib/types";
import { fetchCourses, purgeExpiredCourses } from "../lib/courses";
import { overlapsThisWeek } from "../lib/week";

function fmt(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function CourseCard({ c }: { c: Course }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/50 bg-white/30 px-4 py-4 shadow-sm backdrop-blur-md">

      {/* Department badge */}
      <div className="flex justify-center">
        <span className="rounded-full bg-[#0033a0]/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#0033a0]">
          {c.department}
        </span>
      </div>

      {/* Course name — centrepiece */}
      <h2 className="mt-2 text-center text-base font-bold leading-snug text-[#1a1a2e] sm:text-lg">
        {c.courseName}
      </h2>

      {/* Divider */}
      <div className="mx-auto mt-3 h-px w-8 rounded-full bg-[#0033a0]/20" />

      {/* Meta info */}
      <div className="mt-3 space-y-1.5">
        {c.instructor && (
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6ecf8]">
              <User className="h-3 w-3 text-[#0033a0]" />
            </span>
            <span className="text-[11px] text-[#323232]">{c.instructor}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9]">
            <MapPin className="h-3 w-3 text-[#00843D]" />
          </span>
          <span className="text-[11px] text-[#323232]">{c.room}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6ecf8]">
            <CalendarRange className="h-3 w-3 text-[#0033a0]" />
          </span>
          <span className="text-[11px] text-[#5f6369]">
            {fmt(c.startDate)}
            <span className="mx-1 text-[#c0c0c0]">→</span>
            {fmt(c.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PublicDisplay({ onBack }: { onBack: () => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await fetchCourses();
      await purgeExpiredCourses(all);
      setCourses(all.filter((c) => overlapsThisWeek(c.startDate, c.endDate)));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">

      {/* Building — faded watermark */}
      <ImageWithFallback
        src={buildingImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-full w-full object-cover object-right opacity-[0.18]"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-8 sm:py-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-1 h-7 self-start px-2 text-xs text-[#5f6369] hover:bg-[#f0f4f8] hover:text-[#323232] sm:h-9 sm:px-3 sm:text-sm"
          onClick={onBack}
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back
        </Button>

        <h1 className="mb-5 text-base font-semibold text-[#323232] sm:mb-7 sm:text-2xl">
          Courses This Week
        </h1>

        {loading ? (
          <div className="flex items-center gap-2 text-[#5f6369]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : courses.length === 0 ? (
          <p className="text-sm text-[#5f6369]">No courses scheduled this week.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
