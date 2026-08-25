export function getStartOfWeek(ref = new Date()) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getEndOfWeek(ref = new Date()) {
  const start = getStartOfWeek(ref);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function overlapsThisWeek(startDate, endDate) {
  return startDate <= getEndOfWeek() && endDate >= getStartOfWeek();
}

export function formatDate(d) {
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
}