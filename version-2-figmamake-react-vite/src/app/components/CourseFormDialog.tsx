import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2 } from "lucide-react";
import type { Course, CourseInput } from "../lib/types";
import { COURSE_NAME_OPTIONS, ROOM_OPTIONS, OTHER_VALUE } from "../lib/constants";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: string;
  editing: Course | null;
  onSubmit: (input: CourseInput) => Promise<void>;
  onSubmitMany: (inputs: CourseInput[]) => Promise<void>;
}

function toDateValue(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function parseDate(raw: string): string {
  const t = raw.trim();
  const mdy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  return t;
}

interface ParsedRow {
  courseName: string;
  startDate: string;
  endDate: string;
  instructor: string;
  room: string;
}

function parseRows(text: string): ParsedRow[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const cols = line.split("\t").map((c) => c.trim());
      return {
        courseName: cols[0] ?? "",
        startDate: parseDate(cols[1] ?? ""),
        endDate: parseDate(cols[2] ?? ""),
        instructor: cols[3] ?? "",
        room: cols[4] ?? "",
      };
    })
    .filter((r) => r.courseName);
}

function rowToInput(r: ParsedRow, department: string): CourseInput {
  return {
    courseName: r.courseName,
    department,
    instructor: r.instructor,
    room: r.room,
    startDate: new Date(r.startDate + "T00:00:00"),
    endDate: new Date(r.endDate + "T23:59:59"),
  };
}

const field =
  "border border-[#dadada] rounded-md px-2.5 py-1.5 text-xs w-full focus:outline-none focus:border-[#0033a0] bg-white";

const labelClass = "text-[11px] font-medium text-foreground sm:text-xs";

export function CourseFormDialog({
  open,
  onOpenChange,
  department,
  editing,
  onSubmit,
  onSubmitMany,
}: CourseFormDialogProps) {
  const [nameChoice, setNameChoice] = useState("");
  const [nameOther, setNameOther] = useState("");
  const [instructor, setInstructor] = useState("");
  const [roomChoice, setRoomChoice] = useState("");
  const [roomOther, setRoomOther] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [pastedRows, setPastedRows] = useState<ParsedRow[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPastedRows([]);
    setPasteText("");
    if (editing) {
      const knownName = COURSE_NAME_OPTIONS.includes(editing.courseName);
      setNameChoice(knownName ? editing.courseName : OTHER_VALUE);
      setNameOther(knownName ? "" : editing.courseName);
      setInstructor(editing.instructor ?? "");
      const knownRoom = ROOM_OPTIONS.includes(editing.room);
      setRoomChoice(knownRoom ? editing.room : OTHER_VALUE);
      setRoomOther(knownRoom ? "" : editing.room);
      setStart(toDateValue(editing.startDate));
      setEnd(toDateValue(editing.endDate));
    } else {
      setNameChoice(""); setNameOther("");
      setInstructor("");
      setRoomChoice(""); setRoomOther("");
      setStart(""); setEnd("");
    }
  }, [open, editing]);

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    const rows = parseRows(text);
    setPastedRows(rows);
    setPasteText(text);
    setError(null);
  }

  function removeRow(i: number) {
    setPastedRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleAddAll() {
    if (pastedRows.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmitMany(pastedRows.map((r) => rowToInput(r, department)));
      onOpenChange(false);
    } catch {
      setError("Could not save some courses. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    const courseName = nameChoice === OTHER_VALUE ? nameOther.trim() : nameChoice;
    const room = roomChoice === OTHER_VALUE ? roomOther.trim() : roomChoice;
    if (!courseName || !room || !start || !end) {
      setError("Please fill in all fields.");
      return;
    }
    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T23:59:59");
    if (endDate < startDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ courseName, department, instructor: instructor.trim(), room, startDate, endDate });
      onOpenChange(false);
    } catch {
      setError("Could not save the course. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isEditing = !!editing;
  const hasPaste = pastedRows.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] gap-0 overflow-y-auto rounded-xl p-4 sm:w-full sm:max-w-lg sm:p-5">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-sm sm:text-base">{isEditing ? "Edit Course" : "Add Course"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5">
          {!isEditing && (
            <div className="space-y-1">
              <Label className={labelClass}>Paste from Excel</Label>
              <p className="text-[10px] text-muted-foreground">
                Columns: Course Name · Start · End · Instructor · Room
              </p>
              <textarea
                rows={2}
                placeholder="Click here and paste (Ctrl+V / ⌘V)…"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                onPaste={handlePaste}
                className={`${field} resize-none`}
              />

              {hasPaste && (
                <div className="overflow-hidden rounded-md border border-[#dadada]">
                  <table className="w-full text-[10px]">
                    <thead className="bg-[#f0f4f8] text-muted-foreground">
                      <tr>
                        <th className="px-2 py-1 text-left">Course Name</th>
                        <th className="px-2 py-1 text-left">Start</th>
                        <th className="px-2 py-1 text-left">End</th>
                        <th className="px-2 py-1 text-left">Instructor</th>
                        <th className="px-2 py-1 text-left">Room</th>
                        <th className="px-1 py-1" />
                      </tr>
                    </thead>
                    <tbody>
                      {pastedRows.map((r, i) => (
                        <tr key={i} className="border-t border-[#dadada]">
                          <td className="px-2 py-1">{r.courseName || <span className="text-red-400">—</span>}</td>
                          <td className="px-2 py-1">{r.startDate || <span className="text-red-400">—</span>}</td>
                          <td className="px-2 py-1">{r.endDate || <span className="text-red-400">—</span>}</td>
                          <td className="px-2 py-1">{r.instructor || <span className="text-[#c0c0c0]">—</span>}</td>
                          <td className="px-2 py-1">{r.room || <span className="text-[#c0c0c0]">—</span>}</td>
                          <td className="px-1 py-1">
                            <button onClick={() => removeRow(i)} className="text-[#c0c0c0] hover:text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!isEditing && !hasPaste && (
            <div className="flex items-center gap-2">
              <hr className="flex-1 border-[#dadada]" />
              <span className="text-[10px] text-muted-foreground">or fill manually</span>
              <hr className="flex-1 border-[#dadada]" />
            </div>
          )}

          {!hasPaste && (
            <>
              <div className="space-y-0.5">
                <Label className={labelClass}>Course Name</Label>
                <Select value={nameChoice} onValueChange={setNameChoice}>
                  <SelectTrigger className={field}>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_NAME_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                    <SelectItem value={OTHER_VALUE}>Other…</SelectItem>
                  </SelectContent>
                </Select>
                {nameChoice === OTHER_VALUE && (
                  <Input className={field} placeholder="Enter course name"
                    value={nameOther} onChange={(e) => setNameOther(e.target.value)} />
                )}
              </div>

              <div className="space-y-0.5">
                <Label className={labelClass}>Instructor</Label>
                <Input
                  className={field}
                  placeholder="Enter instructor name"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
              </div>

              <div className="space-y-0.5">
                <Label className={labelClass}>Department</Label>
                <Input value={department} readOnly className={`${field} bg-[#f0f4f8] text-muted-foreground`} />
              </div>

              <div className="space-y-0.5">
                <Label className={labelClass}>Room</Label>
                <Select value={roomChoice} onValueChange={setRoomChoice}>
                  <SelectTrigger className={field}>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                    <SelectItem value={OTHER_VALUE}>Other…</SelectItem>
                  </SelectContent>
                </Select>
                {roomChoice === OTHER_VALUE && (
                  <Input className={field} placeholder="Enter room"
                    value={roomOther} onChange={(e) => setRoomOther(e.target.value)} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="start" className={labelClass}>Start Date</Label>
                  <Input id="start" type="date" className={field}
                    value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="end" className={labelClass}>End Date</Label>
                  <Input id="end" type="date" className={field}
                    value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {error && <p className="text-[11px] text-red-600">{error}</p>}
        </div>

        <DialogFooter className="mt-3 gap-1.5">
          <Button variant="outline" className="h-7 px-3 text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {hasPaste ? (
            <Button
              className="h-7 bg-[#00843D] px-3 text-xs text-white hover:opacity-90"
              onClick={handleAddAll}
              disabled={saving || pastedRows.length === 0}
            >
              {saving ? "Adding…" : `Add ${pastedRows.length} Course${pastedRows.length > 1 ? "s" : ""}`}
            </Button>
          ) : (
            <Button
              className="h-7 bg-[#0033a0] px-3 text-xs text-white hover:opacity-90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Course"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
