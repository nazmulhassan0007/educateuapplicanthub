import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { course } from "./data/courses";
import { blankForm, seedDefault, seedFirstVisit, seedOffers, type HubState } from "./data/seed";
import type { Application, FormData, LibDoc, Outcome, Profile, SectionKey } from "./data/types";
import { cOf, isDraft, outcomeLabel, sectionsFor, UNSUCCESSFUL_MESSAGE } from "./lib/app";
import { addDays, fmtShort, nowIso } from "./lib/date";

const KEY = "eu-hub-proto-v4";
let counter = 100;
const uid = (p: string) => `${p}${++counter}${Math.floor(Math.random() * 99)}`;

export type Scenario = "default" | "first" | "offers";
export interface Toast {
  id: string;
  text: string;
}

function load(): HubState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as HubState;
  } catch {
    /* storage unavailable, fall through */
  }
  return seedDefault();
}

export type SimEvent = "main-met" | "insurance-met" | "main-not-met" | "insurance-not-met" | "make-offer" | "overdue" | "expire-offer";

interface Api {
  s: HubState;
  toasts: Toast[];
  toast: (t: string) => void;
  dismissToast: (id: string) => void;
  scenario: (k: Scenario) => void;
  update: (id: string, fn: (a: Application) => void, history?: { title: string; note: string }, notify?: string) => void;
  createDraft: (courseId: string, intake: string) => Application;
  saveForm: (id: string, patch: Partial<FormData>, sectionDone?: SectionKey) => void;
  submit: (id: string) => void;
  deleteDraft: (id: string) => void;
  withdraw: (id: string, reason: string) => void;
  uploadToTask: (appId: string, taskId: string, fileName: string) => void;
  addAppDoc: (appId: string, slot: string, fileName: string) => void;
  resendReference: (appId: string, refId: string) => void;
  replaceReferenceWithLetter: (appId: string, refId: string, fileName: string) => void;
  declineOffer: (id: string) => void;
  acceptUnconditional: (id: string) => void;
  acceptConditional: (mainId: string, insuranceId?: string) => void;
  resolveInsurance: (appId: string, choice: "now" | "wait") => void;
  simulate: (id: string, ev: SimEvent) => void;
  sendMessage: (threadId: string, text: string) => void;
  startThread: (appId: string | undefined, subject: string, text: string) => string;
  readThread: (id: string) => void;
  readAllNotifications: () => void;
  readNotification: (id: string) => void;
  addLibDoc: (name: string, kind: string, size?: string) => void;
  removeLibDoc: (id: string) => void;
  setProfile: (p: Partial<Profile>) => void;
  markSeen: () => void;
  net: "ok" | "offline";
  setNet: (n: "ok" | "offline") => void;
  session: "active" | "warning" | "out";
  setSession: (n: "active" | "warning" | "out") => void;
}

const Ctx = createContext<Api>(null as unknown as Api);
export const useHub = () => useContext(Ctx);

export function HubProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<HubState>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});
  const [net, setNet] = useState<"ok" | "offline">("ok");
  const [session, setSession] = useState<"active" | "warning" | "out">("active");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* private mode: prototype still works for the session */
    }
  }, [s]);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (text: string) => {
      const id = uid("t");
      setToasts((t) => [...t.slice(-2), { id, text }]);
      timers.current[id] = window.setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast],
  );

  const notify = (st: HubState, text: string, href: string): HubState => ({
    ...st,
    notifications: [{ id: uid("n"), at: nowIso(), text, href, read: false }, ...st.notifications],
  });

  const mutate = useCallback((fn: (draft: HubState) => HubState | void) => {
    setS((prev) => {
      const next = structuredClone(prev);
      return fn(next) ?? next;
    });
  }, []);

  const touch = (a: Application, title?: string, note?: string) => {
    a.updatedAt = "2026-10-07";
    if (title) a.history.unshift({ at: nowIso(), title, note: note ?? "" });
  };

  const closeApp = (a: Application, outcome: Outcome, note?: string) => {
    a.outcome = outcome;
    a.closedAt = "2026-10-07";
    touch(a, outcome === "unsuccessful" ? "Application closed" : outcomeLabel[outcome], note ?? (outcome === "unsuccessful" ? UNSUCCESSFUL_MESSAGE : ""));
  };

  const api = useMemo<Api>(
    () => ({
      s,
      toasts,
      toast,
      dismissToast,
      scenario: (k) => {
        const next = k === "first" ? seedFirstVisit() : k === "offers" ? seedOffers() : seedDefault();
        setS(next);
        toast(k === "first" ? "Prototype reset to a first visit." : k === "offers" ? "Prototype set to three offers waiting." : "Prototype reset to the default account.");
      },
      update: (id, fn, history, note) =>
        mutate((st) => {
          const a = st.apps.find((x) => x.id === id);
          if (!a) return;
          fn(a);
          touch(a, history?.title, history?.note);
          if (note) return notify(st, note, `/applications/${id}`);
        }),
      createDraft: (courseId, intake) => {
        const id = uid("a");
        const n = 50 + Math.floor(Math.random() * 40);
        const app: Application = {
          id,
          ref: `EU-27-00${n}`,
          courseId,
          intake,
          createdAt: "2026-10-07",
          updatedAt: "2026-10-07",
          stage: 1,
          stageDates: { 1: "2026-10-07" },
          tasks: [],
          references: [],
          docs: [],
          history: [{ at: nowIso(), title: "Draft started", note: "You began your application." }],
          form: blankForm(s.profile),
          sectionsDone: [],
        };
        setS((prev) => ({ ...prev, apps: [app, ...prev.apps] }));
        return app;
      },
      saveForm: (id, patch, done) =>
        mutate((st) => {
          const a = st.apps.find((x) => x.id === id);
          if (!a) return;
          a.form = { ...a.form, ...patch };
          if (done && !a.sectionsDone.includes(done)) a.sectionsDone.push(done);
          a.updatedAt = "2026-10-07";
        }),
      submit: (id) =>
        mutate((st) => {
          const a = st.apps.find((x) => x.id === id)!;
          const c = course(a.courseId);
          a.stage = 2;
          a.stageDates[2] = "2026-10-07";
          a.submittedAt = "2026-10-07";
          a.references = a.form.referees.map((r) => ({ id: uid("r"), name: r.name, email: r.email, status: "Requested" as const, via: r.mode, lastSent: "2026-10-07" }));
          a.docs = Object.entries(a.form.docs)
            .filter(([, v]) => v)
            .map(([slot, name]) => ({ id: uid("d"), name: name as string, slot, addedAt: "2026-10-07" }));
          a.assigned = undefined;
          touch(a, "Application submitted", `Decision expected by ${fmtShort(addDays("2026-10-07", c.turnaroundDays))}.`);
          const sec = sectionsFor(a);
          a.sectionsDone = sec;
          return notify(st, `Application submitted: ${c.title}. Decision expected by ${fmtShort(addDays("2026-10-07", c.turnaroundDays))}.`, `/applications/${id}`);
        }),
      deleteDraft: (id) => {
        mutate((st) => {
          st.apps = st.apps.filter((a) => !(a.id === id && isDraft(a)));
        });
        toast("Draft deleted.");
      },
      withdraw: (id, reason) => {
        mutate((st) => {
          const a = st.apps.find((x) => x.id === id)!;
          a.outcome = "withdrawn";
          a.closedAt = "2026-10-07";
          touch(a, "Withdrawn by you", reason ? `Reason given: ${reason}.` : "No reason given.");
          return notify(st, `You withdrew your application to ${cOf(a).institution}`, `/applications/${id}`);
        });
        toast("Application withdrawn. It now sits under Closed.");
      },
      uploadToTask: (appId, taskId, fileName) => {
        mutate((st) => {
          const a = st.apps.find((x) => x.id === appId)!;
          const t = a.tasks.find((x) => x.id === taskId)!;
          t.done = true;
          t.doneAt = "2026-10-07";
          if (t.slot) a.docs.push({ id: uid("d"), name: fileName, slot: t.slot, addedAt: "2026-10-07" });
          touch(a, "Document added", `${fileName} added for ${t.slot ?? t.title}.`);
          if (!st.library.some((l) => l.name === fileName)) st.library.unshift({ id: uid("l"), name: fileName, kind: t.slot ?? "Document", size: "420 KB", addedAt: "2026-10-07" });
        });
        toast("Uploaded. The admissions team can see it now.");
      },
      addAppDoc: (appId, slot, fileName) => {
        mutate((st) => {
          const a = st.apps.find((x) => x.id === appId)!;
          a.docs = a.docs.filter((d) => d.slot !== slot);
          a.docs.push({ id: uid("d"), name: fileName, slot, addedAt: "2026-10-07" });
          touch(a, "Document added", `${fileName} added for ${slot}.`);
          if (!st.library.some((l) => l.name === fileName)) st.library.unshift({ id: uid("l"), name: fileName, kind: slot, size: "420 KB", addedAt: "2026-10-07" });
        });
        toast("Document added.");
      },
      resendReference: (appId, refId) => {
        mutate((st) => {
          const a = st.apps.find((x) => x.id === appId)!;
          const r = a.references.find((x) => x.id === refId)!;
          r.lastSent = "2026-10-07";
          r.status = "Requested";
          a.tasks = a.tasks.map((t) => (t.kind === "reference" ? { ...t, done: true, doneAt: "2026-10-07" } : t));
          touch(a, "Reference request sent again", `Sent to ${r.name}.`);
        });
        toast("Request sent again. We will email you when it arrives.");
      },
      replaceReferenceWithLetter: (appId, refId, fileName) => {
        mutate((st) => {
          const a = st.apps.find((x) => x.id === appId)!;
          const r = a.references.find((x) => x.id === refId)!;
          r.status = "Received";
          r.via = "letter";
          a.tasks = a.tasks.map((t) => (t.kind === "reference" ? { ...t, done: true, doneAt: "2026-10-07" } : t));
          touch(a, "Reference letter uploaded", `${fileName} added in place of ${r.name}'s reply.`);
        });
        toast("Letter uploaded. Marked as received.");
      },
      declineOffer: (id) => {
        mutate((st) => {
          const a = st.apps.find((x) => x.id === id)!;
          closeApp(a, "declined", "You declined this offer. Your other applications carry on.");
          return notify(st, `You declined the offer from ${cOf(a).institution}`, `/applications/${id}`);
        });
        toast("Offer declined. Your other applications carry on.");
      },
      acceptUnconditional: (id) =>
        mutate((st) => {
          const winner = st.apps.find((x) => x.id === id)!;
          winner.offer!.response = "firm";
          winner.stage = 5;
          winner.stageDates[5] = "2026-10-07";
          touch(winner, "Place confirmed", `Place confirmed at ${cOf(winner).institution}.`);
          for (const a of st.apps) {
            if (a.id === id || a.outcome) continue;
            if (a.stage === 4 && a.offer && !a.offer.response) closeApp(a, "declined", "Declined because you accepted another offer.");
            else if (a.stage === 2 || a.stage === 3) closeApp(a, "withdrawn", "Withdrawn because you accepted an offer.");
          }
          return notify(st, `Place confirmed at ${cOf(winner).institution}`, `/applications/${id}`);
        }),
      acceptConditional: (mainId, insuranceId) =>
        mutate((st) => {
          const main = st.apps.find((x) => x.id === mainId)!;
          main.offer!.response = "main";
          touch(main, "Accepted as main choice", "Waiting for your conditions to be met.");
          const ins = insuranceId ? st.apps.find((x) => x.id === insuranceId) : undefined;
          if (ins) {
            ins.offer!.response = "insurance";
            touch(ins, "Accepted as insurance choice", "Waiting for your conditions to be met.");
          }
          for (const a of st.apps) {
            if (a.id === mainId || a.id === insuranceId || a.outcome) continue;
            if (a.stage === 4 && a.offer && !a.offer.response) closeApp(a, "declined", "Declined because you accepted other offers.");
            else if (a.stage === 2 || a.stage === 3) closeApp(a, "withdrawn", "Withdrawn because you accepted offers.");
          }
          return notify(st, `Main choice confirmed: ${cOf(main).institution}${ins ? `. Insurance: ${cOf(ins).institution}` : ""}`, `/applications/${mainId}`);
        }),
      resolveInsurance: (appId, choice) => {
        mutate((st) => {
          const ins = st.apps.find((x) => x.id === appId)!;
          ins.tasks = ins.tasks.map((t) => (t.kind === "insurance" ? { ...t, done: true, doneAt: "2026-10-07" } : t));
          if (choice === "now") {
            const main = st.apps.find((x) => !x.outcome && x.offer?.response === "main");
            if (main) closeApp(main, "declined", "Declined because your insurance became unconditional and you chose it.");
            ins.stage = 5;
            ins.stageDates[5] = "2026-10-07";
            touch(ins, "Place confirmed", `Place confirmed at ${cOf(ins).institution}.`);
          } else touch(ins, "You chose to wait", "You will wait for your main choice to confirm.");
        });
        toast(choice === "now" ? "Insurance accepted. Your place is confirmed." : "Noted. We will keep your main choice open.");
      },
      simulate: (id, ev) =>
        mutate((st) => {
          const a = st.apps.find((x) => x.id === id);
          if (!a || a.outcome) return;
          const other = st.apps.find((x) => !x.outcome && x.id !== id && x.offer?.response);
          const confirm = (x: Application) => {
            x.stage = 5;
            x.stageDates[5] = "2026-10-07";
            if (x.offer) x.offer.conditions = x.offer.conditions.map((c) => ({ ...c, status: "met" as const }));
            touch(x, "Place confirmed", `All conditions met. Place confirmed at ${cOf(x).institution}.`);
            st.notifications.unshift({ id: uid("n"), at: nowIso(), text: `Place confirmed at ${cOf(x).institution}`, href: `/applications/${x.id}`, read: false });
          };
          if (ev === "main-met" && a.offer?.response === "main") {
            confirm(a);
            if (other?.offer?.response === "insurance") closeApp(other, "declined", "Insurance declined automatically because your main choice is confirmed.");
          } else if (ev === "insurance-met" && a.offer?.response === "insurance") {
            const main = st.apps.find((x) => !x.outcome && x.offer?.response === "main");
            if (main && main.stage === 4) {
              a.tasks.push({
                id: uid("t"),
                kind: "insurance",
                title: "Choose what happens to your insurance offer",
                detail: `Your insurance at ${cOf(a).institution} is now unconditional. Accept it now and your main choice is declined, or wait for your main choice.`,
                due: addDays("2026-10-07", 14),
              });
              touch(a, "Insurance offer is now unconditional", "Choose to accept it now or wait for your main choice.");
              st.notifications.unshift({ id: uid("n"), at: nowIso(), text: `Your insurance at ${cOf(a).institution} is now unconditional. Action needed.`, href: `/applications/${a.id}`, read: false });
            } else confirm(a);
          } else if (ev === "main-not-met" && a.offer?.response === "main") {
            closeApp(a, "unsuccessful");
            st.notifications.unshift({ id: uid("n"), at: nowIso(), text: `Update on your application to ${cOf(a).institution}`, href: `/applications/${a.id}`, read: false });
            if (other?.offer?.response === "insurance" && other.offer.type === "unconditional") confirm(other);
          } else if (ev === "insurance-not-met" && a.offer?.response === "insurance") {
            closeApp(a, "unsuccessful");
            st.notifications.unshift({ id: uid("n"), at: nowIso(), text: `Update on your application to ${cOf(a).institution}`, href: `/applications/${a.id}`, read: false });
          } else if (ev === "overdue" && (a.stage === 2 || a.stage === 3)) {
            a.decisionBy = "2026-10-05";
            touch(a);
          } else if (ev === "expire-offer" && a.stage === 4 && a.offer && !a.offer.response) {
            closeApp(a, "expired", "You did not respond by the deadline.");
            st.notifications.unshift({ id: uid("n"), at: nowIso(), text: `Your offer from ${cOf(a).institution} has expired`, href: `/applications/${a.id}`, read: false });
          } else if (ev === "make-offer" && a.stage === 3) {
            a.stage = 4;
            a.stageDates[4] = "2026-10-07";
            a.booking = undefined;
            a.tasks = a.tasks.filter((t) => t.kind === "upload" && t.done);
            a.offer = { type: "conditional", madeAt: "2026-10-07", deadline: addDays("2026-10-07", 23), conditions: [{ id: uid("c"), text: "Pass the final placement assessment", status: "pending" }, { id: uid("c"), text: "Clear an enhanced DBS check", status: "pending" }] };
            touch(a, "Conditional offer made", `Respond by ${fmtShort(a.offer.deadline)}. Two conditions to meet.`);
            st.notifications.unshift({ id: uid("n"), at: nowIso(), text: `You have an offer from ${cOf(a).institution}. Respond by ${fmtShort(a.offer.deadline)}.`, href: "/offers", read: false });
          }
        }),
      sendMessage: (threadId, text) => {
        mutate((st) => {
          const t = st.threads.find((x) => x.id === threadId)!;
          t.messages.push({ id: uid("msg"), from: "you", who: "You", at: nowIso(), text });
        });
        toast("Message sent. The admissions team will reply here.");
      },
      startThread: (appId, subject, text) => {
        const id = uid("m");
        mutate((st) => {
          st.threads.unshift({ id, appId, subject, unread: false, messages: [{ id: uid("msg"), from: "you", who: "You", at: nowIso(), text }] });
        });
        toast("Message sent. The admissions team will reply here.");
        return id;
      },
      readThread: (id) =>
        setS((prev) => (prev.threads.find((t) => t.id === id)?.unread ? { ...prev, threads: prev.threads.map((t) => (t.id === id ? { ...t, unread: false } : t)) } : prev)),
      readAllNotifications: () => setS((p) => ({ ...p, notifications: p.notifications.map((n) => ({ ...n, read: true })) })),
      readNotification: (id) => setS((p) => ({ ...p, notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      addLibDoc: (name, kind, size = "380 KB") => {
        const d: LibDoc = { id: uid("l"), name, kind, size, addedAt: "2026-10-07" };
        setS((p) => ({ ...p, library: [d, ...p.library] }));
        toast(`${name} added to your documents.`);
      },
      removeLibDoc: (id) => {
        setS((p) => ({ ...p, library: p.library.filter((l) => l.id !== id) }));
        toast("Document removed from your library. Copies already sent stay with those applications.");
      },
      setProfile: (patch) => setS((p) => ({ ...p, profile: { ...p.profile, ...patch } })),
      markSeen: () => setS((p) => (p.seen ? p : { ...p, seen: true })),
      net,
      setNet,
      session,
      setSession,
    }),
    [s, toasts, toast, dismissToast, mutate, net, session],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

// Derived selectors used across pages.
export function profileCompleteness(p: Profile) {
  const items = [
    { ok: !!p.firstName && !!p.lastName, label: "Your name", to: "/profile#about" },
    { ok: !!p.email && !!p.phone, label: "Contact details", to: "/profile#about" },
    { ok: !!p.dob, label: "Date of birth", to: "/profile#about" },
    { ok: !!p.address && !!p.postcode, label: "Home address", to: "/profile#about" },
    { ok: !!p.education.trim(), label: "Education history", to: "/profile#education" },
  ];
  const done = items.filter((i) => i.ok).length;
  return { pct: Math.round((done / items.length) * 100), missing: items.filter((i) => !i.ok), items };
}

