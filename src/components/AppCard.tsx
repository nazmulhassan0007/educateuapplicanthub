import { AlertCircle, Trash2 } from "./icons";
import { Link } from "react-router-dom";
import type { Application } from "../data/types";
import { actionNeeded, cOf, isClosed, isDraft, outcomeLabel, primaryAction, sectionsFor, statusLabel } from "../lib/app";
import { fmt } from "../lib/date";
import { ResponsiveTracker } from "./Tracker";
import { Button, Chip, cx, InstitutionTile, LinkButton } from "./ui";

export function StatusLine({ a }: { a: Application }) {
  const an = actionNeeded(a);
  const closed = isClosed(a);
  return (
    <p className={cx("text-[15px] font-extrabold leading-snug", closed ? (a.outcome === "unsuccessful" || a.outcome === "expired" ? "text-error" : "text-slate") : an ? "text-clay-text" : "text-ink")}>
      {an && <AlertCircle className="mr-1.5 -mt-0.5 inline size-4" aria-hidden />}
      {statusLabel(a)}
    </p>
  );
}

export function AppCard({ a, compact, onDelete }: { a: Application; compact?: boolean; onDelete?: (a: Application) => void }) {
  const c = cOf(a);
  const act = primaryAction(a);
  const an = actionNeeded(a);
  const closed = isClosed(a);
  const draft = isDraft(a);
  return (
    <article
      className={cx(
        "flex h-full flex-col rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgb(1_62_91/0.07)] transition-[box-shadow,transform] duration-300 ease-[var(--ease-brand)] sm:p-6",
        "hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgb(1_62_91/0.14),0_24px_44px_-28px_rgb(1_43_64/0.55)]",
      )}
      aria-labelledby={`ac-${a.id}`}
    >
      <div className="flex items-start gap-4">
        <InstitutionTile name={c.institution} />
        <div className="min-w-0 flex-1">
          <h3 id={`ac-${a.id}`} className="text-[19px] leading-snug tracking-tight">
            <Link to={draft ? act.to : `/applications/${a.id}`} className="hover:underline hover:decoration-ink/40 hover:underline-offset-4">
              {c.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-[15px] text-slate">{c.institution}</p>
        </div>
        {closed && <Chip tone={a.outcome === "unsuccessful" || a.outcome === "expired" ? "error" : "neutral"}>{outcomeLabel[a.outcome!]}</Chip>}
        {!closed && an && !compact && (
          <Chip tone="action" icon={<AlertCircle className="size-3.5" aria-hidden />} className="hidden sm:inline-flex">
            Action needed
          </Chip>
        )}
        {draft && <Chip>Draft</Chip>}
      </div>
      <p className="mt-3 text-sm text-slate">
        {compact ? a.intake : `${c.level}, ${c.mode.toLowerCase()}. Starts ${a.intake}.`}
      </p>

      <div className="mt-5">
        {!draft ? (
          <ResponsiveTracker app={a} />
        ) : (
          <div aria-hidden className="h-2 overflow-hidden rounded-full bg-[#d5e2e7]">
            <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${(a.sectionsDone.length / sectionsFor(a).length) * 100}%` }} />
          </div>
        )}
      </div>
      <div className="mt-4 flex-1">
        <StatusLine a={a} />
        <p className="mt-1.5 text-[13px] text-slate">
          Ref {a.ref}. Updated {fmt(a.updatedAt)}.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <LinkButton to={act.to} variant={act.label === "Respond" ? "primary" : "secondary"} size="sm" className="min-h-11" arrow={act.label !== "View"}>
          {act.label}
          <span className="sr-only"> {c.title}</span>
        </LinkButton>
        {draft && onDelete && (
          <Button variant="ghost" size="sm" className="min-h-11" onClick={() => onDelete(a)}>
            <Trash2 className="size-4" aria-hidden />
            Delete draft
            <span className="sr-only"> {c.title}</span>
          </Button>
        )}
      </div>
    </article>
  );
}
