import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Download, Plus, ShieldCheck, Trash2, TriangleAlert } from "../components/icons";
import { Banner, Button, Card, Check2, Dialog, Field, Input, PageHeader } from "../components/ui";
import { profileCompleteness, useHub } from "../store";

export function Profile() {
  const { s, setProfile, toast } = useHub();
  const p = s.profile;
  const prof = profileCompleteness(p);
  const [del, setDel] = useState(false);
  const [confirmTxt, setConfirmTxt] = useState("");
  const [saved, setSaved] = useState(false);
  const upd = (patch: Partial<typeof p>) => { setProfile(patch); setSaved(true); window.setTimeout(() => setSaved(false), 1600); };
  return (
    <div>
      <PageHeader title="Profile & account" lead="Your details are filled into every new application. Change them here and they update next time.">
        <p aria-live="polite" className="flex min-h-11 items-center gap-2 text-sm font-bold text-slate">{saved ? <><CheckCircle2 className="size-4 text-leaf" aria-hidden />Saved</> : "Changes save as you type"}</p>
      </PageHeader>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <Card as="section" aria-labelledby="about" id="about" className="rise scroll-mt-24">
            <h2 id="about" className="text-2xl">About you</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="First name">{(f) => <Input {...f} value={p.firstName} onChange={(e) => upd({ firstName: e.target.value })} autoComplete="given-name" />}</Field>
              <Field label="Last name">{(f) => <Input {...f} value={p.lastName} onChange={(e) => upd({ lastName: e.target.value })} autoComplete="family-name" />}</Field>
              <Field label="Date of birth">{(f) => <Input {...f} type="date" value={p.dob} onChange={(e) => upd({ dob: e.target.value })} />}</Field>
              <Field label="Mobile number">{(f) => <Input {...f} type="tel" value={p.phone} onChange={(e) => upd({ phone: e.target.value })} />}</Field>
              <div className="sm:col-span-2"><Field label="Email address" hint="This is your educateu.com login. Change it from your educateu.com account.">{(f) => <Input {...f} type="email" value={p.email} readOnly />}</Field></div>
              <div className="sm:col-span-2"><Field label="Home address">{(f) => <Input {...f} value={p.address} onChange={(e) => upd({ address: e.target.value })} />}</Field></div>
              <Field label="Postcode">{(f) => <Input {...f} className="uppercase" value={p.postcode} onChange={(e) => upd({ postcode: e.target.value.toUpperCase() })} />}</Field>
            </div>
          </Card>

          <Card as="section" aria-labelledby="edu" id="education" className="rise scroll-mt-24" style={{ animationDelay: "60ms" }}>
            <h2 id="edu" className="text-2xl">Education history</h2>
            <div className="mt-5 grid gap-5">
              <Field label="Most recent school, college or university" hint="For example: Leeds City College, 2022 to 2024.">{(f) => <Input {...f} value={p.education} onChange={(e) => upd({ education: e.target.value })} />}</Field>
              <div>
                <h3 className="text-lg">Qualifications</h3>
                <ul className="mt-3 grid gap-2">
                  {p.quals.map((q) => (
                    <li key={q.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-mist px-4 py-3">
                      <span className="min-w-0 flex-1 font-bold leading-snug">{q.name}<span className="block text-sm font-medium text-slate">{q.grade}, {q.year}</span></span>
                      <Button variant="ghost" size="sm" className="min-h-11" onClick={() => upd({ quals: p.quals.filter((x) => x.id !== q.id) })}><Trash2 className="size-4" aria-hidden />Remove<span className="sr-only"> {q.name}</span></Button>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="mt-4" onClick={() => upd({ quals: [...p.quals, { id: Math.random().toString(36).slice(2, 7), name: "BTEC Level 3 in Health and Social Care", grade: "Merit", year: "2012" }] })}><Plus className="size-4" aria-hidden />Add a qualification</Button>
                <p className="mt-2 text-sm text-slate">This adds an example so you can see how it looks. You edit the details inside each application.</p>
              </div>
            </div>
          </Card>

          <Card as="section" aria-labelledby="priv" className="rise" style={{ animationDelay: "120ms" }}>
            <h2 id="priv" className="text-2xl">Privacy and account</h2>
            <p className="mt-2 max-w-2xl text-slate">We only use your details to process your applications. Read our <Link to="/privacy" className="font-bold underline underline-offset-4">privacy notice</Link> for how, and for how long, we keep them.</p>
            <div className="mt-5"><Check2 checked={p.emailAlerts} onChange={(v) => upd({ emailAlerts: v })}>Email me when something changes on an application. Recommended, because deadlines matter.</Check2></div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => toast("Your data export is being prepared. We will email a download link to " + p.email + ".")}><Download className="size-4" aria-hidden />Download my data</Button>
              <Button variant="danger" onClick={() => setDel(true)}><Trash2 className="size-4" aria-hidden />Request account deletion</Button>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-slate"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />If you are inactive we warn you before your session times out, and any autosaved work is kept.</p>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card className="rise" style={{ animationDelay: "80ms" }} aria-label="Profile completeness">
            <h2 className="text-xl">Profile {prof.pct}% complete</h2>
            <div role="progressbar" aria-valuenow={prof.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness" className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#d5e2e7]"><div className="h-full rounded-full bg-ink transition-[width] duration-500 ease-[var(--ease-brand)]" style={{ width: `${prof.pct}%` }} /></div>
            <ul className="mt-4 grid gap-2.5">
              {prof.items.map((i) => (
                <li key={i.label} className="flex items-center gap-2.5 text-[15px]">{i.ok ? <CheckCircle2 className="size-5 text-leaf" aria-hidden /> : <TriangleAlert className="size-5 text-clay" aria-hidden />}<span className={i.ok ? "" : "font-extrabold"}>{i.label}{!i.ok && <span className="sr-only"> (missing)</span>}</span></li>
              ))}
            </ul>
            {prof.pct === 100 && <p className="mt-4 text-sm font-bold text-leaf">All done. Your applications will fill in automatically.</p>}
          </Card>
        </aside>
      </div>

      <Dialog open={del} onClose={() => { setDel(false); setConfirmTxt(""); }} title="Request account deletion" footer={<><Button variant="ghost" onClick={() => { setDel(false); setConfirmTxt(""); }}>Keep my account</Button><Button variant="danger" disabled={confirmTxt.trim().toLowerCase() !== "delete"} onClick={() => { setDel(false); setConfirmTxt(""); toast("Deletion requested. We will confirm by email within 30 days."); }}>Request deletion</Button></>}>
        <Banner tone="notice" title="This also closes your applications.">Open applications are withdrawn. You can still download your data first.</Banner>
        <div className="mt-5"><Field label='Type "delete" to confirm'>{(f) => <Input {...f} value={confirmTxt} onChange={(e) => setConfirmTxt(e.target.value)} autoComplete="off" />}</Field></div>
      </Dialog>
    </div>
  );
}
