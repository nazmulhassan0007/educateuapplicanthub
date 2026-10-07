import { ArrowRight, CalendarClock, FileUp, Gift, LifeBuoy, ListChecks, MailCheck, Mail, MessageCircle, Plus, Search, UserRound } from "../components/icons";
import { Link } from "react-router-dom";
import { AppCard } from "../components/AppCard";
import { Card, cx, LinkButton, TextLink } from "../components/ui";
import { cOf, isActive, isDraft, liveOffers, openTasks, primaryAction, sectionsFor, sortApps } from "../lib/app";
import { dueLabel, fmt, fmtDateTime, fmtShort, greeting, daysUntil } from "../lib/date";
import { keyDates } from "../lib/dates";
import { profileCompleteness, useHub } from "../store";

const rise = (i: number) => ({ animationDelay: `${i * 70}ms` });

function FirstVisit() {
  const steps = [
    { icon: Search, title: "Find a course", text: "Search by subject, level and study mode. Entry requirements and fees are shown up front." },
    { icon: ListChecks, title: "Fill in one form", text: "Your details save once and fill every application. We autosave as you go." },
    { icon: MailCheck, title: "Follow it to the finish", text: "One clear status per application, and a to-do list that says what comes next." },
  ];
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div className="rise">
        <h1 className="text-[36px] leading-[1.02] sm:text-[56px]">Welcome to educateU. Let&apos;s find your course.</h1>
        <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-slate">You can apply to up to five courses for the same intake. Start with one. It takes about 20 minutes, and you can stop and come back any time.</p>
        <LinkButton to="/new" size="lg" arrow className="mt-8 w-full sm:w-auto">
          <Plus className="size-5" aria-hidden />
          New application
        </LinkButton>
      </div>
      <Card className="rise !p-7 sm:!p-9" style={rise(2)}>
        <h2 className="text-2xl">How applying works</h2>
        <ol className="mt-6 grid gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-ink">
                <s.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-1 text-slate">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { s } = useHub();
  const active = s.apps.filter(isActive);
  const drafts = s.apps.filter(isDraft);
  if (s.apps.length === 0) return <FirstVisit />;

  const tasks = s.apps
    .flatMap((a) => openTasks(a).map((t) => ({ ...t, a })))
    .sort((x, y) => x.due.localeCompare(y.due));
  const cards = sortApps(active, "updated").slice(0, 3);
  const dates = keyDates(s.apps).slice(0, 5);
  const msgs = [...s.threads].sort((x, y) => y.messages[y.messages.length - 1].at.localeCompare(x.messages[x.messages.length - 1].at)).slice(0, 3);
  const prof = profileCompleteness(s.profile);
  const first = s.profile.firstName;
  const headline =
    active.length > 0
      ? `${greeting()}, ${first}. You have ${active.length} active application${active.length === 1 ? "" : "s"}.`
      : drafts.length
        ? `${greeting()}, ${first}. You have ${drafts.length} draft waiting.`
        : `${greeting()}, ${first}. You have no active applications.`;

  const nextTask = tasks[0];
  const nextCourse = nextTask ? cOf(nextTask.a) : null;
  const confirmed = active.find((a) => a.stage === 5);
  const booking = active.filter((a) => a.booking && daysUntil(a.booking.at) >= 0).sort((x, y) => x.booking!.at.localeCompare(y.booking!.at))[0];
  const draft = drafts[0];
  // One next step, phrased for this person's situation right now.
  const ctx = nextTask && nextCourse
    ? {
        line: nextTask.kind === "respond"
          ? `Reply to your offer from ${nextCourse.institution} by ${fmtShort(nextTask.due)}.`
          : nextTask.kind === "reference" || nextTask.kind === "insurance"
            ? `${nextTask.title}. ${dueLabel(nextTask.due)}.`
            : `${nextTask.title} for ${nextCourse.title}. ${dueLabel(nextTask.due)}.`,
        cta: nextTask.kind === "respond" ? "Respond to offers" : "Go to next task",
        href: nextTask.kind === "respond" ? "/offers" : `/applications/${nextTask.a.id}?tab=tasks`,
      }
    : confirmed
      ? { line: `Your place at ${cOf(confirmed).institution} is confirmed. Your course starts on ${fmt(cOf(confirmed).startDates[confirmed.intake])}.`, cta: "See how to get ready", href: `/applications/${confirmed.id}` }
      : draft
        ? { line: `Your ${cOf(draft).title} draft is ${draft.sectionsDone.length} of ${sectionsFor(draft).length} sections done. Pick it up where you left off.`, cta: "Continue draft", href: primaryAction(draft).to }
        : booking
          ? { line: `Your ${booking.booking!.type.toLowerCase()} is on ${fmtDateTime(booking.booking!.at)}.`, cta: "See booking details", href: `/applications/${booking.id}` }
          : { line: "Nothing needs you right now. We will email you when something changes.", cta: "Discover courses", href: "/discover" };
  const offerCount = liveOffers(s.apps).length;
  const chips = [
    ...(offerCount ? [{ icon: Gift, text: `${offerCount} offer${offerCount === 1 ? "" : "s"} to answer` }] : []),
    ...(tasks.length ? [{ icon: ListChecks, text: `${tasks.length} open task${tasks.length === 1 ? "" : "s"}` }] : []),
    ...(booking ? [{ icon: CalendarClock, text: `${booking.booking!.type} ${fmtShort(booking.booking!.at)}` }] : []),
  ];
  const lead = headline.split(". ");

  return (
    <div>
      <section aria-labelledby="hello" className="rise relative isolate overflow-hidden rounded-[32px] bg-deep px-6 py-8 text-white sm:px-10 sm:py-10" data-dark>
        <svg aria-hidden viewBox="0 0 400 300" className="pointer-events-none absolute -right-10 top-1/2 -z-10 hidden h-[135%] -translate-y-1/2 text-mint opacity-[0.13] md:block">
          <g fill="currentColor"><rect x="150" y="30" width="230" height="38" rx="19" transform="rotate(-18 265 49)" /><rect x="110" y="120" width="230" height="38" rx="19" transform="rotate(-18 225 139)" /><rect x="70" y="210" width="230" height="38" rx="19" transform="rotate(-18 185 229)" /></g>
        </svg>
        <h1 id="hello" className="max-w-3xl text-[36px] leading-[1.04] tracking-[-0.04em] sm:text-[50px]">
          {lead[0]}.
          <span className="mt-1 block text-mint">{lead[1]}</span>
        </h1>
        <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-white/85">{ctx.line}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="At a glance">
          {chips.map((c) => (
            <li key={c.text} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] font-bold"><c.icon className="size-4 text-mint" aria-hidden />{c.text}</li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <LinkButton to={ctx.href} variant="mint" size="lg" arrow>{ctx.cta}</LinkButton>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-5 sm:mt-7 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:gap-6">
        <div className="grid gap-5 lg:gap-6">
          <section aria-labelledby="next" className="rise rounded-[28px] bg-[#fdf1e9] p-5 shadow-[0_0_0_1px_rgb(194_101_63/0.28)] sm:p-7" style={rise(1)}>
            <h2 id="next" className="flex items-center gap-2.5 text-[22px] text-clay-text">
              Your next steps
              {tasks.length > 0 && <span className="tnum rounded-full bg-clay px-2.5 text-[15px] leading-6 text-white">{tasks.length}</span>}
            </h2>
            {tasks.length === 0 ? (
              <p className="mt-3 max-w-md text-[17px] text-ink">Nothing to do right now. We will email you when something changes.</p>
            ) : (
              <ul className="mt-4 divide-y divide-clay/20">
                {tasks.map((t) => {
                  const c = cOf(t.a);
                  const href = t.kind === "respond" ? "/offers" : `/applications/${t.a.id}?tab=tasks`;
                  const urgent = daysUntil(t.due) <= 7;
                  return (
                    <li key={t.id}>
                      <Link to={href} className="group -mx-3 flex items-start gap-4 rounded-2xl px-3 py-4 transition-colors hover:bg-white/60">
                        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-white text-clay-text">
                          {t.kind === "respond" ? <Gift className="size-5" aria-hidden /> : t.kind === "reference" ? <Mail className="size-5" aria-hidden /> : <FileUp className="size-5" aria-hidden />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-extrabold leading-snug text-ink">{t.title}</span>
                          <span className="mt-0.5 block text-[15px] text-slate">
                            {c.title}, {c.institution}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1 text-right">
                          <span className={cx("text-[13px] font-extrabold leading-5", urgent ? "text-clay-text" : "text-ink")}>{dueLabel(t.due)}</span>
                          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-ink">
                            Go to task
                            <ArrowRight className="size-3.5 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" aria-hidden />
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="apps" className="rise" style={rise(2)}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="apps" className="text-[22px]">Your applications</h2>
              <TextLink to="/applications">View all</TextLink>
            </div>
            {cards.length > 0 ? (
              <ul className="grid gap-5 md:grid-cols-2 lg:gap-6">
                {cards.map((a) => (
                  <li key={a.id} className={cards.length === 3 ? "md:last:col-span-2" : ""}>
                    <AppCard a={a} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <Card>
                <p className="text-slate">None of your applications are active yet. Finish a draft or start a new one.</p>
              </Card>
            )}
          </section>
        </div>

        <aside className="grid gap-5 lg:gap-6" aria-label="Dates, messages and profile">
          <Card as="section" aria-labelledby="dates" className="rise !p-5 sm:!p-6" style={rise(3)}>
            <h2 id="dates" className="flex items-center gap-2 text-lg"><CalendarClock className="size-5 text-teal" aria-hidden />Key dates</h2>
            {dates.length === 0 ? (
              <p className="mt-3 text-slate">Nothing in the next 60 days.</p>
            ) : (
              <ul className="mt-3 grid gap-3.5">
                {dates.map((k) => (
                  <li key={k.id}>
                    <Link to={k.href} className="group grid grid-cols-[64px_1fr] items-baseline gap-3 rounded-lg">
                      <span className="tnum text-[15px] font-extrabold">{fmtShort(k.date)}</span>
                      <span className="text-[15px] leading-snug text-ink group-hover:underline group-hover:decoration-ink/40 group-hover:underline-offset-4">
                        {k.label}
                        <span className="block text-[13px] text-slate">
                          {k.where}
                          {k.kind === "booking" && `, ${fmtDateTime(k.date).split(", ")[1]}`}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card as="section" aria-labelledby="latest" className="rise !p-5 sm:!p-6" style={rise(4)}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="latest" className="flex items-center gap-2 text-lg"><MessageCircle className="size-5 text-teal" aria-hidden />Latest messages</h2>
              <TextLink to="/messages" className="text-sm">Open Messages</TextLink>
            </div>
            {msgs.length === 0 ? (
              <p className="mt-3 text-slate">No messages yet.</p>
            ) : (
              <ul className="mt-3 grid gap-1">
                {msgs.map((t) => {
                  const last = t.messages[t.messages.length - 1];
                  return (
                    <li key={t.id}>
                      <Link to={`/messages?thread=${t.id}`} className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-mist">
                        <span aria-hidden className={cx("mt-2 size-2.5 shrink-0 rounded-full", t.unread ? "bg-ink" : "bg-transparent")} />
                        <span className="min-w-0 text-[15px] leading-snug">
                          {t.unread && <span className="sr-only">Unread. </span>}
                          <span className={cx("block truncate", t.unread && "font-extrabold")}>{t.subject}</span>
                          <span className="line-clamp-1 text-slate">{last.who.split(",")[0]}: {last.text}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {prof.pct < 100 && (
            <Card as="section" aria-labelledby="prof" className="rise !p-5 sm:!p-6" style={rise(5)}>
              <h2 id="prof" className="flex items-center gap-2 text-lg"><UserRound className="size-5 text-teal" aria-hidden />Profile {prof.pct}% complete</h2>
              <div role="progressbar" aria-valuenow={prof.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness" className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#d5e2e7]">
                <div className="h-full rounded-full bg-ink" style={{ width: `${prof.pct}%` }} />
              </div>
              <ul className="mt-4 grid gap-1">
                {prof.missing.map((m) => (
                  <li key={m.label}>
                    <Link to={m.to} className="group -mx-2 flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 font-bold hover:bg-mist">
                      Add {m.label.toLowerCase()}
                      <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card as="section" aria-labelledby="help" className="rise lg:!hidden !bg-deep !p-5 text-white sm:!p-6" style={rise(6)} data-dark>
            <h2 id="help" className="flex items-center gap-2 text-lg"><LifeBuoy className="size-5 text-mint" aria-hidden />Need a hand?</h2>
            <p className="mt-2 text-[15px] text-white/80">Message the admissions team. A real person replies, usually within one working day.</p>
            <LinkButton to="/messages?new=1" variant="mint" size="sm" className="mt-4 min-h-11" arrow>
              Message admissions
            </LinkButton>
          </Card>
        </aside>
      </div>
    </div>
  );
}
