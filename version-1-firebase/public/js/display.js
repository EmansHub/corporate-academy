import { fetchCourses, purgeExpiredCourses } from "./courses.js";
import { overlapsThisWeek, formatDate } from "./week.js";

const grid  = document.getElementById("card-grid");
const state = document.getElementById("state");

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* Inline SVG icons — matches lucide-react icons used in the React component */
const ICON_USER = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const ICON_PIN  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const ICON_CAL  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

function buildCard(c) {
  const card = document.createElement("div");
  card.className = "course-card";
  card.innerHTML = `
    <div class="card-badge">${esc(c.department)}</div>
    <h2 class="card-name">${esc(c.courseName)}</h2>
    <div class="card-divider"></div>
    <div class="card-meta">
      ${c.instructor ? `
      <div class="card-row">
        <span class="card-icon card-icon--blue">${ICON_USER}</span>
        <span class="card-text">${esc(c.instructor)}</span>
      </div>` : ""}
      <div class="card-row">
        <span class="card-icon card-icon--green">${ICON_PIN}</span>
        <span class="card-text">${esc(c.room)}</span>
      </div>
      <div class="card-row">
        <span class="card-icon card-icon--blue">${ICON_CAL}</span>
        <span class="card-text card-dates">${formatDate(c.startDate)}<span class="card-arrow">→</span>${formatDate(c.endDate)}</span>
      </div>
    </div>`;
  return card;
}

(async () => {
  try {
    await purgeExpiredCourses();
    const all = await fetchCourses();
    const week = all.filter((c) => overlapsThisWeek(c.startDate, c.endDate));
    state.hidden = true;

    if (week.length === 0) {
      state.hidden = false;
      state.textContent = "No courses scheduled this week.";
      return;
    }

    week.forEach((c) => grid.appendChild(buildCard(c)));
  } catch {
    state.hidden = false;
    state.textContent = "Could not load courses. Please try again later.";
  }
})();