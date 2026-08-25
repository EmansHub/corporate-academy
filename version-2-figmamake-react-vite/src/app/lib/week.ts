// Week helpers. The display week runs Sunday -> Saturday.

export function getStartOfWeek(ref: Date = new Date()): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // getDay(): Sunday = 0
  return d;
}

export function getEndOfWeek(ref: Date = new Date()): Date {
  const start = getStartOfWeek(ref);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

// A course shows this week when: startDate <= endOfWeek AND endDate >= startOfWeek
export function overlapsThisWeek(startDate: Date, endDate: Date): boolean {
  return startDate <= getEndOfWeek() && endDate >= getStartOfWeek();
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWeekRange(ref: Date = new Date()): string {
  const start = getStartOfWeek(ref);
  const end = getEndOfWeek(ref);
  return `${formatDate(start)} – ${formatDate(end)}`;
}
