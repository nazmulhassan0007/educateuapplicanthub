import { useState } from "react";
import { AlertCircle, ArrowLeft, BadgePoundSterling, Check, CheckCircle2, ClipboardCheck, Clock, FileText, GraduationCap, MapPin, MessageCircle, Users, XCircle } from "../components/icons";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, CourseImage, Empty, InstitutionTile, LinkButton, Radio } from "../components/ui";
import { COURSES } from "../data/courses";
import { submittedCount } from "../lib/app";
import { profileCompleteness, useHub } from "../store";
import { ProfileGate } from "./FindCourse";
import { fmt } from "../lib/date";

function useCourse() {
  const { courseId } = useParams();
  return COURSES.find((c) => c.id === courseId);
}

export function CourseDetails() {
  const c = useCourse();
  const nav = useNavigate();
  const [intake, setIntake] = useState(c && c.intakes.length === 1 ? c.intakes[0] : "");
  const [err, setErr] = useState("");
  if (!c) return <Empty icon={<AlertCircle className="size-7" />} title="Course not found" action={<LinkButton to="/new">Find a course</LinkButton>}>Try searching again.</Empty>;
  const facts = [
    { icon: GraduationCap, k: "Level", v: c.level },
    { icon: Clock, k: "Study mode", v: c.mode },
    { icon: MapPin, k: "Location", v: c.location },
    { icon: BadgePoundSterling, k: "Fees", v: c.fees },
    { icon: Users, k: "References", v: c.references === 0 ? "Not needed" : `${c.references} needed` },
    { icon: MessageCircle, k: "Interview or assessment", v: c.interview ? (c.interview === "both" ? "Interview and assessment" : c.interview === "interview" ? "Interview" : "Assessment") : "None" },
  ];
  return (
    <div>
      <Link to="/new" className="mb-5 inline-flex min-h-11 items-center gap-2 font-bold hover:underline hover:decoration-ink/40 hover:underline-offset-4"><ArrowLeft className="size-4" aria-hidden />Find a course</Link>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8">
        <div className="grid gap-6">
          <CourseImage image={c.image} institution={c.institution} className="rise aspect-[16/7] rounded-[28px]" priority />
          <Card className="rise">
            <div className="flex items-start gap-4">
              <InstitutionTile name={c.institution} size={56} />
              <div className="min-w-0">
                <h1 className="text-[28px] leading-tight sm:text-[40px]">{c.title}</h1>
                <p className="mt-1 text-[17px] text-slate">{c.institution}</p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed">{c.overview}</p>
            <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.k} className="flex gap-3">
                  <f.icon className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
                  <div><dt className="text-sm font-bold text-slate">{f.k}</dt><dd className="font-bold leading-snug">{f.v}</dd></div>
                </div>
              ))}
            </dl>
          </Card>
          {c.extra && (
            <Card className="rise" as="section" aria-labelledby="study" style={{ animationDelay: "40ms" }}>
              <h2 id="study" className="text-2xl">Who this is for</h2>
              <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-slate">{c.extra.who}</p>
              <h2 className="mt-8 text-2xl">What you will study</h2>
              <p className="mt-2 text-slate">{c.extra.credits} credits over {c.extra.durations}. Coursework only, no exams.</p>
              <ul className="mt-4 grid gap-2">
                {c.extra.units.map((u) => <li key={u} className="flex items-start gap-3 rounded-2xl bg-mist px-4 py-3 font-semibold leading-snug"><Check className="mt-0.5 size-4.5 shrink-0 text-leaf" strokeWidth={3} aria-hidden />{u}</li>)}
              </ul>
              {c.extra.optionalUnits && (
                <>
                  <h3 className="mt-6 text-lg">Optional units, choose two</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">{c.extra.optionalUnits.map((u) => <li key={u} className="rounded-full bg-ink/7 px-3.5 py-1.5 text-[15px] font-semibold">{u}</li>)}</ul>
                </>
              )}
              <h3 className="mt-8 text-lg">Career paths</h3>
              <ul className="mt-3 flex flex-wrap gap-2">{c.extra.careers.map((u) => <li key={u} className="rounded-full bg-[#e8f8f3] px-3.5 py-1.5 text-[15px] font-bold text-[#075f49]">{u}</li>)}</ul>
            </Card>
          )}
          <Card className="rise" style={{ animationDelay: "60ms" }} as="section" aria-labelledby="entry">
            <h2 id="entry" className="text-2xl">Entry requirements</h2>
            <ul className="mt-4 grid gap-2.5">
              {c.entry.map((e) => <li key={e} className="flex items-start gap-3"><Check className="mt-1 size-4.5 shrink-0 text-leaf" strokeWidth={3} aria-hidden /><span className="text-[17px]">{e}</span></li>)}
            </ul>
          </Card>
          <Card className="rise" style={{ animationDelay: "100ms" }} as="section" aria-labelledby="fees">
            <h2 id="fees" className="text-2xl">Fees and paying</h2>
            <p className="mt-3 text-[17px]"><strong>{c.fees}.</strong> There is no fee to apply.</p>
            {c.extra ? (<ul className="mt-4 grid gap-2">{c.extra.plans.map((p) => <li key={p} className="rounded-2xl bg-mist px-4 py-3 font-semibold">{p}</li>)}</ul>) : c.instalment ? <p className="mt-2 text-slate">{c.instalment} Plan details are confirmed once your place is secured. You do not need to set anything up now.</p> : <p className="mt-2 text-slate">No instalment plan is offered for this course.</p>}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card className="rise !bg-deep text-white" style={{ animationDelay: "80ms" }} data-dark>
            <h2 className="text-2xl">Apply for this course</h2>
            <fieldset className="mt-5">
              <legend className="mb-2.5 font-bold text-white/85">Choose your intake</legend>
              <div className="grid gap-2.5 text-ink">
                {c.intakes.map((i) => (
                  <Radio key={i} name="intake" value={i} current={intake} onChange={(v) => { setIntake(v); setErr(""); }} hint={`Starts ${fmt(c.startDates[i])}`}>{i}</Radio>
                ))}
              </div>
              {err && <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-bold text-[#ffb59b]"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />{err}</p>}
            </fieldset>
            <ul className="mt-5 grid gap-2 text-[15px] text-white/85">
              <li className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />You will hear back about {c.turnaroundDays} days after you submit.</li>
              <li className="flex items-start gap-2"><FileText className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />Takes about 20 minutes. We save as you go.</li>
            </ul>
            <Button variant="mint" size="lg" arrow className="mt-6 w-full" onClick={() => (intake ? nav(`/new/${c.id}/check?intake=${encodeURIComponent(intake)}`) : setErr("Choose an intake to continue."))}>Apply</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ApplyCheck() {
  const c = useCourse();
  const [sp] = useSearchParams();
  const intake = sp.get("intake") ?? "";
  const { s } = useHub();
  const nav = useNavigate();
  const [ans, setAns] = useState<Record<number, string>>({});
  const [stage, setStage] = useState<"form" | "out">("form");
  const [tried, setTried] = useState(false);
  if (profileCompleteness(s.profile).pct < 100) return <ProfileGate />;
  if (!c || !c.intakes.includes(intake)) return <Empty icon={<AlertCircle className="size-7" />} title="Choose a course and intake first" action={<LinkButton to="/new">Find a course</LinkButton>}>We need to know which course and intake you are applying for.</Empty>;

  // Rule (a): a non-closed application for the same course and intake.
  const dup = s.apps.find((a) => a.courseId === c.id && a.intake === intake && !a.outcome);
  // Rule (b): already submitted five applications for that intake.
  const full = submittedCount(s.apps, intake) >= 5;
  // Rule (c): holds an accepted offer for that intake.
  const accepted = s.apps.find((a) => a.intake === intake && !a.outcome && (a.offer?.response || a.stage === 5));
  const blocked = dup ? "a" : full ? "b" : accepted ? "c" : null;

  const checks = [
    { ok: !dup, label: "You have not already applied for this course and intake" },
    { ok: !full, label: `You have submitted fewer than five applications for ${intake}` },
    { ok: !accepted, label: "You do not hold an accepted offer for this intake" },
  ];

  const failed = c.eligibility.find((q, i) => ans[i] && ans[i] !== q.answer);
  const complete = c.eligibility.every((_, i) => ans[i]);

  if (blocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to={`/new/${c.id}`} className="mb-5 inline-flex min-h-11 items-center gap-2 font-bold hover:underline hover:decoration-ink/40 hover:underline-offset-4"><ArrowLeft className="size-4" aria-hidden />Course details</Link>
        <Card className="rise !p-7 sm:!p-9">
          <XCircle className="size-9 text-error" aria-hidden />
          <h1 className="mt-4 text-[30px] sm:text-[36px]">You cannot start this application</h1>
          <p className="mt-3 text-[18px] leading-relaxed text-ink">
            {blocked === "a" && `You already have an application for ${c.title} for ${intake}. Each course can only be applied for once per intake.`}
            {blocked === "b" && `You have already submitted five applications for ${intake}. That is the most you can have for one intake, and withdrawn or closed ones still count.`}
            {blocked === "c" && `You hold an accepted offer for ${intake}, so you cannot start a new application for that intake.`}
          </p>
          <ul className="mt-6 grid gap-2" aria-label="Checks">
            {checks.map((k) => (
              <li key={k.label} className="flex items-start gap-3 text-[15px]">{k.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden /> : <XCircle className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />}<span className={k.ok ? "text-slate" : "font-bold"}>{k.label}</span></li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            {dup && <LinkButton to={dup.stage === 1 ? `/apply/${dup.id}/about` : `/applications/${dup.id}`} arrow>{dup.stage === 1 ? "Continue your draft" : "View your application"}</LinkButton>}
            <LinkButton to={`/new/${c.id}`} variant="secondary">{c.intakes.length > 1 ? "Choose a different intake" : "Back to course"}</LinkButton>
            <LinkButton to="/applications" variant="ghost">My applications</LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "out" && failed) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="rise !p-7 sm:!p-9">
          <ClipboardCheck className="size-9 text-clay-text" aria-hidden />
          <h1 className="mt-4 text-[30px] sm:text-[36px]">This course may not be right for you yet</h1>
          <p className="mt-3 text-[18px] leading-relaxed">{failed.why}</p>
          <p className="mt-3 text-slate">We have not saved anything. If you think we have this wrong, the admissions team is happy to talk it through.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton to="/messages?new=1" arrow>Message admissions</LinkButton>
            <LinkButton to="/new" variant="secondary">Find another course</LinkButton>
            <Button variant="ghost" onClick={() => { setStage("form"); setTried(false); }}>Change my answers</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/new/${c.id}`} className="mb-5 inline-flex min-h-11 items-center gap-2 font-bold hover:underline hover:decoration-ink/40 hover:underline-offset-4"><ArrowLeft className="size-4" aria-hidden />Course details</Link>
      <Card className="rise !p-7 sm:!p-9">
        <h1 className="text-[28px] sm:text-[34px]">Before you start</h1>
        <p className="mt-2 text-slate">{c.title}, {c.institution}, {intake}.</p>
        <ul className="mt-5 grid gap-2" aria-label="Checks passed">
          {checks.map((k) => <li key={k.label} className="flex items-start gap-3 text-[15px]"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden /><span>{k.label}</span></li>)}
        </ul>
        <hr className="my-7 border-ink/10" />
        <h2 className="text-xl">A few quick questions</h2>
        <p className="mt-1 text-slate">These help the course team check you can start. Nothing is saved as a draft yet.</p>
        <div className="mt-6 grid gap-7">
          {c.eligibility.map((q, i) => (
            <fieldset key={q.q}>
              <legend className="mb-3 text-[17px] font-bold leading-snug">{q.q}</legend>
              <div className="grid grid-cols-2 gap-3">
                <Radio name={`q${i}`} value="yes" current={ans[i] ?? ""} onChange={(v) => setAns((a) => ({ ...a, [i]: v }))}>Yes</Radio>
                <Radio name={`q${i}`} value="no" current={ans[i] ?? ""} onChange={(v) => setAns((a) => ({ ...a, [i]: v }))}>No</Radio>
              </div>
              {tried && !ans[i] && <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-bold text-error"><AlertCircle className="size-4" aria-hidden />Choose yes or no.</p>}
            </fieldset>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button size="lg" arrow onClick={() => { setTried(true); if (!complete) return; if (failed) setStage("out"); else nav(`/apply/new~${c.id}~${encodeURIComponent(intake)}/about`); }}>Continue to application</Button>
        </div>
      </Card>
    </div>
  );
}
