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
import type { AdminUser, AdminInput } from "../lib/types";
import { DEPARTMENT_OPTIONS, OTHER_VALUE } from "../lib/constants";

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminUser | null;
  onSubmit: (input: AdminInput) => Promise<void>;
}

const field =
  "border border-[#dadada] rounded-md px-2.5 py-1.5 text-xs w-full focus:outline-none focus:border-[#0033a0] bg-white";

const labelClass = "text-[11px] font-medium text-foreground sm:text-xs";

export function AdminFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: AdminFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deptChoice, setDeptChoice] = useState("");
  const [deptOther, setDeptOther] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setName(editing.name);
      setEmail(editing.email);
      const known = DEPARTMENT_OPTIONS.includes(editing.department);
      setDeptChoice(known ? editing.department : OTHER_VALUE);
      setDeptOther(known ? "" : editing.department);
    } else {
      setName("");
      setEmail("");
      setDeptChoice("");
      setDeptOther("");
    }
  }, [open, editing]);

  async function handleSave() {
    const department = deptChoice === OTHER_VALUE ? deptOther.trim() : deptChoice;
    if (!name.trim() || !email.trim() || !department) {
      setError("Please fill in all fields.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), department });
      onOpenChange(false);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] gap-0 overflow-y-auto rounded-xl p-4 sm:w-full sm:max-w-md sm:p-5">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-sm sm:text-base">
            {editing ? "Edit Admin" : "Add Admin"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5">
          <div className="space-y-0.5">
            <Label className={labelClass}>Name</Label>
            <Input
              className={field}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-0.5">
            <Label className={labelClass}>Email</Label>
            <Input
              type="email"
              className={field}
              placeholder="email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-0.5">
            <Label className={labelClass}>Department</Label>
            <Select value={deptChoice} onValueChange={setDeptChoice}>
              <SelectTrigger className={field}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
                <SelectItem value={OTHER_VALUE}>Other…</SelectItem>
              </SelectContent>
            </Select>
            {deptChoice === OTHER_VALUE && (
              <Input
                className={field}
                placeholder="Enter department"
                value={deptOther}
                onChange={(e) => setDeptOther(e.target.value)}
              />
            )}
          </div>

          {error && <p className="text-[11px] text-red-600">{error}</p>}
        </div>

        <DialogFooter className="mt-3 gap-1.5">
          <Button
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-7 bg-[#0033a0] px-3 text-xs text-white hover:opacity-90"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Add Admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
