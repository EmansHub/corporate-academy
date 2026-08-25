import { signInAdmin, signOutAdmin, subscribeAdmin } from "./auth.js";
import { fetchCourses, addCourse, updateCourse, deleteCourse, purgeExpiredCourses } from "./courses.js";
import { formatDate, getStartOfWeek, getEndOfWeek } from "./week.js";

const COURSE_NAMES = [
  "Workplace Safety Fundamentals",
  "Advanced Project Management",
  "Effective Communication Skills",
  "Data Analysis with Excel",
  "Leadership Essentials",
  "Cybersecurity Awareness",
  "First Aid & Emergency Response",
];
const ROOMS = [
  "Room 6", "Room 7", "Room 12",
  "PC 20", "PC 21", "PC 22",
];

const ICON_EDIT  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const ICON_TRASH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

const dashView       = document.getElementById("dash-view");
const loginBtn       = document.getElementById("login-btn");
const loginError     = document.getElementById("login-error");
const signoutBtn     = document.getElementById("signout-btn");
const addBtn         = document.getElementById("add-btn");
const courseList     = document.getElementById("course-list");
const dialog         = document.getElementById("course-dialog");
const dialogTitle    = document.getElementById("dialog-title");
const formError      = document.getElementById("form-error");
const pasteArea      = document.getElementById("paste-area");
const pasteSection   = document.getElementById("paste-section");
const previewSection = document.getElementById("preview-section");
const previewBody    = document.getElementById("preview-body");
const manualSection  = document.getElementById("manual-section");
const nameSel        = document.getElementById("name-select");
const nameOther      = document.getElementById("name-other");
const deptInput      = document.getElementById("dept-input");
const deptSelect     = document.getElementById("dept-select");
const instructorInput = document.getElementById("instructor-input");
const roomSel        = document.getElementById("room-select");
const roomOther      = document.getElementById("room-other");
const startInput     = document.getElementById("start-input");
const endInput       = document.getElementById("end-input");
const cancelBtn      = document.getElementById("cancel-btn");
const saveBtn        = document.getElementById("save-btn");

let currentAdmin = null;

let editingId    = null;
let parsedRows   = [];

function fillSelect(sel, values) {
  sel.innerHTML =
    '<option value="" disabled selected>Select…</option>' +
    values.map((v) => `<option value="${v}">${v}</option>`).join("") +
    '<option value="__other__">Other…</option>';
}
fillSelect(nameSel, COURSE_NAMES);
fillSelect(roomSel, ROOMS);

nameSel.addEventListener("change", () => { nameOther.hidden = nameSel.value !== "__other__"; });
roomSel.addEventListener("change", () => { roomOther.hidden = roomSel.value !== "__other__"; });

signoutBtn.addEventListener("click", () => signOutAdmin());

subscribeAdmin((admin) => {
  currentAdmin = admin;

  if (!admin) {
    window.location.href = "index.html";
    return;
  }

  signoutBtn.hidden = false;
  deptInput.value = admin.department;
  render();
});


function parseDate(raw) {
  const t = raw.trim();
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`;
  return t;
}

function parseRows(text) {
  return text.split("\n")
    .map((l) => l.trim()).filter(Boolean)
    .map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      return { 
        courseName: c[0] || "", 
        startDate: parseDate(c[1] || ""), 
        endDate: parseDate(c[2] || ""), 
        instructor: c[3] || "", 
        room: c[4] || "" 
      };
    })
    .filter((r) => r.courseName);
}

function esc(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function renderPreview() {
  if (parsedRows.length === 0) {
    previewSection.hidden = true;
    manualSection.hidden  = false;
    saveBtn.textContent   = editingId ? "Save Changes" : "Add Course";
    saveBtn.style.background = "#0033a0";
    return;
  }
  previewSection.hidden = false;
  manualSection.hidden  = true;
  saveBtn.textContent   = `Add ${parsedRows.length} Course${parsedRows.length > 1 ? "s" : ""}`;
  saveBtn.style.background = "#00843D";
  previewBody.innerHTML = "";
  parsedRows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(r.courseName)}</td>
      <td>${r.startDate}</td>
      <td>${r.endDate}</td>
      <td>${esc(r.instructor) || "—"}</td>
      <td>${esc(r.room) || "—"}</td>
      <td><button class="del-row" data-i="${i}">✕</button></td>`;
    previewBody.appendChild(tr);
  });
  previewBody.querySelectorAll(".del-row").forEach((btn) => {
    btn.addEventListener("click", () => { parsedRows.splice(Number(btn.dataset.i), 1); renderPreview(); });
  });
}

pasteArea.addEventListener("paste", (e) => {
  parsedRows = parseRows(e.clipboardData.getData("text"));
  renderPreview();
  formError.textContent = "";
});
pasteArea.addEventListener("input", () => {
  if (!pasteArea.value.trim()) { parsedRows = []; renderPreview(); }
});

function openDialog(course) {
  editingId = course ? course.id : null;
  parsedRows = [];
  formError.textContent = "";
  dialogTitle.textContent = course ? "Edit Course" : "Add Course";
  pasteArea.value = "";
  pasteSection.hidden   = !!course;
  previewSection.hidden = true;
  manualSection.hidden  = false;
  saveBtn.style.background = "#0033a0";
  if (currentAdmin.department === 'Other') {
    deptInput.hidden = true;
    deptSelect.hidden = false;
    deptSelect.value = course ? course.department : "";
  } else {
    deptInput.hidden = false;
    deptSelect.hidden = true;
    deptInput.value = currentAdmin.department;
  }
  instructorInput.value = course ? (course.instructor || "") : "";
  if (course) {
    const kn = COURSE_NAMES.includes(course.courseName);
    nameSel.value = kn ? course.courseName : "__other__"; nameOther.hidden = kn; nameOther.value = kn ? "" : course.courseName;
    const kr = ROOMS.includes(course.room);
    roomSel.value = kr ? course.room : "__other__"; roomOther.hidden = kr; roomOther.value = kr ? "" : course.room;
    const off = course.startDate.getTimezoneOffset();
    startInput.value = new Date(course.startDate - off * 60000).toISOString().slice(0,10);
    endInput.value   = new Date(course.endDate   - off * 60000).toISOString().slice(0,10);
    saveBtn.textContent = "Save Changes";
  } else {
    nameSel.value = ""; nameOther.value = ""; nameOther.hidden = true;
    roomSel.value = ""; roomOther.value = ""; roomOther.hidden = true;
    startInput.value = ""; endInput.value = "";
    saveBtn.textContent = "Add Course";
  }
  dialog.showModal();
}

cancelBtn.addEventListener("click", () => dialog.close());
addBtn.addEventListener("click",    () => openDialog(null));

saveBtn.addEventListener("click", async () => {
  formError.textContent = "";
  if (parsedRows.length > 0) {
    saveBtn.disabled = true;
    try {
      await Promise.all(parsedRows.map((r) => addCourse({
        courseName: r.courseName, department: currentAdmin.department, instructor: r.instructor, room: r.room,
        startDate: new Date(r.startDate + "T00:00:00"), endDate: new Date(r.endDate + "T23:59:59"),
      }, currentAdmin.email)));
      dialog.close(); render();
    } catch { formError.textContent = "Could not save. Please try again."; }
    finally  { saveBtn.disabled = false; }
    return;
  }
  const courseName = nameSel.value === "__other__" ? nameOther.value.trim() : nameSel.value;
  const room       = roomSel.value === "__other__" ? roomOther.value.trim() : roomSel.value;
  const instructor = instructorInput.value.trim();
  const department = currentAdmin.department === 'Other' ? deptSelect.value : currentAdmin.department;

  if (!courseName || !instructor || !room || !startInput.value || !endInput.value || !department) {
    formError.textContent = "Please fill in all fields."; return;
  }
  const startDate = new Date(startInput.value + "T00:00:00");
  const endDate   = new Date(endInput.value   + "T23:59:59");
  if (endDate < startDate) { formError.textContent = "End date must be on or after the start date."; return; }
  saveBtn.disabled = true;
  try {
  if (editingId)
    await updateCourse(editingId, {
        courseName,
        instructor,
        department,
        room,
        startDate,
        endDate
    });
  else
    await addCourse({
        courseName,
        instructor,
        department,
        room,
        startDate,
        endDate
    }, currentAdmin.email);
    dialog.close(); render();
  } catch { formError.textContent = "Could not save. Please try again."; }
  finally  { saveBtn.disabled = false; }
});

async function render() {
  courseList.innerHTML = '<p class="muted">Loading…</p>';
  await purgeExpiredCourses();
  const courses = await fetchCourses();
  if (courses.length === 0) {
    courseList.innerHTML = '<p class="muted">No courses yet. Add your first course.</p>';
    return;
  }
  const nextWeekStart = getStartOfWeek(new Date(Date.now() + 7 * 86400000));
  const nextWeekEnd   = getEndOfWeek(nextWeekStart);
  const thisWeekEnd   = getEndOfWeek();
  courseList.innerHTML = "";
  courses.forEach((c) => {
    const canManage  = c.department === currentAdmin.department || currentAdmin.department === 'Other';
    const isUpcoming = c.startDate <= nextWeekEnd && c.endDate >= nextWeekStart && c.startDate > thisWeekEnd;
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-body">
        <div class="course-name-row">
          <h3>${esc(c.courseName)}</h3>
          <span class="badge badge-blue">${esc(c.department)}</span>
          ${isUpcoming ? '<span class="badge badge-green">Upcoming week</span>' : ""}
        </div>
<p class="course-meta">
    ${c.instructor ? esc(c.instructor) + " · " : ""}${esc(c.room)} · ${formatDate(c.startDate)} – ${formatDate(c.endDate)}
</p>
      </div>
      ${canManage ? `
      <div class="course-actions">
        <button class="icon-btn edit-btn">${ICON_EDIT}<span class="btn-label">Edit</span></button>
        <button class="icon-btn danger del-btn">${ICON_TRASH}<span class="btn-label">Delete</span></button>
      </div>` : ""}`;
    if (canManage) {
      card.querySelector(".edit-btn").addEventListener("click", () => openDialog(c));
      card.querySelector(".del-btn").addEventListener("click", async () => {
        if (confirm(`Delete "${c.courseName}"? This cannot be undone.`)) { await deleteCourse(c.id); render(); }
      });
    }
    courseList.appendChild(card);
  });
}
