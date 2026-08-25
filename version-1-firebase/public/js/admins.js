import { subscribeAdmin, signOutAdmin } from "./auth.js";
import {
  collection, getDocs, setDoc, updateDoc, deleteDoc, doc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase.js";

const DEPARTMENTS = ["SDU", "DSU", "Other"];

const ICON_EDIT  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const ICON_TRASH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
const ICON_CHEVRON_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
const ICON_CHEVRON_UP   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;

const loginView   = document.getElementById("login-view");
const pageView    = document.getElementById("page-view");
const signoutBtn  = document.getElementById("signout-btn");
const adminList   = document.getElementById("admin-list");
const addBtn      = document.getElementById("add-btn");
const dialog      = document.getElementById("admin-dialog");
const dialogTitle = document.getElementById("dialog-title");
const formError   = document.getElementById("form-error");
const nameInput   = document.getElementById("name-input");
const emailInput  = document.getElementById("email-input");
const deptSel     = document.getElementById("dept-select");
const cancelBtn   = document.getElementById("cancel-btn");
const saveBtn     = document.getElementById("save-btn");

let editingId = null;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// Populate department select
deptSel.innerHTML =
  '<option value="" disabled selected>Select department…</option>' +
  DEPARTMENTS.map((d) => `<option value="${d}">${d}</option>`).join("");

signoutBtn.addEventListener("click", () => signOutAdmin());

subscribeAdmin((admin) => {
  if (admin) {
    loginView.hidden = true;
    pageView.hidden  = false;
    signoutBtn.hidden = false;
    render();
  } else {
    window.location.href = "admin.html";
  }
});

async function fetchAdmins() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function render() {
  adminList.innerHTML = '<p class="muted">Loading…</p>';
  const admins = await fetchAdmins();

  if (admins.length === 0) {
    adminList.innerHTML = '<p class="muted">No admins yet.</p>';
    return;
  }

  adminList.innerHTML = "";

  // Mobile: expandable cards
  const mobileList = document.createElement("div");
  mobileList.className = "admin-mobile-list";
  admins.forEach((a) => {
    const row = document.createElement("div");
    row.className = "admin-mobile-row";
    row.innerHTML = `
      <button class="admin-row-toggle">
        <span class="admin-row-name">${esc(a.name || "—")}</span>
        <div class="admin-row-right">
          <span class="badge badge-blue">${esc(a.department || "—")}</span>
          <span class="chevron">${ICON_CHEVRON_DOWN}</span>
        </div>
      </button>
      <div class="admin-row-detail" hidden>
        <p class="admin-detail-line"><strong>Email:</strong> ${esc(a.id || "—")}</p>
        <p class="admin-detail-line"><strong>Department:</strong> ${esc(a.department || "—")}</p>
        <div class="admin-detail-actions">
          <button class="icon-btn edit-btn">${ICON_EDIT} Edit</button>
          <button class="icon-btn danger del-btn">${ICON_TRASH} Delete</button>
        </div>
      </div>`;
    const toggle = row.querySelector(".admin-row-toggle");
    const detail = row.querySelector(".admin-row-detail");
    const chevron = row.querySelector(".chevron");
    toggle.addEventListener("click", () => {
      detail.hidden = !detail.hidden;
      chevron.innerHTML = detail.hidden ? ICON_CHEVRON_DOWN : ICON_CHEVRON_UP;
    });
    row.querySelector(".edit-btn").addEventListener("click", () => openDialog(a));
    row.querySelector(".del-btn").addEventListener("click", () => confirmDelete(a));
    mobileList.appendChild(row);
  });
  adminList.appendChild(mobileList);

  // Desktop: table
  const tableWrap = document.createElement("div");
  tableWrap.className = "admin-table-wrap";
  tableWrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Department</th><th></th>
        </tr>
      </thead>
      <tbody>${admins.map((a, i) => `
        <tr class="${i % 2 === 1 ? "alt-row" : ""}">
          <td class="td-name">${esc(a.name || "—")}</td>
          <td class="td-muted">${esc(a.id || "—")}</td>
          <td><span class="badge badge-blue">${esc(a.department || "—")}</span></td>
          <td class="td-actions">
            <button class="icon-btn edit-btn" data-id="${a.id}">${ICON_EDIT}<span class="btn-label">Edit</span></button>
            <button class="icon-btn danger del-btn" data-id="${a.id}">${ICON_TRASH}<span class="btn-label">Delete</span></button>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;
  admins.forEach((a) => {
    tableWrap.querySelector(`.edit-btn[data-id="${a.id}"]`).addEventListener("click", () => openDialog(a));
    tableWrap.querySelector(`.del-btn[data-id="${a.id}"]`).addEventListener("click", () => confirmDelete(a));
  });
  adminList.appendChild(tableWrap);
}

async function confirmDelete(a) {
  if (confirm(`Remove "${a.name}"? They will lose dashboard access.`)) {
    await deleteDoc(doc(db, "users", a.id));
    render();
  }
}

function openDialog(admin = null) {
  editingId = admin ? admin.id : null;

  dialogTitle.textContent = admin ? "Edit Admin" : "Add Admin";
  formError.textContent = "";

  nameInput.value = admin ? admin.name || "" : "";
  emailInput.value = admin ? admin.id : "";
  deptSel.value = admin ? admin.department : "";

  dialog.showModal();
}

addBtn.addEventListener("click", () => openDialog(null));
cancelBtn.addEventListener("click", () => dialog.close());

saveBtn.addEventListener("click", async () => {
  formError.textContent = "";
  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  const department = deptSel.value;
  if (!name || !email || !department) {
    formError.textContent = "Please fill in all fields."; return;
  }
  saveBtn.disabled = true;
  try {
    if (editingId) {

    await setDoc(doc(db, "users", email), {
        name,
        department
    });

    if (editingId !== email) {
        await deleteDoc(doc(db, "users", editingId));
    }

    } else {

    await setDoc(doc(db, "users", email), {
        name,
        department
    });

    }
    
    dialog.close();
    render();
  } catch { formError.textContent = "Could not save. Please try again."; }
  finally  { saveBtn.disabled = false; }
});