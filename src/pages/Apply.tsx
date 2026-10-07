import { useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, WifiOff, CheckCircle2, Clock, FileText, Info, Pencil, Plus, Save, Send, Trash2, Upload as UpIcon } from "../components/icons";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { UploadDialog } from "../components/Upload";
import { Banner, Button, Card, Check2, cx, Field, Input, LinkButton, Radio, TextArea, useDebouncedSave } from "../components/ui";
import { course } from "../data/courses";
import { blankForm } from "../data/seed";
import type { FormData, SectionKey } from "../data/types";
import { SECTION_LABELS, sectionsFor, submittedCount } from "../lib/app";
import { addDays, fmt } from "../lib/date";
import { useHub } from "../store";

type Errs = Record<string, string>;
const wc = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const uid = () => Math.random().toString(36).slice(2, 8);

function validate(step: SectionKey, f: FormData, courseId: string): Errs {
  const e: Errs = {};
  const c = course(courseId);
  if (step === "about") {
    if (!f.firstName.trim()) e.firstName = "Enter your first name.";
    if (!f.lastName.trim()) e.lastName = "Enter your last name.";
    if (!f.dob) e.dob = "Enter your date of birth.";
    else {
      const age = (new Date("2026-10-07").getTime() - new Date(f.dob).getTime()) / 31557600000;
      if (age < 18) e.dob = "You must be 18 or over to apply here.";
    }
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter an email address like name@example.com.";
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a phone number with at least 10 digits.";
    if (!f.address.trim()) e.address = "Enter your home address.";
    if (!/^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/.test(f.postcode.trim())) e.postcode = "Enter a UK postcode, for example LS6 2QR.";
  }
  if (step === "quals") {
    if (f.quals.length === 0) e.quals = "Add at least one qualification.";
    f.quals.forEach((q) => {
      if (!q.name.trim()) e[`q-${q.id}-name`] = "Enter the qualification name.";
      if (!q.grade.trim()) e[`q-${q.id}-grade`] = "Enter the grade.";
      if (!/^(19|20)\d{2}$/.test(q.year.trim())) e[`q-${q.id}-year`] = "Enter a four digit year.";
    });
  }
  if (step === "statement") {
    const n = wc(f.statement);
    if (n < 200) e.statement = `Your statement needs at least 200 words. You have ${n}.`;
    if (n > 500) e.statement = `Your statement can be up to 500 words. You have ${n}, so please cut ${n - 500}.`;
  }
  if (step === "references") {
    f.referees.forEach((r, i) => {
      if (!r.name.trim()) e[`r-${r.id}-name`] = "Enter the referee's name.";
      if (r.mode === "email" && !/^\S+@\S+\.\S+$/.test(r.email)) e[`r-${r.id}-email`] = "Enter the referee's email address.";
      if (r.mode === "letter" && !f.docs[`Reference letter ${i + 1}`]) e[`r-${r.id}-letter`] = "Upload the letter, or choose to email a request.";
    });
  }
  if (step === "documents") {
    c.docs.forEach((d) => {
      if (!f.docs[d]) e[`d-${d}`] = "Add this document.";
    });
  }
  if (step === "review") {
    if (!f.accurate) e.accurate = "Tick this box to confirm your answers are accurate.";
    if (!f.consent) e.consent = "Tick this box to let educateU share your application with the institution.";
  }
  return e;
}

function Stepper({ steps, current, done, go }: { steps: SectionKey[]; current: SectionKey; done: SectionKey[]; go: (s: SectionKey) => void }) {
  const idx = steps.indexOf(current);
  return (
    <div>
      <ol className="hidden flex-wrap items-center gap-y-2 gap-x-1.5 sm:flex" aria-label="Application steps">
        {steps.map((s, i) => {
          const isDone = done.includes(s) && i !== idx;
          const reachable = i <= idx || done.includes(s) || done.includes(steps[i - 1]);
          return (
            <li key={s} className="flex shrink-0 items-center gap-1.5" aria-current={i === idx ? "step" : undefined}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => go(s)}
                className={cx("press inline-flex min-h-11 items-center gap-2.5 rounded-full whitespace-nowrap pl-2 pr-4 text-[15px] font-bold disabled:opacity-100", i === idx ? "bg-ink text-white" : isDone ? "bg-white text-ink shadow-[inset_0_0_0_1.5px_#c6d6dc] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "bg-transparent text-slate")}
              >
                <span className={cx("grid size-7 place-items-center rounded-full text-[13px]", i === idx ? "bg-mint text-abyss" : isDone ? "bg-ink text-white" : "bg-ink/8")}>
                  {isDone ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                {SECTION_LABELS[s]}
                {isDone && <span className="sr-only"> (complete)</span>}
              </button>
              {i < steps.length - 1 && <span aria-hidden className="h-0.5 w-3 rounded bg-[#c6d6dc]" />}
            </li>
          );
        })}
      </ol>
      <div className="sm:hidden">
        <p className="font-extrabold">Step {idx + 1} of {steps.length}: {SECTION_LABELS[current]}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#d5e2e7]" aria-hidden><div className="h-full rounded-full bg-ink transition-[width] duration-500 ease-[var(--ease-brand)]" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} /></div>
      </div>
    </div>
  );
}

export function Apply() {
  const { key = "", step = "about" } = useParams();
  const { s, createDraft, saveForm, submit, toast, net } = useHub();
  const nav = useNavigate();
  const isNew = key.startsWith("new~");
  const [, cid, intakeEnc] = isNew ? key.split("~") : [];
  const existing = !isNew ? s.apps.find((a) => a.id === key) : undefined;
  const courseId = existing?.courseId ?? cid;
  const intake = existing?.intake ?? decodeURIComponent(intakeEnc ?? "");
  const idRef = useRef<string | undefined>(existing?.id);
  const [f, setF] = useState<FormData>(() => existing?.form ?? blankForm(s.profile));
  const [tried, setTried] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<SectionKey[]>(existing?.sectionsDone ?? []);
  const [up, setUp] = useState<{ slot: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const summary = useRef<HTMLDivElement>(null);

  const c = courseId ? course(courseId) : undefined;
  const steps = useMemo(() => (c ? sectionsFor({ courseId: c.id }) : []), [c]);
  const cur = (steps.includes(step as SectionKey) ? step : "about") as SectionKey;
  const errs = useMemo(() => (c ? validate(cur, f, c.id) : {}), [cur, f, c]);
  const show = (k: string) => (tried || touched[k] ? errs[k] : undefined);

  const ensure = () => {
    if (!idRef.current) idRef.current = createDraft(courseId, intake).id;
    return idRef.current;
  };
  const save = useDebouncedSave(() => {
    if (net === "offline") return;
    const id = ensure();
    saveForm(id, f);
  }, [f, net]);

  if (!c || (!isNew && !existing)) return <Navigate to="/new" replace />;
  if (existing && existing.stage > 1 && !submitting) return <Navigate to={`/applications/${existing.id}`} replace />;

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setF((p) => ({ ...p, [k]: v }));
  const goStep = (to: SectionKey) => {
    const id = ensure();
    saveForm(id, f);
    setTried(false);
    setTouched({});
    nav(`/apply/${id}/${to}`, { replace: true });
  };
  const idx = steps.indexOf(cur);
  const onContinue = () => {
    setTried(true);
    const e = validate(cur, f, c.id);
    if (Object.keys(e).length) {
      window.setTimeout(() => summary.current?.focus(), 30);
      return;
    }
    const id = ensure();
    const nextDone = done.includes(cur) ? done : [...done, cur];
    setDone(nextDone);
    saveForm(id, f, cur);
    setTried(false);
    setTouched({});
    nav(`/apply/${id}/${steps[idx + 1]}`, { replace: true });
    window.scrollTo({ top: 0 });
  };
  const onSubmit = () => {
    setTried(true);
    const all = steps.filter((x) => x !== "review").flatMap((x) => Object.keys(validate(x, f, c.id)));
    const e = validate("review", f, c.id);
    if (Object.keys(e).length || all.length) {
      window.setTimeout(() => summary.current?.focus(), 30);
      return;
    }
    if (submittedCount(s.apps, intake) >= 5) {
      setBlocked(true);
      return;
    }
    setSubmitting(true);
    const id = ensure();
    saveForm(id, f, "review");
    window.setTimeout(() => {
      submit(id);
      nav(`/apply/${id}/confirmation`, { replace: true });
    }, 700);
  };
  const saveExit = () => {
    const id = ensure();
    saveForm(id, f);
    toast("Draft saved. Pick it up any time from My applications.");
    nav("/applications");
  };

  const errList = Object.entries(errs).filter(([k]) => tried || touched[k]);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const P = (k: string) => ({ onBlur: blur(k) });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/new" onClick={(ev) => { ev.preventDefault(); saveExit(); }} className="inline-flex min-h-11 items-center gap-2 font-bold hover:underline hover:decoration-ink/40 hover:underline-offset-4"><ArrowLeft className="size-4" aria-hidden />Save and exit</Link>
        <p aria-live="polite" className="flex items-center gap-2 text-sm font-bold text-slate">
          {net === "offline" ? <><WifiOff className="size-4 text-clay" aria-hidden /><span className="text-clay-text">Not saved. Waiting for a connection</span></> : save === "saving" ? <><Clock className="size-4 animate-pulse" aria-hidden />Saving</> : save === "saved" || done.length > 0 || existing ? <><CheckCircle2 className="size-4 text-leaf" aria-hidden />Saved</> : "We save as you type"}
        </p>
      </div>
      <div className="mb-3">
        <p className="text-slate">{c.title}, {c.institution}, {intake}</p>
      </div>
      <Stepper steps={steps} current={cur} done={done} go={goStep} />

      <Card className="rise mt-6 !p-6 sm:!p-9" key={cur}>
        <h1 className="text-[28px] sm:text-[36px]">{SECTION_LABELS[cur]}</h1>

        {errList.length > 0 && (
          <div ref={summary} tabIndex={-1} role="alert" className="mt-5 rounded-[20px] bg-error-tint p-5 outline-none" >
            <p className="flex items-center gap-2 font-extrabold text-[#a42424]"><AlertCircle className="size-5" aria-hidden />There {errList.length === 1 ? "is 1 problem" : `are ${errList.length} problems`} to fix</p>
            <ul className="mt-2 grid gap-1 text-[15px]">
              {errList.map(([k, m]) => (
                <li key={k}>
                  <a href={`#f-${k}`} onClick={(ev) => { ev.preventDefault(); (document.getElementById(`f-${k}`) ?? document.getElementById(k))?.focus(); }} className="font-semibold text-[#a42424] underline underline-offset-4">{m}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {cur === "about" && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <p className="flex items-start gap-2 rounded-2xl bg-mist px-4 py-3 text-[15px] text-slate sm:col-span-2"><Info className="mt-0.5 size-4.5 shrink-0" aria-hidden />Filled in from your profile. Change anything here and it applies to this application only.</p>
            <Field label="First name" id="f-firstName" error={show("firstName")}>{(p) => <Input {...p} {...P("firstName")} value={f.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />}</Field>
            <Field label="Last name" id="f-lastName" error={show("lastName")}>{(p) => <Input {...p} {...P("lastName")} value={f.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />}</Field>
            <Field label="Date of birth" id="f-dob" error={show("dob")}>{(p) => <Input {...p} {...P("dob")} type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} autoComplete="bday" />}</Field>
            <Field label="Mobile number" id="f-phone" error={show("phone")}>{(p) => <Input {...p} {...P("phone")} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" inputMode="tel" />}</Field>
            <div className="sm:col-span-2"><Field label="Email address" id="f-email" error={show("email")} hint="We send every update here as well as in the hub.">{(p) => <Input {...p} {...P("email")} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />}</Field></div>
            <div className="sm:col-span-2"><Field label="Home address" id="f-address" error={show("address")}>{(p) => <Input {...p} {...P("address")} value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />}</Field></div>
            <Field label="Postcode" id="f-postcode" error={show("postcode")}>{(p) => <Input {...p} {...P("postcode")} value={f.postcode} onChange={(e) => set("postcode", e.target.value.toUpperCase())} autoComplete="postal-code" className="uppercase" />}</Field>
          </div>
        )}

        {cur === "quals" && (
          <div className="mt-6">
            <p className="flex items-start gap-2 rounded-2xl bg-mist px-4 py-3 text-[15px] text-slate"><Info className="mt-0.5 size-4.5 shrink-0" aria-hidden />Filled in from your profile. Add anything missing or remove what is not relevant.</p>
            {errs.quals && (tried || touched.quals) && <p className="mt-3 text-sm font-bold text-error">{errs.quals}</p>}
            <ul className="mt-5 grid gap-5">
              {f.quals.map((q, i) => (
                <li key={q.id} className="rounded-[24px] bg-mist p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base">Qualification {i + 1}</h2>
                    <Button variant="ghost" size="sm" className="min-h-11" onClick={() => set("quals", f.quals.filter((x) => x.id !== q.id))}><Trash2 className="size-4" aria-hidden />Remove<span className="sr-only"> qualification {i + 1}</span></Button>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                    <Field label="Qualification" id={`f-q-${q.id}-name`} error={show(`q-${q.id}-name`)}>{(p) => <Input {...p} {...P(`q-${q.id}-name`)} value={q.name} onChange={(e) => set("quals", f.quals.map((x) => (x.id === q.id ? { ...x, name: e.target.value } : x)))} />}</Field>
                    <Field label="Grade" id={`f-q-${q.id}-grade`} error={show(`q-${q.id}-grade`)}>{(p) => <Input {...p} {...P(`q-${q.id}-grade`)} value={q.grade} onChange={(e) => set("quals", f.quals.map((x) => (x.id === q.id ? { ...x, grade: e.target.value } : x)))} />}</Field>
                    <Field label="Year" id={`f-q-${q.id}-year`} error={show(`q-${q.id}-year`)}>{(p) => <Input {...p} {...P(`q-${q.id}-year`)} inputMode="numeric" maxLength={4} value={q.year} onChange={(e) => set("quals", f.quals.map((x) => (x.id === q.id ? { ...x, year: e.target.value } : x)))} />}</Field>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="mt-5" onClick={() => set("quals", [...f.quals, { id: uid(), name: "", grade: "", year: "" }])}><Plus className="size-4" aria-hidden />Add a qualification</Button>
          </div>
        )}

        {cur === "statement" && (() => {
          const n = wc(f.statement);
          const ok = n >= 200 && n <= 500;
          return (
            <div className="mt-6">
              <p className="text-[17px] leading-relaxed text-slate">Tell the admissions team why you want to study {c.title} and what you will bring. Write 200 to 500 words.</p>
              <ul className="mt-3 grid gap-1.5 text-[15px] text-slate">
                {["Why this subject, and why now", "What you have done that shows you are ready", "How you will fit study around your life"].map((g) => <li key={g} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf" strokeWidth={3} aria-hidden />{g}</li>)}
              </ul>
              <div className="mt-5">
                <Field label="Your personal statement" id="f-statement" error={show("statement")}>
                  {(p) => <TextArea {...p} {...P("statement")} value={f.statement} onChange={(e) => set("statement", e.target.value)} className="!min-h-72 !text-[17px]" />}
                </Field>
                <p aria-live="polite" className={cx("mt-2 flex items-center gap-2 text-sm font-bold", ok ? "text-leaf" : n > 500 ? "text-error" : "text-slate")}>
                  {ok ? <CheckCircle2 className="size-4" aria-hidden /> : <Info className="size-4" aria-hidden />}
                  <span className="tnum">{n} words</span>
                  {n < 200 ? `Add at least ${200 - n} more.` : n > 500 ? `${n - 500} over the limit.` : "That is within the range."}
                </p>
              </div>
            </div>
          );
        })()}

        {cur === "references" && (
          <div className="mt-6">
            <p className="text-[17px] leading-relaxed text-slate">This course needs {c.references} {c.references === 1 ? "referee" : "referees"}. You can submit before the references arrive, and we will remind you if one is late.</p>
            <ul className="mt-5 grid gap-5">
              {Array.from({ length: c.references }).map((_, i) => {
                const r = f.referees[i] ?? { id: `new${i}`, name: "", email: "", mode: "email" as const };
                const upd = (patch: Partial<typeof r>) => {
                  const arr = Array.from({ length: c.references }).map((__, j) => f.referees[j] ?? { id: `new${j}`, name: "", email: "", mode: "email" as const });
                  arr[i] = { ...r, ...patch };
                  set("referees", arr);
                };
                return (
                  <li key={i} className="rounded-[24px] bg-mist p-4 sm:p-5">
                    <h2 className="text-lg">Referee {i + 1}</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Radio name={`rm${i}`} value="email" current={r.mode} onChange={(v) => upd({ mode: v as "email" })} hint="They get a secure link.">Email them a request</Radio>
                      <Radio name={`rm${i}`} value="letter" current={r.mode} onChange={(v) => upd({ mode: v as "letter" })} hint="PDF, JPG or PNG.">Upload a letter</Radio>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Referee's full name" id={`f-r-${r.id}-name`} error={show(`r-${r.id}-name`)}>{(p) => <Input {...p} {...P(`r-${r.id}-name`)} value={r.name} onChange={(e) => upd({ name: e.target.value })} />}</Field>
                      {r.mode === "email" ? (
                        <Field label="Referee's email" id={`f-r-${r.id}-email`} error={show(`r-${r.id}-email`)}>{(p) => <Input {...p} {...P(`r-${r.id}-email`)} type="email" value={r.email} onChange={(e) => upd({ email: e.target.value })} />}</Field>
                      ) : (
                        <div>
                          <p className="mb-1.5 text-[15px] font-bold">Reference letter</p>
                          {f.docs[`Reference letter ${i + 1}`] ? (
                            <p className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 font-bold"><FileText className="size-4 text-teal" aria-hidden /><span className="truncate">{f.docs[`Reference letter ${i + 1}`]}</span></p>
                          ) : (
                            <Button variant="secondary" className="w-full" id={`f-r-${r.id}-letter`} onClick={() => setUp({ slot: `Reference letter ${i + 1}` })}><UpIcon className="size-4" aria-hidden />Upload letter</Button>
                          )}
                          {show(`r-${r.id}-letter`) && <p className="mt-1.5 text-sm font-semibold text-error">{show(`r-${r.id}-letter`)}</p>}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {cur === "documents" && (
          <div className="mt-6">
            <p className="text-[17px] leading-relaxed text-slate">{c.institution} asks for these. Pick from your documents or add a new file. PDF, JPG or PNG, up to 10 MB. On your phone you can take a photo.</p>
            <ul className="mt-5 grid gap-3">
              {c.docs.map((d) => {
                const have = f.docs[d];
                const err = show(`d-${d}`);
                return (
                  <li key={d} className={cx("flex flex-wrap items-center gap-3 rounded-[22px] p-4", have ? "bg-[#e8f8f3]" : err ? "bg-error-tint" : "bg-mist")}>
                    {have ? <CheckCircle2 className="size-6 shrink-0 text-leaf" aria-hidden /> : <FileText className="size-6 shrink-0 text-teal" aria-hidden />}
                    <div className="min-w-0 flex-1 basis-48">
                      <p id={`f-d-${d}`} tabIndex={-1} className="font-extrabold leading-snug">{d}</p>
                      <p className="truncate text-sm text-slate">{have ?? (err ? err : "Not added yet")}</p>
                    </div>
                    <Button size="sm" variant={have ? "ghost" : "primary"} className="min-h-11" onClick={() => setUp({ slot: d })}>{have ? "Replace" : "Add document"}<span className="sr-only"> for {d}</span></Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {cur === "review" && (
          <div className="mt-6">
            <p className="text-[17px] text-slate">Check everything, then confirm and submit. You can change any section with Edit.</p>
            <ul className="mt-5 grid gap-3">
              {steps.filter((x) => x !== "review").map((x) => {
                const e = validate(x, f, c.id);
                const bad = Object.keys(e).length > 0;
                return (
                  <li key={x} className={cx("rounded-[22px] p-4 sm:p-5", bad ? "bg-error-tint" : "bg-mist")}>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg">{SECTION_LABELS[x]}</h2>
                      <Button variant="secondary" size="sm" className="min-h-11" onClick={() => goStep(x)}><Pencil className="size-3.5" aria-hidden />Edit<span className="sr-only"> {SECTION_LABELS[x]}</span></Button>
                    </div>
                    <div className="mt-2 text-[15px] leading-relaxed text-ink/90">
                      {x === "about" && <p>{f.firstName} {f.lastName}, born {f.dob ? fmt(f.dob) : "not given"}.<br />{f.address}, {f.postcode}<br />{f.email}, {f.phone}</p>}
                      {x === "quals" && <ul className="grid gap-0.5">{f.quals.map((q) => <li key={q.id}>{q.name}, {q.grade}, {q.year}</li>)}</ul>}
                      {x === "statement" && <p className="line-clamp-4 text-slate">{f.statement || "Not written yet."}</p>}
                      {x === "references" && <ul>{f.referees.map((r) => <li key={r.id}>{r.name}, {r.mode === "email" ? r.email : "letter uploaded"}</li>)}</ul>}
                      {x === "documents" && <ul>{c.docs.map((d) => <li key={d} className="flex items-center gap-2">{f.docs[d] ? <Check className="size-4 text-leaf" strokeWidth={3} aria-hidden /> : <AlertCircle className="size-4 text-error" aria-hidden />}{d}: {f.docs[d] ?? "missing"}</li>)}</ul>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <h2 className="mt-8 text-xl">Declarations</h2>
            <div className="mt-4 grid gap-5">
              <div id="f-accurate" tabIndex={-1}><Check2 checked={f.accurate} onChange={(v) => set("accurate", v)} invalid={!!show("accurate")}>I confirm the information in this application is accurate and complete.</Check2>{show("accurate") && <p className="mt-2 flex items-center gap-1.5 pl-9 text-sm font-semibold text-error"><AlertCircle className="size-4" aria-hidden />{show("accurate")}</p>}</div>
              <div id="f-consent" tabIndex={-1}><Check2 checked={f.consent} onChange={(v) => set("consent", v)} invalid={!!show("consent")}>I consent to educateU sharing my application with {c.institution} so they can consider it.</Check2>{show("consent") && <p className="mt-2 flex items-center gap-1.5 pl-9 text-sm font-semibold text-error"><AlertCircle className="size-4" aria-hidden />{show("consent")}</p>}</div>
            </div>
            {blocked && <div className="mt-6"><Banner tone="error" title={`You have submitted five applications for ${intake}`}>That is the limit for one intake. Your draft is saved. Withdraw an application, or choose a course with a different intake.</Banner></div>}
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-6">
          <div className="flex gap-2">
            {idx > 0 ? <Button variant="ghost" onClick={() => goStep(steps[idx - 1])}><ArrowLeft className="size-4" aria-hidden />Back</Button> : <span />}
            <Button variant="ghost" onClick={saveExit}><Save className="size-4" aria-hidden />Save and exit</Button>
          </div>
          {cur === "review" ? (
            <Button size="lg" loading={submitting} onClick={onSubmit}><Send className="size-4.5" aria-hidden />Submit application</Button>
          ) : (
            <Button size="lg" arrow onClick={onContinue}>Continue</Button>
          )}
        </div>
      </Card>

      {up && <UploadDialog open title={`Add: ${up.slot}`} slot={up.slot} onClose={() => setUp(null)} onPick={(n) => { setF((p) => ({ ...p, docs: { ...p.docs, [up.slot]: n } })); setTouched((t) => ({ ...t })); }} />}
    </div>
  );
}

export function Confirmation() {
  const { key: id } = useParams();
  const { s } = useHub();
  const a = s.apps.find((x) => x.id === id);
  if (!a) return <Navigate to="/applications" replace />;
  const c = course(a.courseId);
  const by = addDays("2026-10-07", c.turnaroundDays);
  const next = [
    "The admissions team checks your application is complete.",
    c.interview ? `You may be invited to an ${c.interview === "assessment" ? "assessment" : "interview"}. We will tell you the date here and by email.` : "They review it and record a decision.",
    "We email you at every step. You can follow it any time on the Progress tab.",
  ];
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="rise !p-7 text-center sm:!p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-mint text-abyss"><Check className="size-8" strokeWidth={3} aria-hidden /></span>
        <h1 className="mt-6 text-[32px] sm:text-[42px]">Application submitted</h1>
        <p className="mx-auto mt-3 max-w-md text-[18px] leading-relaxed text-slate">{c.title} at {c.institution}. We have sent a confirmation to {s.profile.email}.</p>
        <dl className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-mist p-4"><dt className="text-sm font-bold text-slate">Reference</dt><dd className="tnum text-lg font-extrabold">{a.ref}</dd></div>
          <div className="rounded-2xl bg-mist p-4"><dt className="text-sm font-bold text-slate">Decision expected by</dt><dd className="text-lg font-extrabold">{fmt(by)}</dd></div>
        </dl>
        <h2 className="mt-9 text-xl">What happens next</h2>
        <ol className="mx-auto mt-4 grid max-w-md gap-3 text-left">
          {next.map((t, i) => <li key={t} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-extrabold text-white">{i + 1}</span><span className="pt-0.5 text-[16px] leading-snug">{t}</span></li>)}
        </ol>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <LinkButton to={`/applications/${a.id}`} arrow>View application</LinkButton>
          <LinkButton to="/" variant="secondary">Go to dashboard</LinkButton>
        </div>
      </Card>
    </div>
  );
}
