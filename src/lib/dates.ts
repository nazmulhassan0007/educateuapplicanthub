import type { Application } from "../data/types";
import { cOf, expectedBy, isActive, openTasks } from "./app";
import { daysUntil } from "./date";

export interface KeyDate {
  id: string;
  date: string;
  label: string;
  where: string;
  href: string;
  kind: "task" | "booking" | "offer" | "decision" | "start";
}

export function keyDates(apps: Application[], days = 60): KeyDate[] {
  const out: KeyDate[] = [];
  for (const a of apps.filter(isActive)) {
    const c = cOf(a);
    for (const t of openTasks(a)) {
      if (t.kind === "respond") continue;
      out.push({ id: t.id, date: t.due, label: t.title, where: c.institution, href: `/applications/${a.id}?tab=tasks`, kind: "task" });
    }
    if (a.booking) out.push({ id: a.id + "b", date: a.booking.at, label: `${a.booking.type}, ${a.booking.format.toLowerCase()}`, where: c.institution, href: `/applications/${a.id}`, kind: "booking" });
    if (a.offer && !a.offer.response) out.push({ id: a.id + "o", date: a.offer.deadline, label: "Offer response deadline", where: c.institution, href: "/offers", kind: "offer" });
    const e = expectedBy(a);
    if (e && !a.booking) out.push({ id: a.id + "e", date: e, label: "Decision expected", where: c.institution, href: `/applications/${a.id}`, kind: "decision" });
    if (a.stage === 5) out.push({ id: a.id + "s", date: c.startDates[a.intake], label: "Course starts", where: c.institution, href: `/applications/${a.id}`, kind: "start" });
  }
  return out.filter((k) => daysUntil(k.date) >= 0 && daysUntil(k.date) <= days).sort((x, y) => x.date.localeCompare(y.date));
}
