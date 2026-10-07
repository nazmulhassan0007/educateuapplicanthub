import { useMemo, useState } from "react";
import { ArrowUpRight, Clock, MapPin, Search, SlidersHorizontal, X, GraduationCap, BadgePoundSterling } from "../components/icons";
import { Link } from "react-router-dom";
import { Button, Card, Chip, CourseImage, Empty, Field, Input, PageHeader, Select } from "../components/ui";
import { COURSES, INSTITUTIONS, INTAKES, LEVELS, MODES, SUBJECTS } from "../data/courses";
import { profileCompleteness, useHub } from "../store";
import { ShieldCheck } from "../components/icons";

export function ProfileGate() {
  const { s, setProfile } = useHub();
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="One quick thing first" lead="We keep your details in one profile and reuse them for every application. You only fill this in once." />
      <Card className="rise">
        <h2 className="text-xl">Your education history</h2>
        <p className="mt-1 text-slate">Tell us where you studied most recently. You can add the rest of your qualifications inside each application.</p>
        <form
          className="mt-5 grid gap-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!v.trim()) return setErr("Enter where you studied most recently, for example a school, college or university.");
            setProfile({ education: v.trim() });
          }}
        >
          <Field label="Most recent school, college or university" error={err} hint="For example: Leeds City College, 2022 to 2024.">
            {(p) => <Input {...p} value={v} onChange={(e) => { setV(e.target.value); if (err) setErr(""); }} autoComplete="organization" />}
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-slate"><ShieldCheck className="size-4" aria-hidden />Stored on your profile, never shared until you submit.</p>
            <Button type="submit" arrow>Save and find a course</Button>
          </div>
        </form>
      </Card>
      <p className="mt-4 text-sm text-slate">Signed in as {s.profile.email}</p>
    </div>
  );
}

export function FindCourse({ discover }: { discover?: boolean }) {
  const { s } = useHub();
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [inst, setInst] = useState("");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState("");
  const [intake, setIntake] = useState("");
  const [loc, setLoc] = useState("");
  const [open, setOpen] = useState(false);
  const prof = profileCompleteness(s.profile);

  const locations = Array.from(new Set(COURSES.map((c) => c.location.split(",").pop()!.trim())));
  const list = useMemo(
    () =>
      COURSES.filter((c) => {
        const t = `${c.title} ${c.institution} ${c.subject}`.toLowerCase();
        return (
          (!q || q.toLowerCase().split(/\s+/).every((w) => t.includes(w))) &&
          (!subject || c.subject === subject) &&
          (!inst || c.institution === inst) &&
          (!level || c.level === level) &&
          (!mode || c.mode === mode) &&
          (!intake || c.intakes.includes(intake)) &&
          (!loc || c.location.endsWith(loc))
        );
      }),
    [q, subject, inst, level, mode, intake, loc],
  );
  const active = [subject, inst, level, mode, intake, loc].filter(Boolean).length;
  const clear = () => { setSubject(""); setInst(""); setLevel(""); setMode(""); setIntake(""); setLoc(""); setQ(""); };

  if (!discover && prof.pct < 100) return <ProfileGate />;

  const filters = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Subject">{(p) => <Select {...p} value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">All subjects</option>{SUBJECTS.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
      <Field label="Institution">{(p) => <Select {...p} value={inst} onChange={(e) => setInst(e.target.value)}><option value="">All institutions</option>{INSTITUTIONS.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
      <Field label="Level">{(p) => <Select {...p} value={level} onChange={(e) => setLevel(e.target.value)}><option value="">All levels</option>{LEVELS.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
      <Field label="Study mode">{(p) => <Select {...p} value={mode} onChange={(e) => setMode(e.target.value)}><option value="">Any study mode</option>{MODES.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
      <Field label="Location">{(p) => <Select {...p} value={loc} onChange={(e) => setLoc(e.target.value)}><option value="">Anywhere</option>{locations.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
      <Field label="Intake">{(p) => <Select {...p} value={intake} onChange={(e) => setIntake(e.target.value)}><option value="">Any intake</option>{INTAKES.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
    </div>
  );

  return (
    <div>
      <PageHeader title={discover ? "Discover courses" : "Find a course"} lead={discover ? "Every course you can apply for, in one place. Fees, length and entry requirements are shown up front, and you apply from the course page." : "Pick the course you want to apply for. Entry requirements and the next intake are shown on every result."} />
      <div className="rise rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgb(1_62_91/0.07)] sm:p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">Search courses by keyword</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate" aria-hidden />
            <Input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by course, subject or institution" className="!min-h-14 !pl-12 !text-[17px]" />
          </div>
          <Button variant="secondary" className="min-h-14 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <SlidersHorizontal className="size-4.5" aria-hidden />
            Filters{active ? ` (${active})` : ""}
          </Button>
        </div>
        <div className={`${open ? "block" : "hidden"} mt-4 lg:block`}>{filters}</div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="font-bold"><span className="tnum">{list.length}</span> course{list.length === 1 ? "" : "s"} found</p>
        {(active > 0 || q) && <Button variant="ghost" size="sm" className="min-h-11" onClick={clear}><X className="size-4" aria-hidden />Clear filters</Button>}
      </div>

      {list.length === 0 ? (
        <div className="mt-4"><Empty icon={<Search className="size-7" />} title="No courses match" action={<Button variant="secondary" onClick={clear}>Clear filters</Button>}>Try fewer filters, or search for a subject such as business, health or computing.</Empty></div>
      ) : (
        <ul className="mt-4 grid gap-4">
          {list.map((c, i) => (
            <li key={c.id} className="rise" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
              <Link to={`/new/${c.id}`} className="group grid overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgb(1_62_91/0.07)] transition-[box-shadow,transform] duration-300 ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgb(1_62_91/0.16),0_24px_44px_-30px_rgb(1_43_64/0.55)] sm:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
                <CourseImage image={c.image} institution={c.institution} className="aspect-[16/9] sm:aspect-auto sm:min-h-[220px]" priority={i < 2} />
                <div className="min-w-0 p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[21px] leading-snug sm:text-[24px]">{c.title}</h2>
                    <p className="mt-0.5 text-slate">{c.institution}</p>
                  </div>
                  <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-mist transition-colors duration-300 group-hover:bg-ink group-hover:text-white sm:grid"><ArrowUpRight className="size-5" aria-hidden /></span>
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-slate">
                  <li className="flex items-center gap-1.5"><GraduationCap className="size-4" aria-hidden />{c.level}, {c.mode.toLowerCase()}</li>
                  <li className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{c.location}</li>
                  <li className="flex items-center gap-1.5"><Clock className="size-4" aria-hidden />Next intake {c.intakes[0]}</li>
                  <li className="flex items-center gap-1.5"><BadgePoundSterling className="size-4" aria-hidden />{c.fees}</li>
                </ul>
                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed"><span className="font-bold">Entry: </span>{c.entry.slice(0, 2).join(". ")}.</p>
                {c.extra && (
                  <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate">{c.overview}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.extra && <Chip tone="ink">{c.extra.credits} credits</Chip>}
                  {c.extra && <Chip>{c.extra.durations}</Chip>}
                  {c.extra && <Chip>Coursework, no exams</Chip>}
                  {c.instalment && <Chip tone="success">Instalment plan available</Chip>}
                  {c.interview && <Chip>{c.interview === "both" ? "Interview and assessment" : c.interview === "interview" ? "Interview" : "Assessment"}</Chip>}
                  {c.references > 0 && <Chip>{c.references} reference{c.references > 1 ? "s" : ""}</Chip>}
                  {c.intakes.length > 1 && <Chip>{c.intakes.join(" and ")}</Chip>}
                </div>
              </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
