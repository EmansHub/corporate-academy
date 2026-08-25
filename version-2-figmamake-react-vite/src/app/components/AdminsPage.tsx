import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
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
import { AdminFormDialog } from "./AdminFormDialog";
import type { AdminUser, AdminInput } from "../lib/types";
import { fetchAdmins, addAdmin, updateAdmin, deleteAdmin } from "../lib/admins";

interface AdminsPageProps {
  onManageCourses: () => void;
}

function MobileRow({ a, onEdit, onDelete }: {
  a: AdminUser;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-semibold text-foreground">{a.name}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#e6ecf8] px-2 py-0.5 text-[10px] font-medium text-[#0033a0]">
            {a.department}
          </span>
          {open
            ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          }
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-3 pb-2.5 pt-2">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Email:</span> {a.email}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Department:</span> {a.department}
          </p>
          <div className="mt-2 flex gap-1.5">
            <button
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#5f6369] hover:bg-[#f0f4f8] hover:text-[#0033a0]"
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#5f6369] hover:bg-[#f0f4f8] hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminsPage({ onManageCourses }: AdminsPageProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  async function load() {
    setAdmins(await fetchAdmins());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(input: AdminInput) {
    if (editing) await updateAdmin(editing.id, input);
    else await addAdmin(input);
    await load();
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteAdmin(deleting.id);
    setDeleting(null);
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-8">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <h1 className="w-full text-sm font-semibold text-foreground sm:w-auto sm:text-xl">Manage Admins</h1>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            className="h-7 bg-[#00843D] px-2.5 text-xs text-white hover:opacity-90 sm:h-9 sm:px-4 sm:text-sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add Admin
          </Button>
          <Button
            variant="outline"
            className="h-7 px-2.5 text-xs sm:h-9 sm:px-4 sm:text-sm"
            onClick={onManageCourses}
          >
            <BookOpen className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Manage Courses
          </Button>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground sm:mt-3 sm:text-sm">
        All registered administrators. Add, edit, or remove access here.
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : admins.length === 0 ? (
        <div className="mt-4 rounded-xl border border-border bg-white p-8 text-center text-xs text-muted-foreground">
          No admins yet. Add the first administrator.
        </div>
      ) : (
        <>
          {/* Mobile: expandable cards */}
          <div className="mt-2 space-y-1.5 sm:hidden">
            {admins.map((a) => (
              <MobileRow
                key={a.id}
                a={a}
                onEdit={() => { setEditing(a); setFormOpen(true); }}
                onDelete={() => setDeleting(a)}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-border bg-white sm:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f8f9fc]">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Department</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-border last:border-0 hover:bg-[#f8f9fc] ${i % 2 === 1 ? "bg-[#fafafa]" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{a.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.email}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-[#e6ecf8] px-2 py-0.5 text-[10px] font-medium text-[#0033a0]">
                        {a.department}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs font-medium text-[#5f6369] hover:bg-[#f0f4f8] hover:text-[#0033a0]"
                          onClick={() => { setEditing(a); setFormOpen(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs font-medium text-[#5f6369] hover:bg-[#f0f4f8] hover:text-red-600"
                          onClick={() => setDeleting(a)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AdminFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this admin?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" will lose dashboard access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
