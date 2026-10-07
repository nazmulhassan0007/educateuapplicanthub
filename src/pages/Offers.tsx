import { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, BellRing, CheckCircle2, Clock, Gift, Lock, ShieldCheck } from "../components/icons";
import { useNavigate } from "react-router-dom";
import { Banner, Button, Card, Chip, Dialog, Empty, InstitutionTile, LinkButton, PageHeader, Radio } from "../components/ui";
import type { Application } from "../data/types";
import { cOf, isActive, liveOffers } from "../lib/app";
import { daysUntil, fmt } from "../lib/date";
import { useHub } from "../store";

type Choice = "main" | "insurance" | "firm" | "none";

function OfferCard({ a, choice, set, locked, onDecline }: { a: Application; choice: Choice; set: (c: Choice) => void; locked: boolean; onDecline: () => void }) {
  const c = cOf(a);
  const o = a.offer!;
  const days = daysUntil(o.deadline);
  return (
    <Card as="article" className="!p-5 sm:!p-7" aria-labelledby={`of-${a.id}`}>
      <div className="flex flex-wrap items-start gap-4">
        <InstitutionTile name={c.institution} size={52} />
        <div className="min-w-0 flex-1 basis-60">
          <h3 id={`of-${a.id}`} className="text-[22px] leading-snug">{c.title}</h3>
          <p className="mt-0.5 text-slate">{c.institution}. Starts {a.intake}.</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <Chip tone={o.type === "unconditional" ? "success" : "neutral"}>{o.type === "unconditional" ? "Unconditional offer" : "Conditional offer"}</Chip>
          <Chip tone={days <= 7 ? "action" : "neutral"} icon={<Clock className="size-3.5" aria-hidden />}>Respond by {fmt(o.deadline)}</Chip>
        </div>
      </div>

      {o.type === "conditional" ? (
        <div className="mt-5 rounded-2xl bg-mist p-4">
          <h4 className="text-base">Conditions</h4>
          <ul className="mt-2 grid gap-2">
            {o.conditions.map((x) => (
              <li key={x.id} className="flex items-start gap-2.5 text-[15px] leading-snug">
                {x.status === "met" ? <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-leaf" aria-hidden /> : <Clock className="mt-0.5 size-[18px] shrink-0 text-slate" aria-hidden />}
                <span className="flex-1">{x.text}</span>
                <span className="shrink-0 text-[13px] font-bold text-slate">{x.status === "met" ? "Met" : "Pending"}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-mist p-4 text-[15px] font-semibold">No conditions. Accepting confirms your place.</p>
      )}

      <fieldset className="mt-5" disabled={locked && choice === "none"}>
        <legend className="mb-2.5 font-extrabold">Your answer</legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {o.type === "conditional" ? (
            <>
              <Radio name={a.id} value="main" current={choice} onChange={(v) => set(v as Choice)} hint="Your first choice.">Main choice</Radio>
              <Radio name={a.id} value="insurance" current={choice} onChange={(v) => set(v as Choice)} hint="Your back-up place.">Insurance choice</Radio>
            </>
          ) : (
            <Radio name={a.id} value="firm" current={choice} onChange={(v) => set(v as Choice)} hint="Confirms your place.">Accept this place</Radio>
          )}
          <Radio name={a.id} value="none" current={choice} onChange={(v) => set(v as Choice)} hint="You can answer later.">Not yet</Radio>
        </div>
        {locked && choice === "none" && (
          <p className="mt-2.5 flex items-center gap-2 text-sm text-slate"><Lock className="size-4" aria-hidden />You have chosen to accept an unconditional offer, so this one will be declined.</p>
        )}
      </fieldset>
      <div className="mt-4">
        <Button variant="ghost" size="sm" className="min-h-11 text-error hover:!bg-error-tint" onClick={onDecline}>Decline this offer</Button>
      </div>
    </Card>
  );
}

export function Offers() {
  const { s, acceptUnconditional, acceptConditional, declineOffer } = useHub();
  const nav = useNavigate();
  const offers = liveOffers(s.apps);
  const [pick, setPick] = useState<Record<string, Choice>>({});
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [decl, setDecl] = useState<Application | null>(null);

  const get = (id: string): Choice => pick[id] ?? "none";
  const firm = offers.find((o) => get(o.id) === "firm");
  const main = offers.find((o) => get(o.id) === "main");
  const ins = offers.find((o) => get(o.id) === "insurance");

  const setChoice = (id: string, c: Choice) =>
    setPick((p) => {
      const n = { ...p };
      if (c === "firm") for (const k of Object.keys(n)) n[k] = "none";
      if (c === "main") for (const k of Object.keys(n)) if (n[k] === "main" || n[k] === "firm") n[k] = "none";
      if (c === "insurance") for (const k of Object.keys(n)) if (n[k] === "insurance" || n[k] === "firm") n[k] = "none";
      n[id] = c;
      return n;
    });

  const consequence = useMemo(() => {
    const chosen = [firm, main, ins].filter(Boolean) as Application[];
    const ids = new Set(chosen.map((x) => x.id));
    return {
      declined: offers.filter((o) => !ids.has(o.id)),
      withdrawn: s.apps.filter((x) => isActive(x) && (x.stage === 2 || x.stage === 3) && !ids.has(x.id)),
    };
  }, [offers, firm, main, ins, s.apps]);

  const tryConfirm = () => {
    if (!firm && !main) {
      setErr(ins ? "Choose a main offer as well. You cannot accept an insurance offer on its own." : "Choose an answer for at least one offer first.");
      return;
    }
    setErr(null);
    setConfirm(true);
  };
  const doConfirm = () => {
    if (firm) acceptUnconditional(firm.id);
    else if (main) acceptConditional(main.id, ins?.id);
    setConfirm(false);
    setPick({});
    nav(firm ? `/applications/${firm.id}` : "/applications");
  };

  if (offers.length === 0) {
    return (
      <div>
        <PageHeader title="Respond to offers" />
        <Empty icon={<Gift className="size-7" />} title="No offers waiting for you" action={<LinkButton to="/applications" variant="secondary">See my applications</LinkButton>}>
          When a university makes you an offer, it appears here with its conditions and the date to reply by. We will email you and add it to your next steps.
        </Empty>
      </div>
    );
  }

  const summary = firm
    ? `Accepting ${cOf(firm).institution}`
    : main
      ? `Main: ${cOf(main).institution}${ins ? `. Insurance: ${cOf(ins).institution}` : ""}`
      : ins
        ? `Insurance: ${cOf(ins).institution}`
        : "No answers chosen yet";

  return (
    <div>
      <button type="button" onClick={() => nav(-1)} className="mb-5 inline-flex min-h-11 items-center gap-2 font-bold hover:underline hover:decoration-ink/40 hover:underline-offset-4">
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>
      <PageHeader title="Respond to offers" lead="One answer here affects all your applications, so read each offer first. You can accept one unconditional offer, or one main and one insurance conditional offer." />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[20px] bg-white px-5 py-3.5 text-[15px] shadow-[0_0_0_1px_rgb(1_62_91/0.07)]">
        <span className="flex items-center gap-2 font-bold"><BellRing className="size-4.5 text-teal" aria-hidden />We will remind you 7 days and 1 day before each deadline.</span>
        <span className="text-slate">An offer you do not answer by its deadline expires.</span>
      </div>

      <ul className="grid gap-5">
        {offers.map((a) => (
          <li key={a.id}>
            <OfferCard a={a} choice={get(a.id)} set={(c) => setChoice(a.id, c)} locked={!!firm && firm.id !== a.id} onDecline={() => setDecl(a)} />
          </li>
        ))}
      </ul>

      <div className="sticky bottom-[84px] z-20 mt-8 lg:bottom-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[28px] bg-deep p-4 pl-6 text-white shadow-[0_30px_60px_-20px_rgb(1_30_45/0.7)]" data-dark>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white/70">Your choices</p>
            <p className="font-extrabold leading-snug" aria-live="polite">{summary}</p>
            {err && <p role="alert" className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#ffb59b]"><AlertCircle className="size-4" aria-hidden />{err}</p>}
          </div>
          <Button variant="mint" size="lg" onClick={tryConfirm} arrow>Review and confirm</Button>
        </div>
      </div>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Check before you confirm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Go back</Button>
            <Button onClick={doConfirm}><ShieldCheck className="size-4" aria-hidden />{firm ? "Accept and confirm place" : "Confirm my choices"}</Button>
          </>
        }
      >
        <div className="grid gap-5 text-[15px]">
          <div>
            <h3 className="text-base">You are accepting</h3>
            <ul className="mt-2 grid gap-1.5">
              {firm && <li className="rounded-xl bg-[#e8f8f3] px-3.5 py-2.5 font-bold">{cOf(firm).title}, {cOf(firm).institution}. Place confirmed.</li>}
              {main && <li className="rounded-xl bg-[#e8f8f3] px-3.5 py-2.5 font-bold">Main: {cOf(main).title}, {cOf(main).institution}</li>}
              {ins && <li className="rounded-xl bg-[#e8f8f3] px-3.5 py-2.5 font-bold">Insurance: {cOf(ins).title}, {cOf(ins).institution}</li>}
            </ul>
          </div>
          {consequence.declined.length > 0 && (
            <div>
              <h3 className="text-base">These offers will be declined</h3>
              <ul className="mt-2 grid gap-1.5">
                {consequence.declined.map((x) => <li key={x.id} className="rounded-xl bg-error-tint px-3.5 py-2.5 font-semibold">{cOf(x).title}, {cOf(x).institution}</li>)}
              </ul>
            </div>
          )}
          {consequence.withdrawn.length > 0 && (
            <div>
              <h3 className="text-base">These applications will be withdrawn</h3>
              <p className="mt-1 text-slate">They are still being reviewed. They will close even if you chose no insurance offer.</p>
              <ul className="mt-2 grid gap-1.5">
                {consequence.withdrawn.map((x) => <li key={x.id} className="rounded-xl bg-mist px-3.5 py-2.5 font-semibold">{cOf(x).title}, {cOf(x).institution}</li>)}
              </ul>
            </div>
          )}
          <Banner tone="notice" title="You cannot change this afterwards.">You will not be able to accept a different offer once you confirm.</Banner>
        </div>
      </Dialog>

      <Dialog
        open={!!decl}
        onClose={() => setDecl(null)}
        title="Decline this offer?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecl(null)}>Keep offer</Button>
            <Button variant="danger" onClick={() => { if (decl) declineOffer(decl.id); setDecl(null); }}>Decline offer</Button>
          </>
        }
      >
        {decl && (
          <p className="text-slate">
            You will decline <strong className="text-ink">{cOf(decl).title}</strong> at {cOf(decl).institution}. The application closes and cannot be reopened. Your other applications are not affected.
          </p>
        )}
      </Dialog>
    </div>
  );
}
