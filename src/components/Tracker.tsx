import { Check, X } from "./icons";
import type { Application } from "../data/types";
import { actionNeeded, STAGES, trackerStates, trackerSummary, expectedBy, outcomeLabel, type StepState } from "../lib/app";
import { fmtShort } from "../lib/date";
import { cx } from "./ui";

function Node({ state, closedPrev, size }: { state: StepState; closedPrev?: boolean; size: number }) {
  const common = { width: size, height: size };
  if (state === "done")
    return (
      <span style={common} className={cx("grid shrink-0 place-items-center rounded-full text-white", closedPrev ? "bg-slate" : "bg-ink")}>
        <Check className="size-[55%]" strokeWidth={3.2} aria-hidden />
      </span>
    );
  if (state === "current")
    return (
      <span style={common} className="grid shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_0_0_3px_var(--color-ink)]">
        <span className="size-[38%] rounded-full bg-ink" />
      </span>
    );
  if (state === "action")
    return (
      <span style={common} className="grid shrink-0 place-items-center rounded-full bg-clay text-[15px] font-black leading-none text-white">
        !
      </span>
    );
  if (state === "closed")
    return (
      <span style={common} className="grid shrink-0 place-items-center rounded-full bg-error text-white">
        <X className="size-[55%]" strokeWidth={3.2} aria-hidden />
      </span>
    );
  return <span style={common} className="shrink-0 rounded-full bg-white shadow-[inset_0_0_0_2.5px_#c3d3da]" />;
}

/** Five-stage tracker. `labels` shows stage names under each node, `dates` the date each passed stage was reached. */
export function ProgressTracker({ app, labels = true, dates = false, size = 28, className }: { app: Application; labels?: boolean; dates?: boolean; size?: number; className?: string }) {
  const states = trackerStates(app);
  const closed = !!app.outcome;
  return (
    <div className={className}>
      <p className="sr-only">{trackerSummary(app)}</p>
      <ol aria-hidden className="flex items-start">
        {STAGES.map((s, i) => {
          const st = states[i];
          const lineDone = i < 4 && (states[i] === "done" || (closed && i < (app.stage as number) - 1));
          return (
            <li key={s.n} className={cx("relative flex min-w-0 flex-1 flex-col", i === 4 ? "flex-none" : "")}>
              <div className="flex items-center">
                <Node state={st} closedPrev={closed && st === "done"} size={size} />
                {i < 4 && (
                  <span className="mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-[#d5e2e7]">
                    <span className={cx("block h-full origin-left rounded-full transition-transform duration-700 ease-[var(--ease-brand)]", closed ? "bg-slate" : "bg-ink", lineDone ? "scale-x-100" : "scale-x-0")} />
                  </span>
                )}
              </div>
              {labels && (
                <span className={cx("mt-2 text-[11px] font-bold leading-4 tracking-tight", st === "todo" ? "text-slate" : st === "closed" ? "text-error" : st === "action" ? "text-clay-text" : "text-ink")}>
                  {s.short}
                  {dates && app.stageDates[s.n] && st !== "todo" && <span className="mt-0.5 block font-semibold text-slate">{fmtShort(app.stageDates[s.n]!)}</span>}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Narrow-screen tracker: text plus a bar. */
export function CompactTracker({ app }: { app: Application }) {
  const an = actionNeeded(app);
  const e = expectedBy(app);
  const pct = app.outcome ? ((app.stage as number) / 5) * 100 : (app.stage / 5) * 100;
  return (
    <div>
      <p className="font-extrabold">
        {app.outcome ? `Closed at step ${app.stage} of 5` : `Step ${app.stage} of 5: ${STAGES[app.stage - 1].label}`}
      </p>
      <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-[#d5e2e7]">
        <div className={cx("h-full rounded-full", app.outcome ? "bg-slate" : an ? "bg-clay" : "bg-ink")} style={{ width: `${pct}%` }} />
      </div>
      {app.outcome && <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-error"><X className="size-4" aria-hidden />{outcomeLabel[app.outcome]}</p>}
      {!an && e && <p className="mt-2 text-sm text-slate">Decision expected by {fmtShort(e)}</p>}
    </div>
  );
}

/** Picks the right tracker for the viewport. Both are in the DOM, CSS shows one. */
export function ResponsiveTracker({ app, dates }: { app: Application; dates?: boolean }) {
  return (
    <>
      <div className="hidden sm:block">
        <ProgressTracker app={app} dates={dates} />
      </div>
      <div className="sm:hidden">
        <p className="sr-only">{trackerSummary(app)}</p>
        <div aria-hidden>
          <CompactTracker app={app} />
        </div>
      </div>
    </>
  );
}
