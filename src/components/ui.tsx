import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { AlertCircle, ArrowRight, Check, ChevronDown, Info, Loader2, X } from "./icons";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

type Variant = "primary" | "secondary" | "mint" | "ghost" | "danger" | "quiet";
const base =
  "press inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap select-none disabled:opacity-45 disabled:pointer-events-none cursor-pointer";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-deep",
  secondary: "bg-white text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink hover:text-white",
  mint: "bg-mint text-abyss hover:bg-white",
  ghost: "text-ink hover:bg-ink/8",
  quiet: "bg-ink/6 text-ink hover:bg-ink/12",
  danger: "bg-white text-error shadow-[inset_0_0_0_1.5px_var(--color-error)] hover:bg-error hover:text-white",
};
const sizes = { md: "min-h-11 px-5 text-[15px]", sm: "min-h-9 px-4 text-sm", lg: "min-h-13 px-7 text-base" };

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof sizes;
  loading?: boolean;
  arrow?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = "primary", size = "md", loading, arrow, className, children, disabled, ...p }, ref) {
  return (
    <button ref={ref} type="button" className={cx(base, variants[variant], sizes[size], "group", className)} disabled={disabled || loading} {...p}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
      {arrow && <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" aria-hidden />}
    </button>
  );
});

interface LBProps extends LinkProps {
  variant?: Variant;
  size?: keyof typeof sizes;
  arrow?: boolean;
}
export function LinkButton({ variant = "primary", size = "md", arrow, className, children, ...p }: LBProps) {
  return (
    <Link className={cx(base, variants[variant], sizes[size], "group", className)} {...p}>
      {children}
      {arrow && <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" aria-hidden />}
    </Link>
  );
}

export function TextLink({ className, children, ...p }: LinkProps) {
  return (
    <Link className={cx("font-bold text-ink underline decoration-ink/30 underline-offset-[5px] transition-colors hover:decoration-ink", className)} {...p}>
      {children}
    </Link>
  );
}

export function Card({ className, children, as: As = "div", ...p }: { className?: string; children: ReactNode; as?: "div" | "section" | "article" | "li" } & Record<string, unknown>) {
  return (
    <As className={cx("rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgb(1_62_91/0.07)] sm:p-7", className)} {...p}>
      {children}
    </As>
  );
}

export function PageHeader({ title, lead, children }: { title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-9">
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-[34px] leading-[1.02] tracking-[-0.04em] sm:text-[52px]">{title}</h1>
        {lead && <p className="mt-3 text-[17px] leading-relaxed text-slate">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

type Tone = "neutral" | "ink" | "action" | "error" | "success" | "notice";
const tones: Record<Tone, string> = {
  neutral: "bg-ink/7 text-ink",
  ink: "bg-ink text-white",
  action: "bg-clay-tint text-clay-text",
  error: "bg-error-tint text-[#a42424]",
  success: "bg-[#dff9f1] text-[#075f49]",
  notice: "bg-lemon text-olive",
};
export function Chip({ tone = "neutral", icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold leading-5", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export function Banner({ tone = "notice", title, children, action }: { tone?: "notice" | "action" | "success" | "error"; title?: string; children?: ReactNode; action?: ReactNode }) {
  const t = { notice: "bg-lemon text-olive", action: "bg-clay-tint text-clay-text", success: "bg-[#dff9f1] text-[#075f49]", error: "bg-error-tint text-[#a42424]" }[tone];
  const Icon = tone === "success" ? Check : tone === "notice" ? Info : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[20px] px-5 py-4", t)}>
      <Icon className="size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 basis-60">
        {title && <p className="font-extrabold">{title}</p>}
        {children && <div className="text-[15px] leading-snug">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
  id,
  optional,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (p: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  id?: string;
  optional?: boolean;
}) {
  const auto = useId();
  const fid = id ?? auto;
  const describedBy = [hint ? `${fid}-h` : "", error ? `${fid}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={fid} className="mb-1.5 block text-[15px] font-bold">
        {label}
        {optional && <span className="ml-1.5 font-medium text-slate">(optional)</span>}
      </label>
      {children({ id: fid, describedBy, invalid: !!error })}
      {hint && (
        <p id={`${fid}-h`} className="mt-1.5 text-sm text-slate">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fid}-e`} className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl bg-white px-4 py-3 text-base text-ink shadow-[inset_0_0_0_1.5px_#b9cbd3] outline-none transition-shadow duration-300 placeholder:text-slate/70 hover:shadow-[inset_0_0_0_1.5px_var(--color-teal)] focus-visible:shadow-[inset_0_0_0_2.5px_var(--color-ink)] aria-[invalid=true]:bg-error-tint aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_var(--color-error)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; describedBy?: string }>(function Input({ invalid, describedBy, className, ...p }, ref) {
  return <input ref={ref} className={cx(inputCls, "min-h-12", className)} aria-invalid={invalid || undefined} aria-describedby={describedBy} {...p} />;
});
export function TextArea({ invalid, describedBy, className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; describedBy?: string }) {
  return <textarea className={cx(inputCls, "min-h-48 resize-y leading-relaxed", className)} aria-invalid={invalid || undefined} aria-describedby={describedBy} {...p} />;
}
export function Select({ children, invalid, describedBy, className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; describedBy?: string }) {
  return (
    <div className="relative">
      <select className={cx(inputCls, "min-h-12 cursor-pointer appearance-none pr-11", className)} aria-invalid={invalid || undefined} aria-describedby={describedBy} {...p}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden />
    </div>
  );
}

export function Check2({ checked, onChange, children, invalid, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; invalid?: boolean; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <label htmlFor={fid} className={cx("flex cursor-pointer items-start gap-3.5 rounded-2xl p-3 -m-3 transition-colors hover:bg-ink/4", invalid && "bg-error-tint hover:bg-error-tint")}>
      <input id={fid} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalid || undefined} />
      <span
        aria-hidden
        className={cx(
          "press mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg shadow-[inset_0_0_0_2px_var(--color-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
          checked ? "bg-ink text-white" : "bg-white",
        )}
      >
        <Check className={cx("size-4 transition-all duration-200 ease-[var(--ease-brand)]", checked ? "scale-100 opacity-100" : "scale-50 opacity-0")} strokeWidth={3} />
      </span>
      <span className="text-[15px] leading-snug">{children}</span>
    </label>
  );
}

export function Radio({ name, value, current, onChange, children, hint }: { name: string; value: string; current: string; onChange: (v: string) => void; children: ReactNode; hint?: ReactNode }) {
  const on = current === value;
  return (
    <label className={cx("press flex cursor-pointer items-start gap-3.5 rounded-2xl p-4 transition-shadow duration-300", on ? "bg-[#eef9f6] shadow-[inset_0_0_0_2px_var(--color-ink)]" : "bg-white shadow-[inset_0_0_0_1.5px_#b9cbd3] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal)]")}>
      <input type="radio" name={name} value={value} checked={on} onChange={() => onChange(value)} className="peer sr-only" />
      <span aria-hidden className={cx("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_2px_var(--color-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink", on && "bg-ink")}>
        <span className={cx("size-2.5 rounded-full bg-mint transition-transform duration-200 ease-[var(--ease-brand)]", on ? "scale-100" : "scale-0")} />
      </span>
      <span className="min-w-0">
        <span className="block font-bold leading-snug">{children}</span>
        {hint && <span className="mt-1 block text-sm leading-snug text-slate">{hint}</span>}
      </span>
    </label>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden />;
}

export function Empty({ icon, title, children, action }: { icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_0_0_1px_rgb(1_62_91/0.07)]">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-mist text-ink">{icon}</div>
      <h2 className="text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-slate">{children}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Dialog({ open, onClose, title, children, footer, tone }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; tone?: "danger" }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dlg-t"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-abyss/55 backdrop:backdrop-blur-[3px]"
    >
      <div className="flex h-full items-end justify-center sm:items-center sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="sheet-in max-h-[92dvh] w-full overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-[0_40px_100px_-40px_rgb(1_43_64/0.6)] sm:max-w-lg sm:rounded-[32px] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="dlg-t" className={cx("text-2xl", tone === "danger" && "text-ink")}>
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="press -mr-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-full text-ink hover:bg-ink/8">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="mt-4">{children}</div>
          {footer && <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
        </div>
      </div>
    </dialog>
  );
}

export function useClickAway(onAway: () => void, active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onAway();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onAway();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [active, onAway]);
  return ref;
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: string; count?: number; flag?: boolean }[]; value: T; onChange: (v: T) => void; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; w: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const el = wrap.current?.querySelector<HTMLElement>(`[data-tab="${value}"]`);
      if (el) setPos({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value, tabs.length, tabs.map((t) => t.count).join(",")]);
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <div ref={wrap} role="tablist" aria-label={label} className="relative inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_0_0_1px_rgb(1_62_91/0.08)]">
        {pos && <span aria-hidden className="absolute bottom-1 top-1 rounded-full bg-ink transition-[transform,width] duration-300 ease-[var(--ease-brand)]" style={{ width: pos.w, transform: `translateX(${pos.x}px)`, left: 0 }} />}
        {tabs.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              role="tab"
              data-tab={t.id}
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => {
                const i = tabs.findIndex((x) => x.id === value);
                if (e.key === "ArrowRight") onChange(tabs[(i + 1) % tabs.length].id);
                if (e.key === "ArrowLeft") onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
              }}
              className={cx("press relative z-10 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-bold transition-colors duration-300", on ? "text-white" : "text-ink hover:text-teal")}
            >
              {t.label}
              {t.count !== undefined && <span className={cx("tnum rounded-full px-2 text-[13px] transition-colors duration-300", on ? "bg-white/18" : "bg-ink/8")}>{t.count}</span>}
              {t.flag && <span className="sr-only">, has action needed</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useDebouncedSave(fn: () => void, deps: unknown[], ms = 650) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState("saving");
    const t = window.setTimeout(() => {
      fn();
      setState("saved");
    }, ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const t = name
    .split(/[ ,]+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return <span className={cx("grid shrink-0 place-items-center rounded-full bg-ink font-extrabold text-white", className)}>{t}</span>;
}

export function InstitutionTile({ name, size = 48 }: { name: string; size?: number }) {
  const hues: Record<string, string> = {
    "Northbridge University": "bg-ink text-white",
    "Westmoor University": "bg-[#e6f6f1] text-leaf",
    "Eastfield College": "bg-[#fdeee6] text-clay-text",
    "Harcombe University": "bg-deep text-mint",
    "Ravenscar Institute": "bg-[#e9eff2] text-teal",
  };
  if (name === "educateU")
    return <img src="/brand/mark.png" alt="" aria-hidden style={{ width: size, height: size }} className="shrink-0 rounded-full" draggable={false} />;
  const letters = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: size * 0.3 }} className={cx("grid shrink-0 place-items-center text-[15px] font-extrabold tracking-tight", hues[name] ?? "bg-mist text-ink")}>
      {letters}
    </span>
  );
}

const TONES: Record<string, string> = {
  "Northbridge University": "from-ink to-deep",
  "Westmoor University": "from-[#0b7a5f] to-deep",
  "Eastfield College": "from-clay to-[#7a3a1f]",
  "Harcombe University": "from-teal to-abyss",
  "Ravenscar Institute": "from-slate to-deep",
};

/** Course photo, or a branded tile (logo stripes plus institution mark) when we do not have a photo yet. */
export function CourseImage({ image, institution, className, priority }: { image?: string; institution: string; className?: string; priority?: boolean }) {
  if (image)
    return (
      <div className={cx("relative overflow-hidden bg-cloud", className)}>
        <img src={image} alt="" width={1280} height={720} loading={priority ? "eager" : "lazy"} decoding="async" className="size-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.03]" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/25 to-transparent" />
      </div>
    );
  return (
    <div className={cx("relative isolate grid place-items-center overflow-hidden bg-gradient-to-br", TONES[institution] ?? "from-ink to-deep", className)} aria-hidden>
      <svg viewBox="0 0 400 225" className="absolute inset-0 -z-10 size-full text-white opacity-[0.12]" preserveAspectRatio="xMidYMid slice">
        <g fill="currentColor"><rect x="120" y="30" width="300" height="34" rx="17" transform="rotate(-18 270 47)" /><rect x="70" y="100" width="300" height="34" rx="17" transform="rotate(-18 220 117)" /><rect x="20" y="170" width="300" height="34" rx="17" transform="rotate(-18 170 187)" /></g>
      </svg>
      <InstitutionTile name={institution} size={64} />
    </div>
  );
}
