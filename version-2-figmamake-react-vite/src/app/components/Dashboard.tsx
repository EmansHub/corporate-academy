import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { CourseFormDialog } from "./CourseFormDialog";
import type { AppUser, Course, CourseInput } from "../lib/types";
import {
  fetchCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  purgeExpiredCourses,
} from "../lib/courses";
import { formatDate, getStartOfWeek, getEndOfWeek } from "../lib/week";

export function Dashboard({ admin, onManageAdmins }: { admin: AppUser; onManageAdmins: () => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  async function load() {
    const all = await fetchCourses();
    await purgeExpiredCourses(all);
    setCourses(await fetchCourses());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(input: CourseInput) {
    if (editing) {
      await updateCourse(editing.id, input);
    } else {
      await addCourse(input, admin.uid);
    }
    await load();
  }

  async function handleSubmitMany(inputs: CourseInput[]) {
    await Promise.all(inputs.map((input) => addCourse(input, admin.uid)));
    await load();
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteCourse(deleting.id);
    setDeleting(null);
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <h1 className="w-full text-sm font-semibold text-foreground sm:w-auto sm:text-xl">Course Dashboard</h1>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            className="h-7 bg-[#00843D] px-2.5 text-xs text-white hover:opacity-90 sm:h-9 sm:px-4 sm:text-sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add Course
          </Button>
          <Button
            variant="outline"
            className="h-7 px-2.5 text-xs sm:h-9 sm:px-4 sm:text-sm"
            onClick={onManageAdmins}
          >
            <Users className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Manage Admins
          </Button>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground sm:mt-3 sm:text-sm">
        All departments shown. You can only edit{" "}
        <span className="font-medium text-foreground">{admin.department}</span>{" "}
        courses.
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : courses.length === 0 ? (
        <Card className="mt-6 p-10 text-center text-muted-foreground">
          No courses yet. Add your first course to get started.
        </Card>
      ) : (
        <div className="mt-2 space-y-1.5 sm:mt-4 sm:space-y-2.5">
          {courses.map((c) => {
            const canManage = c.department === admin.department;
            const nextWeekStart = getStartOfWeek(new Date(Date.now() + 7 * 86400000));
            const nextWeekEnd = getEndOfWeek(nextWeekStart);
            const isUpcoming =
              c.startDate <= nextWeekEnd &&
              c.endDate >= nextWeekStart &&
              c.startDate > getEndOfWeek();
            return (
              <Card
                key={c.id}
                className="relative p-3 sm:p-5"
              >
                {/* Icons pinned top-right, don't affect text flow */}
                {canManage && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 sm:right-5 sm:top-5 sm:gap-1.5">
                    <button
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[#5f6369] hover:bg-[#f0f4f8] hover:text-[#0033a0] sm:border sm:border-border sm:px-2.5 sm:py-1"
                      onClick={() => { setEditing(c); setFormOpen(true); }}
                    >
                      <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden text-xs font-medium sm:inline">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[#5f6369] hover:bg-[#f0f4f8] hover:text-destructive sm:border sm:border-border sm:px-2.5 sm:py-1"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden text-xs font-medium sm:inline">Delete</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-0">
                  {/* Course name + dept badge inline */}
                  <div className="flex flex-wrap items-center gap-1.5 pr-14 sm:pr-24">
                    <h3 className="text-xs font-semibold leading-snug text-foreground sm:text-base">
                      {c.courseName}
                    </h3>
                    <span className="rounded-full bg-[#e6ecf8] px-2 py-0.5 text-[10px] font-medium text-[#0033a0]">
                      {c.department}
                    </span>
                    {isUpcoming && (
                      <span className="rounded-full bg-[#e8f5e9] px-2 py-0.5 text-[10px] font-medium text-[#00843D]">
                        Upcoming week
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-none text-muted-foreground sm:text-xs">
                    {c.instructor && <>{c.instructor} · </>}{c.room} · {formatDate(c.startDate)} – {formatDate(c.endDate)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={admin.department}
        editing={editing}
        onSubmit={handleSubmit}
        onSubmitMany={handleSubmitMany}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.courseName}" will be permanently removed. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
