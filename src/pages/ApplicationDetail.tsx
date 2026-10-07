import { useState } from "react";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, Download, FileText, Gift, Mail, MapPin, Upload as UpIcon, UserRound, Video } from "../components/icons";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { StatusLine } from "../components/AppCard";
import { ThreadView } from "../components/ThreadView";
import { ResponsiveTracker } from "../components/Tracker";
import { UploadDialog } from "../components/Upload";
import { Banner, Button, Card, Chip, cx, Dialog, Empty, InstitutionTile, LinkButton, Tabs, TextArea } from "../components/ui";
import type { Application } from "../data/types";
import { actionNeeded, cOf, decisionText, expectedBy, holdsAcceptedOffer, openTasks, outcomeLabel, SECTION_LABELS, sectionsFor, UNSUCCESSFUL_MESSAGE } from "../lib/app";
import { dueLabel, fmt, fmtDateTime, fmtShort } from "../lib/date";
import { useHub } from "../store";

type Tab = "progress" | "tasks" | "offer" | "documents" | "messages" | "history";

function stageText(a: Application) {
  const c = cOf(a);
  if (a.outcome === "unsuccessful") return UNSUCCESSFUL_MESSAGE;
  if (a.outcome === "withdrawn") return `You withdrew this application on ${fmt(a.closedAt!)}. It is closed and cannot be reopened. You can start a new application for this course if the intake is still open.`;
  if (a.outcome === "declined") return `This offer was declined on ${fmt(a.closedAt!)}. The application is closed and your other applications carry on.`;
  if (a.outcome === "expired") return `The response deadline passed on ${fmt(a.closedAt!)}, so the offer expired. The application is closed.`;
  switch (a.stage) {
    case 1:
      return `You have not submitted this yet. Finish the remaining sections, then submit. ${a.sectionsDone.length} of ${sectionsFor(a).length} sections are complete.`;
    case 2:
      return `We have your application and passed it to the admissions team at ${c.institution}. They will start the review soon. ${decisionText(a)}`;
    case 3:
      return `The admissions team is reviewing your application. ${decisionText(a)} If they need anything else you will see it under Tasks and get an email.`;
    case 4:
      return a.offer?.response ? "You have answered this offer. We are now waiting for your conditions to be confirmed. We will tell you the moment that happens." : `You have an offer. Read the conditions and respond by ${fmt(a.offer!.deadline)}.`;
    default:
      return `Your place is confirmed at ${c.institution}. Your course starts on ${fmt(c.startDates[a.intake])}. Enrolment instructions arrive by email, along with instalment plan details if your course offers one.`;
  }
}

function Booking({ a }: { a: Application }) {
  const b = a.booking;
  if (!b) return null;
  const rows = [
    { icon: Calendar, k: "When", v: fmtDateTime(b.at) },
    { icon: b.format === "Online" ? Video : MapPin, k: b.format, v: b.where },
    { icon: FileText, k: "What to bring", v: b.bring },
    { icon: UserRound, k: "Your contact", v: b.contact },
  ];
  return (
    <section aria-labelledby="booking" className="mt-8 rounded-[24px] bg-[#e8f8f3] p-5 sm:p-6">
      <h3 id="booking" className="flex items-center gap-2 text-xl">
        <Calendar className="size-5 text-leaf" aria-hidden />
        {b.type} booked
      </h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.k} className="flex gap-3">
            <r.icon className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
            <div>
              <dt className="text-sm font-bold text-slate">{r.k}</dt>
              <dd className="font-bold leading-snug">{r.v}</dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-slate">Need to change it? Message the admissions team from the Messages tab. We will update this page.</p>
    </section>
  );
}

function ProgressTab({ a }: { a: Application }) {
  return (
    <div>
      <ResponsiveTracker app={a} dates />
      <div className="mt-8 max-w-2xl">
        <h3 className="text-xl">{a.outcome ? outcomeLabel[a.outcome] : a.stage === 5 ? "Place confirmed" : ["", "Draft", "Submitted", "Admission review", "Decision"][a.stage]}</h3>
        <p className="mt-2 text-[17px] leading-relaxed text-slate">{stageText(a)}</p>
        {a.outcome === "unsuccessful" && (
          <p className="mt-3 text-slate">If you have a question, you can message the admissions team from the Messages tab.</p>
        )}
      </div>
      <Booking a={a} />
      {a.stage === 5 && !a.outcome && <Enrol a={a} />}
    </div>
  );
}

function Enrol({ a }: { a: Application }) {
  const c = cOf(a);
  const items = [
    { t: "Check your email for your enrolment pack", d: "It arrives within two working days and has your student number and joining instructions." },
    { t: "Confirm your details", d: "Check your name, address and contact details are right on Profile & account." },
    { t: "Meet your conditions of study", d: c.interview ? "Your course team will confirm any checks, such as a DBS, before you start." : "There are no further checks before you start." },
  ];
  return (
    <section aria-labelledby="enrol" className="mt-8 rounded-[24px] bg-deep p-6 text-white sm:p-8" data-dark>
      <h3 id="enrol" className="text-2xl">Getting ready to start</h3>
      <p className="mt-2 text-white/80">Your course starts on <strong className="text-white">{fmt(c.startDates[a.intake])}</strong> at {c.location}.</p>
      <ol className="mt-5 grid gap-3">
        {items.map((i, n) => (
          <li key={i.t} className="flex gap-3.5 rounded-2xl bg-white/8 p-4"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-mint text-sm font-extrabold text-abyss">{n + 1}</span><span><span className="block font-extrabold">{i.t}</span><span className="block text-[15px] text-white/80">{i.d}</span></span></li>
        ))}
      </ol>
      {c.instalment && (
        <div className="mt-5 rounded-2xl bg-white p-4 text-ink">
          <p className="font-extrabold">Instalment plan</p>
          <p className="mt-1 text-[15px] text-slate">{c.instalment} Your fees are {c.fees.toLowerCase()}. Details of how to join the plan are in your enrolment pack. Nothing to set up here.</p>
        </div>
      )}
    </section>
  );
}

function TasksTab({ a }: { a: Application }) {
  const { uploadToTask, resendReference, replaceReferenceWithLetter, resolveInsurance } = useHub();
  const [up, setUp] = useState<{ title: string; slot?: string; on: (n: string) => void } | null>(null);
  const open = openTasks(a);
  const done = a.tasks.filter((t) => t.done);
  const refTask = (tid: string) => {
    const r = a.references.find((x) => x.status === "Not received");
    return (
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button size="sm" className="min-h-11" onClick={() => r && resendReference(a.id, r.id)}>
          <Mail className="size-4" aria-hidden />
          Send request again{r ? ` to ${r.name.split(" ")[0]}` : ""}
        </Button>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => r && setUp({ title: "Upload a reference letter", slot: "Reference letter", on: (n) => replaceReferenceWithLetter(a.id, r.id, n) })}>
          <UpIcon className="size-4" aria-hidden />
          Upload a letter instead
        </Button>
        <span className="sr-only">{tid}</span>
      </div>
    );
  };
  return (
    <div>
      {open.length === 0 ? (
        <Empty icon={<CheckCircle2 className="size-7" />} title="No open tasks">
          You are up to date on this application. If the admissions team needs something, it will show here and we will email you.
        </Empty>
      ) : (
        <ul className="grid gap-4">
          {open.map((t) => (
            <li key={t.id} className="rounded-[24px] bg-[#fdf1e9] p-5 shadow-[0_0_0_1px_rgb(194_101_63/0.25)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 max-w-xl">
                  <h3 className="flex items-center gap-2 text-lg text-ink"><AlertCircle className="size-5 shrink-0 text-clay" aria-hidden />{t.title}</h3>
                  <p className="mt-1.5 text-slate">{t.detail}</p>
                </div>
                <Chip tone="action">{dueLabel(t.due)}</Chip>
              </div>
              {t.kind === "upload" && (
                <div className="mt-4">
                  <Button size="sm" className="min-h-11" onClick={() => setUp({ title: t.title, slot: "slot" in t ? t.slot : undefined, on: (n) => uploadToTask(a.id, t.id, n) })}>
                    <UpIcon className="size-4" aria-hidden />
                    Upload document
                  </Button>
                </div>
              )}
              {t.kind === "reference" && refTask(t.id)}
              {t.kind === "respond" && (
                <div className="mt-4">
                  <LinkButton to="/offers" size="sm" className="min-h-11" arrow>Respond to offers</LinkButton>
                </div>
              )}
              {t.kind === "insurance" && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-extrabold">Accept it now</p>
                    <p className="mt-1 text-sm text-slate">Your place here is confirmed. Your main choice is declined and cannot be reopened.</p>
                    <Button size="sm" className="mt-3 min-h-11" onClick={() => resolveInsurance(a.id, "now")}>Accept insurance now</Button>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-extrabold">Wait for your main choice</p>
                    <p className="mt-1 text-sm text-slate">Both stay open. This place stays held while you wait for your main conditions.</p>
                    <Button size="sm" variant="secondary" className="mt-3 min-h-11" onClick={() => resolveInsurance(a.id, "wait")}>Wait for main</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {done.length > 0 && (
        <>
          <h3 className="mb-3 mt-9 text-lg">Completed</h3>
          <ul className="grid gap-2">
            {done.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3">
                <CheckCircle2 className="size-5 shrink-0 text-leaf" aria-hidden />
                <span className="flex-1 font-semibold">{t.title}</span>
                <span className="text-sm text-slate">Done {t.doneAt && fmtShort(t.doneAt)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {up && <UploadDialog open title={up.title} slot={up.slot} onClose={() => setUp(null)} onPick={up.on} />}
    </div>
  );
}

function OfferTab({ a }: { a: Application }) {
  const o = a.offer!;
  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-2xl capitalize">{o.type} offer</h3>
        {o.response && <Chip tone="ink">Accepted as {o.response === "firm" ? "your place" : `${o.response} choice`}</Chip>}
      </div>
      <p className="mt-2 text-slate">Offered on {fmt(o.madeAt)}. {o.response ? "" : `Respond by ${fmt(o.deadline)}.`}</p>
      {o.type === "conditional" ? (
        <>
          <h4 className="mt-7 text-lg">Your conditions</h4>
          <ul className="mt-3 grid gap-2.5">
            {o.conditions.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-2xl bg-mist p-4">
                {c.status === "met" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden /> : <Clock className="mt-0.5 size-5 shrink-0 text-slate" aria-hidden />}
                <span className="flex-1 font-semibold leading-snug">{c.text}</span>
                <Chip tone={c.status === "met" ? "success" : "neutral"}>{c.status === "met" ? "Met" : "Pending"}</Chip>
              </li>
            ))}
          </ul>
          <div className="mt-4"><LinkButton to="?tab=documents" variant="quiet" size="sm" className="min-h-11">Upload proof of conditions</LinkButton></div>
        </>
      ) : (
        <p className="mt-6 rounded-2xl bg-mist p-4 font-semibold">No conditions. Accepting confirms your place.</p>
      )}
      {!o.response && !a.outcome && (
        <LinkButton to="/offers" size="lg" arrow className="mt-8">
          <Gift className="size-5" aria-hidden />
          Respond to offers
        </LinkButton>
      )}
    </div>
  );
}

function DocsTab({ a }: { a: Application }) {
  const { addAppDoc, resendReference } = useHub();
  const c = cOf(a);
  const [up, setUp] = useState<{ slot: string } | null>(null);
  const requested = Array.from(new Set([...c.docs, ...a.tasks.filter((t) => t.slot).map((t) => t.slot!)]));
  const missing = requested.filter((s) => !a.docs.some((d) => d.slot === s));
  return (
    <div className="grid gap-9">
      <section aria-labelledby="attached">
        <h3 id="attached" className="text-xl">Attached to this application</h3>
        {a.docs.length === 0 ? (
          <p className="mt-3 text-slate">Nothing attached yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {a.docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3">
                <FileText className="size-5 shrink-0 text-teal" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{d.name}</span>
                  <span className="block text-[13px] text-slate">{d.slot}, added {fmtShort(d.addedAt)}</span>
                </span>
                <Chip tone="success" icon={<CheckCircle2 className="size-3.5" aria-hidden />}>Received</Chip>
              </li>
            ))}
          </ul>
        )}
      </section>
      {!a.outcome && missing.length > 0 && (
        <section aria-labelledby="requested">
          <h3 id="requested" className="text-xl">Still needed</h3>
          <ul className="mt-3 grid gap-2">
            {missing.map((m) => (
              <li key={m} className="flex flex-wrap items-center gap-3 rounded-2xl bg-clay-tint px-4 py-3">
                <UpIcon className="size-5 shrink-0 text-clay-text" aria-hidden />
                <span className="min-w-0 flex-1 font-bold">{m}</span>
                <Button size="sm" className="min-h-11" onClick={() => setUp({ slot: m })}>Upload</Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {a.references.length > 0 && (
        <section aria-labelledby="refs">
          <h3 id="refs" className="text-xl">References</h3>
          <ul className="mt-3 grid gap-2">
            {a.references.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-mist px-4 py-3">
                <Mail className="size-5 shrink-0 text-teal" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{r.name}</span>
                  <span className="block text-[13px] text-slate">{r.via === "letter" ? "Letter uploaded" : `${r.email}. Last sent ${r.lastSent ? fmtShort(r.lastSent) : "not yet"}`}</span>
                </span>
                <Chip tone={r.status === "Received" ? "success" : r.status === "Not received" ? "action" : "neutral"} icon={r.status === "Received" ? <CheckCircle2 className="size-3.5" aria-hidden /> : <Clock className="size-3.5" aria-hidden />}>{r.status === "Not received" ? "Requested, not received" : r.status}</Chip>
                {r.status !== "Received" && r.via === "email" && (
                  <Button size="sm" variant="secondary" className="min-h-11" onClick={() => resendReference(a.id, r.id)}>Send again</Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {up && <UploadDialog open title={`Upload: ${up.slot}`} slot={up.slot} onClose={() => setUp(null)} onPick={(n) => addAppDoc(a.id, up.slot, n)} />}
    </div>
  );
}

function MessagesTab({ a }: { a: Application }) {
  const { s, startThread } = useHub();
  const [text, setText] = useState("");
  const th = s.threads.find((t) => t.appId === a.id);
  const c = cOf(a);
  return th ? (
    <ThreadView t={th} />
  ) : (
    <div className="max-w-xl">
      <p className="text-slate">No messages yet. Ask {a.assigned ?? "the admissions team"} anything about this application.</p>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) startThread(a.id, `${c.title}: your question`, text.trim());
          setText("");
        }}
      >
        <label htmlFor="first-msg" className="mb-1.5 block font-bold">Your message</label>
        <TextArea id="first-msg" value={text} onChange={(e) => setText(e.target.value)} className="!min-h-32" />
        <div className="mt-3 flex justify-end"><Button type="submit" disabled={!text.trim()}>Send message</Button></div>
      </form>
    </div>
  );
}

function HistoryTab({ a }: { a: Application }) {
  const [show, setShow] = useState(false);
  const c = cOf(a);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
      <ol className="relative max-w-2xl">
        {a.history.map((h, i) => (
          <li key={h.at + h.title} className="relative flex gap-4 pb-7 last:pb-0">
            <span aria-hidden className="relative flex flex-col items-center">
              <span className={cx("mt-1.5 size-3.5 rounded-full", i === 0 ? "bg-ink shadow-[0_0_0_5px_#d9e9ee]" : "bg-[#9db6c1]")} />
              {i < a.history.length - 1 && <span className="mt-1 w-0.5 flex-1 rounded bg-[#d5e2e7]" />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate">{fmtDateTime(h.at)}</p>
              <p className="font-extrabold leading-snug">{h.title}</p>
              {h.note && <p className="mt-0.5 text-slate">{h.note}</p>}
            </div>
          </li>
        ))}
      </ol>
      {a.stage >= 2 && (
        <div>
          <Button variant="secondary" onClick={() => setShow(true)}>
            <FileText className="size-4" aria-hidden />
            View submitted answers
          </Button>
        </div>
      )}
      <Dialog open={show} onClose={() => setShow(false)} title="Your submitted answers" footer={<><Button variant="ghost" onClick={() => setShow(false)}>Close</Button><Button onClick={() => window.print()}><Download className="size-4" aria-hidden />Download as PDF</Button></>}>
        <div className="print-area grid gap-5 text-[15px]">
          <p className="text-sm text-slate">Read only. {c.title}, {c.institution}. Ref {a.ref}.</p>
          {sectionsFor(a).filter((k) => k !== "review").map((k) => (
            <section key={k}>
              <h3 className="text-base">{SECTION_LABELS[k]}</h3>
              <div className="mt-1 text-slate">
                {k === "about" && `${a.form.firstName} ${a.form.lastName}. Born ${fmt(a.form.dob)}. ${a.form.address}, ${a.form.postcode}. ${a.form.email}, ${a.form.phone}.`}
                {k === "quals" && a.form.quals.map((q) => `${q.name}, ${q.grade} (${q.year})`).join("; ")}
                {k === "statement" && a.form.statement}
                {k === "references" && (a.form.referees.length ? a.form.referees.map((r) => `${r.name} (${r.email})`).join("; ") : "None")}
                {k === "documents" && (a.docs.length ? a.docs.map((d) => d.name).join(", ") : "None")}
              </div>
            </section>
          ))}
        </div>
      </Dialog>
    </div>
  );
}

export function ApplicationDetail() {
  const { id } = useParams();
  const { s, withdraw } = useHub();
  const [sp, setSp] = useSearchParams();
  const [wd, setWd] = useState(false);
  const [reason, setReason] = useState("");
  const a = s.apps.find((x) => x.id === id);
  if (!a) {
    return (
      <Empty icon={<AlertCircle className="size-7" />} title="We could not find that application" action={<LinkButton to="/applications">Back to My applications</LinkButton>}>
        It may have been deleted. Check My applications for the full list.
      </Empty>
    );
  }
  const c = cOf(a);
  const tasks = openTasks(a);
  const tabs: { id: Tab; label: string; count?: number; flag?: boolean }[] = [
    { id: "progress", label: "Progress" },
    { id: "tasks", label: "Tasks", count: tasks.length, flag: tasks.length > 0 },
    ...(a.offer ? [{ id: "offer" as const, label: "Offer" }] : []),
    { id: "documents", label: "Documents" },
    { id: "messages", label: "Messages" },
    { id: "history", label: "History" },
  ];
  const want = (sp.get("tab") as Tab) ?? "progress";
  const tab = tabs.some((t) => t.id === want) ? want : "progress";
  const canWithdraw = !a.outcome && a.stage >= 2 && a.stage < 5 && !holdsAcceptedOffer(s.apps);
  const e = expectedBy(a);

  return (
    <div>
      <Link to="/applications" className="mb-5 inline-flex min-h-11 items-center gap-2 font-bold text-ink hover:underline hover:decoration-ink/40 hover:underline-offset-4">
        <ArrowLeft className="size-4" aria-hidden />
        My applications
      </Link>
      <Card className="rise !p-6 sm:!p-8">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 max-w-3xl items-start gap-4 sm:gap-5">
            <InstitutionTile name={c.institution} size={56} />
            <div className="min-w-0">
              <h1 className="text-[26px] leading-tight sm:text-[36px]">{c.title}</h1>
              <p className="mt-1 text-[17px] text-slate">{c.institution}. {c.mode}, starts {a.intake}.</p>
              <p className="mt-0.5 text-sm text-slate">Ref {a.ref}. Your contact: <strong className="text-ink">{a.assigned ?? "Admissions team"}</strong></p>
            </div>
          </div>
          {canWithdraw && (
            <Button variant="ghost" size="sm" className="min-h-11 text-slate" onClick={() => setWd(true)}>Withdraw application</Button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[20px] bg-mist px-5 py-4">
          <div className="min-w-0 flex-1 basis-72">
            <StatusLine a={a} />
            {!a.outcome && e && actionNeeded(a) == null && a.stage < 4 && <p className="mt-0.5 text-sm text-slate">{decisionText(a)}</p>}
          </div>
          {tasks.length > 0 && !a.outcome && (
            <Button size="sm" className="min-h-11" onClick={() => setSp({ tab: "tasks" })}>
              See {tasks.length === 1 ? "your task" : `your ${tasks.length} tasks`}
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-7">
        <Tabs tabs={tabs} value={tab} onChange={(t) => setSp(t === "progress" ? {} : { tab: t }, { replace: true })} label="Application sections" />
      </div>
      <Card className="rise mt-4 !p-5 sm:!p-8" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={tab}>
        {tab === "progress" && <ProgressTab a={a} />}
        {tab === "tasks" && <TasksTab a={a} />}
        {tab === "offer" && a.offer && <OfferTab a={a} />}
        {tab === "documents" && <DocsTab a={a} />}
        {tab === "messages" && <MessagesTab a={a} />}
        {tab === "history" && <HistoryTab a={a} />}
      </Card>

      <Dialog
        open={wd}
        onClose={() => setWd(false)}
        title="Withdraw this application?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setWd(false)}>Keep application</Button>
            <Button variant="danger" onClick={() => { withdraw(a.id, reason.trim()); setWd(false); setReason(""); }}>Withdraw application</Button>
          </>
        }
      >
        <p className="text-slate">
          This closes your application to <strong className="text-ink">{c.title}</strong> at {c.institution}. It moves to Closed and <strong className="text-ink">cannot be reopened</strong>.
        </p>
        <label htmlFor="why" className="mb-1.5 mt-5 block font-bold">Why are you withdrawing? <span className="font-medium text-slate">(optional)</span></label>
        <TextArea id="why" value={reason} onChange={(e) => setReason(e.target.value)} className="!min-h-24" />
      </Dialog>
    </div>
  );
}
