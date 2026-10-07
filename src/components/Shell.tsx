import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, ChevronDown, ClipboardList, Compass, FolderOpen, LayoutDashboard, LifeBuoy, LogOut, MessageSquare, Plus, UserRound, X } from "./icons";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { cOf, isActive, openTasks } from "../lib/app";
import { fmtDateTime, NOW } from "../lib/date";
import { profileCompleteness, useHub, type SimEvent } from "../store";
import { Logo } from "./Logo";
import { OfflineBanner, SessionGuard } from "./SessionAndNet";
import { PageSkeleton, skeletonKind } from "./Skeletons";
import { cx, Initials, useClickAway } from "./ui";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/applications", label: "My applications", short: "Applications", icon: ClipboardList },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/profile", label: "Profile & account", short: "Profile", icon: UserRound },
];

function Notifications() {
  const { s, readAllNotifications, readNotification } = useHub();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useClickAway(useCallback(() => setOpen(false), []), open);
  const unread = s.notifications.filter((n) => !n.read).length;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications, ${unread} unread`}
        className="press relative grid size-11 place-items-center rounded-full text-white hover:bg-white/12 lg:text-ink lg:hover:bg-ink/8"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span aria-hidden className="tnum absolute right-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-mint px-1 text-[11px] font-extrabold leading-[18px] text-abyss">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="pop fixed inset-x-3 top-[68px] z-40 overflow-hidden rounded-[24px] bg-white text-ink shadow-[0_40px_100px_-40px_rgb(1_30_45/0.7)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[400px]" style={{ transformOrigin: "top right" }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-lg">Notifications</h2>
            <button type="button" onClick={readAllNotifications} disabled={!unread} className="min-h-11 rounded-full px-3 text-sm font-bold underline decoration-ink/30 underline-offset-4 disabled:no-underline disabled:opacity-45">
              Mark all as read
            </button>
          </div>
          {s.notifications.length === 0 ? (
            <p className="px-5 pb-6 pt-2 text-slate">Nothing yet. We will tell you here, and by email, when something changes.</p>
          ) : (
            <ul className="max-h-[60dvh] overflow-y-auto pb-2">
              {s.notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      readNotification(n.id);
                      setOpen(false);
                      nav(n.href);
                    }}
                    className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-mist"
                  >
                    <span aria-hidden className={cx("mt-1.5 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-ink")} />
                    <span className="min-w-0">
                      <span className={cx("block text-[15px] leading-snug", !n.read && "font-bold")}>
                        {!n.read && <span className="sr-only">Unread: </span>}
                        {n.text}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-slate">{fmtDateTime(n.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { s, setSession } = useHub();
  const [open, setOpen] = useState(false);
  const ref = useClickAway(useCallback(() => setOpen(false), []), open);
  const name = `${s.profile.firstName} ${s.profile.lastName}`;
  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true" aria-label={`Account menu for ${name}`} className="press flex min-h-11 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-white/12 lg:pr-3 lg:hover:bg-ink/8">
        <Initials name={name} className="size-9 bg-mint text-sm text-abyss lg:bg-ink lg:text-white" />
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-[14px] font-extrabold">{s.profile.firstName}</span>
          <span className="block text-[12px] font-medium text-slate">Profile {profileCompleteness(s.profile).pct}% complete</span>
        </span>
        <ChevronDown className={cx("hidden size-4 text-slate transition-transform duration-300 ease-[var(--ease-brand)] lg:block", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="pop absolute right-0 top-[calc(100%+10px)] z-40 w-72 overflow-hidden rounded-[24px] bg-white p-2 text-ink shadow-[0_40px_100px_-40px_rgb(1_30_45/0.7)]" style={{ transformOrigin: "top right" }}>
          <div className="px-4 py-3">
            <p className="font-extrabold">{name}</p>
            <p className="text-sm text-slate">{s.profile.email}</p>
            <p className="mt-1 text-[13px] text-slate">Signed in with your educateu.com account</p>
          </div>
          {[
            { to: "/profile", label: "Profile & account", icon: UserRound },
            { to: "/messages?new=1", label: "Message admissions", icon: LifeBuoy },
          ].map((i) => (
            <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-2xl px-4 font-bold transition-colors hover:bg-mist">
              <i.icon className="size-[18px]" aria-hidden />
              {i.label}
            </Link>
          ))}
          <button type="button" onClick={() => { setOpen(false); setSession("out"); }} className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 font-bold transition-colors hover:bg-mist">
            <LogOut className="size-[18px]" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function ProtoPanel({ onClose }: { onClose: () => void }) {
  const { s, scenario, simulate, net, setNet, setSession } = useHub();
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const sims: { id: string; label: string; ev: SimEvent; app: string }[] = [];
  for (const a of s.apps.filter(isActive)) {
    const c = cOf(a);
    if (a.stage === 3) sims.push({ id: a.id + "mo", label: "Admissions team makes a conditional offer", ev: "make-offer", app: c.title });
    if (a.stage === 2 || a.stage === 3) sims.push({ id: a.id + "od", label: "Decision date passes", ev: "overdue", app: c.title });
    if (a.stage === 4 && a.offer && !a.offer.response) sims.push({ id: a.id + "xo", label: "Offer deadline passes", ev: "expire-offer", app: c.title });
    if (a.offer?.response === "main" && a.stage === 4) {
      sims.push({ id: a.id + "mm", label: "Main conditions met", ev: "main-met", app: c.title });
      sims.push({ id: a.id + "mn", label: "Main conditions not met", ev: "main-not-met", app: c.title });
    }
    if (a.offer?.response === "insurance" && a.stage === 4) {
      sims.push({ id: a.id + "im", label: "Insurance conditions met", ev: "insurance-met", app: c.title });
      sims.push({ id: a.id + "in", label: "Insurance conditions not met", ev: "insurance-not-met", app: c.title });
    }
  }
  return (
    <div className="pop fixed inset-x-3 bottom-24 z-50 max-h-[78dvh] overflow-y-auto rounded-[28px] bg-abyss p-5 text-white shadow-[0_40px_100px_-30px_rgb(0_0_0/0.8)] lg:inset-x-auto lg:bottom-6 lg:left-[288px] lg:w-[380px]" style={{ transformOrigin: "bottom left" }} ref={ref} tabIndex={-1} data-dark role="dialog" aria-label="Prototype controls">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">Prototype controls</h2>
          <p className="mt-1 text-sm text-white/75">For usability testing. These stand in for actions the admissions team takes behind the scenes.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close prototype controls" className="press grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/10">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <h3 className="mt-5 text-sm font-bold text-white/80">Start from</h3>
      <div className="mt-2 grid gap-2">
        {[
          ["default", "Amira, two active applications"],
          ["offers", "Three offers waiting to answer"],
          ["first", "First visit, no applications"],
        ].map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              scenario(k as "default");
              nav("/");
              onClose();
            }}
            className="press min-h-11 rounded-2xl bg-white/8 px-4 text-left text-[15px] font-bold transition-colors hover:bg-white/16"
          >
            {l}
          </button>
        ))}
      </div>
      <h3 className="mt-5 text-sm font-bold text-white/80">States to test</h3>
      <div className="mt-2 grid gap-2">
        <button type="button" onClick={() => { setNet(net === "ok" ? "offline" : "ok"); onClose(); }} className="press min-h-11 rounded-2xl bg-white/8 px-4 text-left text-[15px] font-bold transition-colors hover:bg-white/16">{net === "ok" ? "Go offline (saving and uploads fail)" : "Come back online"}</button>
        <button type="button" onClick={() => { setSession("warning"); onClose(); }} className="press min-h-11 rounded-2xl bg-white/8 px-4 text-left text-[15px] font-bold transition-colors hover:bg-white/16">Show session timeout warning</button>
        <button type="button" onClick={() => { nav("/emails"); onClose(); }} className="press min-h-11 rounded-2xl bg-white/8 px-4 text-left text-[15px] font-bold transition-colors hover:bg-white/16">Preview notification emails</button>
      </div>
      <h3 className="mt-5 text-sm font-bold text-white/80">Admissions team actions</h3>
      {sims.length === 0 ? (
        <p className="mt-2 text-sm text-white/70">Nothing to simulate yet. Accept an offer from Respond to offers, or use the three offers start point.</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {sims.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => simulate(x.id.replace(/(mo|mm|mn|im|in|od|xo)$/, ""), x.ev)} className="press w-full rounded-2xl bg-mint px-4 py-2.5 text-left text-abyss transition-colors hover:bg-white">
                <span className="block text-[15px] font-extrabold">{x.label}</span>
                <span className="block text-[13px] font-medium">{x.app}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useHub();
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[92px] z-[60] flex flex-col items-center gap-2 lg:bottom-6 lg:items-end lg:pr-3" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pop pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-[20px] bg-abyss py-3.5 pl-5 pr-2 text-[15px] font-semibold leading-snug text-white shadow-[0_30px_60px_-24px_rgb(1_30_45/0.8)]" style={{ transformOrigin: "bottom" }} data-dark>
          <span className="flex-1 pt-1">{t.text}</span>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss message" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/12">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}

const visited = new Set<string>();
function useFirstLoad(path: string) {
  const kind = skeletonKind(path);
  const key = kind === "detail" ? "detail" : path;
  const [loading, setLoading] = useState(!!kind && !visited.has(key));
  useEffect(() => {
    if (!kind || visited.has(key)) return setLoading(false);
    setLoading(true);
    const t = window.setTimeout(() => { visited.add(key); setLoading(false); }, 650);
    return () => window.clearTimeout(t);
  }, [key, kind]);
  return loading && kind ? kind : null;
}

export function Shell({ children }: { children: ReactNode }) {
  const { s } = useHub();
  const loc = useLocation();
  const [proto, setProto] = useState(false);
  const main = useRef<HTMLElement>(null);
  const sk = useFirstLoad(loc.pathname);
  const unreadMsgs = s.threads.filter((t) => t.unread).length;
  const tasks = s.apps.reduce((n, a) => n + openTasks(a).length, 0);
  const focusMode = /^\/(apply|new)\//.test(loc.pathname) || loc.pathname === "/new";

  useEffect(() => {
    window.scrollTo({ top: 0 });
    main.current?.focus({ preventScroll: true });
    setProto(false);
  }, [loc.pathname]);

  const here = NAV.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));
  const section = here?.label ?? (loc.pathname === "/discover" ? "Discover" : loc.pathname.startsWith("/new") || loc.pathname.startsWith("/apply") ? "New application" : loc.pathname === "/offers" ? "Respond to offers" : "Applicant Hub");
  const name = `${s.profile.firstName} ${s.profile.lastName}`;
  const todayLabel = NOW.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-mint focus:px-5 focus:py-3 focus:font-bold focus:text-abyss">
        Skip to main content
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col bg-deep px-4 pb-5 pt-6 text-white lg:flex" data-dark aria-label="Sidebar">
        <Link to="/" aria-label="educateU Applicant Hub, home" className="mx-2 mb-8 w-fit rounded-lg">
          <Logo reversed height={38} />
        </Link>
        <nav aria-label="Main" className="grid gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx("press group relative flex min-h-12 items-center gap-3.5 rounded-2xl px-4 text-[16px] font-bold transition-colors", isActive ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]" : "text-white/75 hover:bg-white/8 hover:text-white")}>
              {({ isActive }) => (
                <>
                  <n.icon className={cx("size-5 shrink-0", isActive ? "text-mint" : "text-white/60 group-hover:text-mint")} aria-hidden />
                  <span className="flex-1">{n.label}</span>
                  {n.to === "/messages" && unreadMsgs > 0 && (
                    <span className="tnum rounded-full bg-mint px-2 text-[13px] font-extrabold leading-5 text-abyss"><span className="sr-only">{unreadMsgs} unread</span><span aria-hidden>{unreadMsgs}</span></span>
                  )}
                  {n.to === "/applications" && tasks > 0 && (
                    <span className="tnum rounded-full bg-clay px-2 text-[13px] font-extrabold leading-5 text-white"><span className="sr-only">{tasks} tasks open</span><span aria-hidden>{tasks}</span></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto grid gap-3">
          <div className="rounded-[22px] bg-white/8 p-4">
            <p className="flex items-center gap-2 font-extrabold"><LifeBuoy className="size-4.5 text-mint" aria-hidden />Need a hand?</p>
            <p className="mt-1 text-[14px] leading-snug text-white/75">A real person replies, usually within one working day.</p>
            <Link to="/messages?new=1" className="press mt-3 inline-flex min-h-11 items-center rounded-full bg-white/12 px-4 text-[14px] font-bold hover:bg-white/20">Message admissions</Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 bg-deep text-white lg:bg-mist/90 lg:text-ink lg:backdrop-blur" data-dark>
          <div className="mx-auto flex h-16 items-center gap-3 px-4 sm:h-[72px] sm:px-10 lg:h-20 lg:px-10">
            <Link to="/" aria-label="educateU Applicant Hub, home" className="shrink-0 rounded-lg lg:hidden">
              <span className="sm:hidden"><Logo reversed height={30} /></span>
              <span className="hidden sm:block"><Logo reversed height={36} /></span>
            </Link>
            <p className="hidden text-[15px] font-bold text-slate lg:block" aria-hidden>{loc.pathname === "/" ? todayLabel : section}</p>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <Link to="/new" className="press group inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-4 text-[15px] font-extrabold text-abyss hover:bg-white sm:px-5 lg:bg-ink lg:text-white lg:hover:bg-deep">
                <Plus className="size-[18px] transition-transform duration-300 ease-[var(--ease-brand)] group-hover:rotate-90" strokeWidth={2.6} aria-hidden />
                <span className="hidden sm:inline">New application</span>
                <span className="sm:hidden">New</span>
                <span className="sr-only sm:hidden"> application</span>
              </Link>
              <Notifications />
              <UserMenu />
            </div>
          </div>
        </header>

        <OfflineBanner />
        <main id="main" ref={main} tabIndex={-1} className={cx("mx-auto max-w-[1240px] px-4 pb-32 pt-7 outline-none sm:px-10 sm:pt-12 lg:pb-20 lg:pt-6", focusMode && "max-w-[1100px]")}>
          {sk ? <PageSkeleton kind={sk} /> : children}
        </main>

        <footer className="mx-auto max-w-[1240px] px-4 pb-28 text-sm text-slate sm:px-10 lg:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6">
            <p>educateU Applicant Hub. Applications for UK home students.</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1">
              <Link to="/privacy" className="min-h-11 py-3 font-bold underline decoration-ink/30 underline-offset-4">Privacy notice</Link>
              <button type="button" onClick={() => setProto(true)} className="min-h-11 py-3 font-bold underline decoration-ink/30 underline-offset-4">Prototype controls</button>
            </p>
          </div>
        </footer>
      </div>

      {!focusMode && (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <ul className="mx-auto grid max-w-lg grid-cols-6">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={({ isActive }) => cx("press relative flex min-h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-bold leading-none", isActive ? "text-ink" : "text-slate")}>
                  {({ isActive }) => (
                    <>
                      <span className={cx("relative grid h-8 w-14 place-items-center rounded-full transition-colors duration-300", isActive && "bg-mint")}>
                        <n.icon className="size-[22px]" aria-hidden />
                        {n.to === "/messages" && unreadMsgs > 0 && <span aria-hidden className="absolute right-2 top-0.5 size-2.5 rounded-full bg-clay ring-2 ring-white" />}
                        {n.to === "/applications" && tasks > 0 && <span aria-hidden className="absolute right-2 top-0.5 size-2.5 rounded-full bg-clay ring-2 ring-white" />}
                      </span>
                      {n.short ?? n.label}
                      {n.to === "/messages" && unreadMsgs > 0 && <span className="sr-only">, {unreadMsgs} unread</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {proto && <ProtoPanel onClose={() => setProto(false)} />}
      <Toasts />
      <SessionGuard />
    </div>
  );
}
