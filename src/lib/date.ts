// The prototype treats this as "today" so the seeded dates in the requirements read correctly.
export const NOW = new Date("2026-10-07T09:12:00");

const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function d(iso: string) {
  return new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
}
export function fmt(iso: string, withYear = true) {
  const x = d(iso);
  return `${x.getDate()} ${M[x.getMonth()]}${withYear ? " " + x.getFullYear() : ""}`;
}
export function fmtShort(iso: string) {
  return fmt(iso, false);
}
export function fmtTime(iso: string) {
  const x = d(iso);
  return `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
}
export function fmtDateTime(iso: string) {
  return `${fmt(iso)}, ${fmtTime(iso)}`;
}
export function daysUntil(iso: string) {
  const a = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()).getTime();
  const x = d(iso);
  const b = new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}
export function addDays(iso: string, n: number) {
  const x = d(iso);
  x.setDate(x.getDate() + n);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
export function nowIso() {
  return NOW.toISOString().slice(0, 19);
}
export function dueLabel(iso: string) {
  const n = daysUntil(iso);
  if (n < 0) return `Overdue, was due ${fmtShort(iso)}`;
  if (n === 0) return "Due today";
  if (n === 1) return "Due tomorrow";
  if (n <= 7) return `Due in ${n} days`;
  return `Due ${fmtShort(iso)}`;
}
export function greeting() {
  const h = NOW.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
