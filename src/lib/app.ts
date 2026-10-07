import { course } from "../data/courses";
import type { Application, SectionKey, Stage } from "../data/types";
import { daysUntil, fmt, fmtDateTime, fmtShort } from "./date";

export const STAGES: { n: Stage; label: string; short: string }[] = [
  { n: 1, label: "Draft", short: "Draft" },
  { n: 2, label: "Submitted", short: "Submitted" },
  { n: 3, label: "Admission review", short: "Review" },
  { n: 4, label: "Decision", short: "Decision" },
  { n: 5, label: "Ready to enrol", short: "Enrol" },
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  about: "About you",
  quals: "Qualifications",
  statement: "Personal statement",
  references: "References",
  documents: "Documents",
  review: "Review",
};

export const UNSUCCESSFUL_MESSAGE = "Unfortunately, your application has not been successful on this occasion.";

export const isClosed = (a: Application) => !!a.outcome;
export const isDraft = (a: Application) => a.stage === 1 && !a.outcome;
export const isActive = (a: Application) => !a.outcome && a.stage > 1;
export const cOf = (a: Application) => course(a.courseId);

export function sectionsFor(a: { courseId: string }): SectionKey[] {
  const c = course(a.courseId);
  const base: SectionKey[] = ["about", "quals", "statement"];
  if (c.references > 0) base.push("references");
  base.push("documents", "review");
  return base;
}

export const outcomeLabel: Record<NonNullable<Application["outcome"]>, string> = {
  withdrawn: "Withdrawn",
  unsuccessful: "Unsuccessful",
  declined: "Offer declined",
  expired: "Offer expired",
};

export function respondTask(a: Application) {
  if (a.outcome || !a.offer || a.offer.response) return null;
  return {
    id: `respond-${a.id}`,
    kind: "respond" as const,
    title: `Respond to your ${a.offer.type} offer`,
    detail: `${cOf(a).title} at ${cOf(a).institution}. ${a.offer.type === "conditional" ? "Choose whether to accept it as your main or insurance choice." : "Accepting an unconditional offer confirms your place."}`,
    due: a.offer.deadline,
    appId: a.id,
  };
}

export function openTasks(a: Application) {
  if (a.outcome) return [];
  const own = a.tasks.filter((t) => !t.done).map((t) => ({ ...t, appId: a.id }));
  const r = respondTask(a);
  return [...(r ? [r] : []), ...own].sort((x, y) => x.due.localeCompare(y.due));
}

export function actionNeeded(a: Application): string | null {
  if (a.outcome || a.stage === 1 || a.stage === 5) return null;
  const t = openTasks(a)[0];
  if (!t) return null;
  if (t.kind === "respond") return `Respond to your offer by ${fmtShort(t.due)}`;
  if (t.kind === "reference") return "Your reference has not arrived";
  if (t.kind === "insurance") return "Choose what happens to your insurance offer";
  return t.title.charAt(0).toLowerCase() + t.title.slice(1).replace(/^./, (c) => c);
}

export function statusLabel(a: Application, done?: number): string {
  const c = cOf(a);
  if (a.outcome === "withdrawn") return `Withdrawn on ${fmt(a.closedAt!)}`;
  if (a.outcome === "unsuccessful") return "Unsuccessful";
  if (a.outcome === "declined") return `Offer declined on ${fmt(a.closedAt!)}`;
  if (a.outcome === "expired") return `Offer expired on ${fmt(a.closedAt!)}`;
  if (a.stage === 1) return `Not submitted: ${done ?? a.sectionsDone.length} of ${sectionsFor(a).length} sections complete`;
  if (a.stage === 5) return `Place confirmed at ${c.institution}. Starts ${fmt(c.startDates[a.intake])}.`;
  if (a.stage === 4 && a.offer) {
    const o = a.offer;
    if (!o.response) return `${o.type === "conditional" ? "Conditional" : "Unconditional"} offer: respond by ${fmtShort(o.deadline)}`;
    if (o.response === "main") return "Accepted as main choice. Waiting on conditions";
    if (o.response === "insurance") return "Accepted as insurance choice. Waiting on conditions";
  }
  const an = actionNeeded(a);
  if (an) return `Action needed: ${an}`;
  if (a.stage === 3 && a.booking) return `${a.booking.type} booked: ${fmtShort(a.booking.at)}, ${fmtDateTime(a.booking.at).split(", ")[1]}, ${a.booking.format.toLowerCase()}`;
  if (a.stage === 2) return `Submitted on ${fmtShort(a.stageDates[2]!)}. ${decisionText(a)}`;
  return `We're reviewing your application. ${decisionText(a)}`;
}

export function expectedBy(a: Application): string | null {
  if (a.stage !== 2 && a.stage !== 3) return null;
  if (a.decisionBy) return a.decisionBy;
  const sub = a.stageDates[2] ?? a.submittedAt;
  if (!sub) return null;
  const x = new Date(sub + "T12:00:00");
  x.setDate(x.getDate() + cOf(a).turnaroundDays);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export function decisionText(a: Application) {
  const e = expectedBy(a);
  if (!e) return "";
  return daysUntil(e) < 0 ? "Taking longer than expected. We will email you when there is news." : `Decision expected by ${fmtShort(e)}.`;
}

/** What the tracker should show for each of the five stages. */
export type StepState = "done" | "current" | "todo" | "action" | "closed";
export function trackerStates(a: Application): StepState[] {
  const out: StepState[] = [];
  const closedAt = a.outcome ? (a.stage as number) : 0;
  for (let n = 1; n <= 5; n++) {
    if (a.outcome) {
      if (n < closedAt) out.push("done");
      else if (n === closedAt) out.push("closed");
      else out.push("todo");
      continue;
    }
    if (n < a.stage) out.push("done");
    else if (n === a.stage) out.push(a.stage === 5 ? "done" : actionNeeded(a) ? "action" : "current");
    else out.push("todo");
  }
  return out;
}

export function trackerSummary(a: Application) {
  if (a.outcome) return `${outcomeLabel[a.outcome]}. Closed at step ${a.stage} of 5: ${STAGES[a.stage - 1].label}.`;
  const an = actionNeeded(a);
  return `Step ${a.stage} of 5: ${STAGES[a.stage - 1].label}${an ? ", action needed" : ""}.`;
}

export function submittedCount(apps: Application[], intake: string) {
  return apps.filter((a) => a.intake === intake && a.stage >= 2).length;
}

export function holdsAcceptedOffer(apps: Application[]) {
  return apps.some((a) => !a.outcome && (a.offer?.response || a.stage === 5));
}

export function liveOffers(apps: Application[]) {
  return apps.filter((a) => !a.outcome && a.stage === 4 && a.offer && !a.offer.response);
}

export function nextIntakeFor(a: Application) {
  return a.intake;
}

export function sortApps(list: Application[], by: "updated" | "intake" | "name") {
  const s = [...list];
  if (by === "updated") return s.sort((x, y) => y.updatedAt.localeCompare(x.updatedAt) || x.id.localeCompare(y.id));
  if (by === "intake") return s.sort((x, y) => cOf(x).startDates[x.intake].localeCompare(cOf(y).startDates[y.intake]));
  return s.sort((x, y) => cOf(x).institution.localeCompare(cOf(y).institution));
}

export function primaryAction(a: Application): { label: string; to: string } {
  if (isDraft(a)) return { label: "Continue", to: `/apply/${a.id}/${firstIncomplete(a)}` };
  if (!a.outcome && a.offer && !a.offer.response) return { label: "Respond", to: "/offers" };
  return { label: "View", to: `/applications/${a.id}` };
}

export function firstIncomplete(a: Application): SectionKey {
  const secs = sectionsFor(a);
  return secs.find((s) => !a.sectionsDone.includes(s)) ?? "review";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}
