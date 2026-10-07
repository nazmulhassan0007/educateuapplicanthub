import { useEffect, useState } from "react";
import { Clock, LogIn, WifiOff } from "./icons";
import { useHub } from "../store";
import { Button, Dialog } from "./ui";
import { Logo } from "./Logo";

const IDLE_MS = 14 * 60 * 1000;
const COUNTDOWN = 60;

export function OfflineBanner() {
  const { net, setNet } = useHub();
  if (net === "ok") return null;
  return (
    <div role="alert" className="sticky top-16 z-20 bg-clay-tint text-clay-text sm:top-[72px]">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-10">
        <WifiOff className="size-5 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1 basis-64 font-bold leading-snug">You are offline. Changes are not being saved. We will save them as soon as you are back.</p>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => setNet("ok")}>Try again</Button>
      </div>
    </div>
  );
}

export function SessionGuard() {
  const { session, setSession, s } = useHub();
  const [left, setLeft] = useState(COUNTDOWN);

  // Idle detection: any input resets the timer.
  useEffect(() => {
    if (session !== "active") return;
    let t = window.setTimeout(() => setSession("warning"), IDLE_MS);
    const reset = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setSession("warning"), IDLE_MS);
    };
    const ev = ["pointerdown", "keydown", "scroll"] as const;
    ev.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(t);
      ev.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [session, setSession]);

  useEffect(() => {
    if (session !== "warning") return;
    setLeft(COUNTDOWN);
    const i = window.setInterval(() => setLeft((n) => n - 1), 1000);
    return () => window.clearInterval(i);
  }, [session]);
  useEffect(() => {
    if (session === "warning" && left <= 0) setSession("out");
  }, [left, session, setSession]);

  if (session === "out") {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-abyss p-6 text-white" data-dark role="alertdialog" aria-labelledby="so-t">
        <div className="pop w-full max-w-md text-center">
          <div className="mx-auto w-fit"><Logo reversed height={40} /></div>
          <h1 id="so-t" className="mt-10 text-[34px]">You have been signed out</h1>
          <p className="mt-3 text-[17px] text-white/80">You were inactive for a while, so we signed you out to keep your details safe. Everything you had saved is still here.</p>
          <Button variant="mint" size="lg" className="mt-8 w-full" onClick={() => setSession("active")}><LogIn className="size-5" aria-hidden />Sign in again</Button>
          <p className="mt-4 text-sm text-white/65">Signing in uses your educateu.com account.</p>
        </div>
      </div>
    );
  }
  return (
    <Dialog
      open={session === "warning"}
      onClose={() => setSession("active")}
      title="Are you still there?"
      footer={
        <>
          <Button variant="ghost" onClick={() => setSession("out")}>Sign out</Button>
          <Button onClick={() => setSession("active")}>Stay signed in</Button>
        </>
      }
    >
      <p className="flex items-start gap-3 text-[17px] leading-relaxed"><Clock className="mt-1 size-5 shrink-0 text-clay" aria-hidden />
        <span>We will sign you out in <strong className="tnum">{Math.max(left, 0)} seconds</strong> because you have been inactive. Your work is saved{s.apps.some((a) => a.stage === 1) ? ", including your drafts" : ""}.</span></p>
      <div role="progressbar" aria-hidden className="mt-5 h-2 overflow-hidden rounded-full bg-[#d5e2e7]"><div className="h-full rounded-full bg-clay transition-[width] duration-1000 ease-linear" style={{ width: `${(Math.max(left, 0) / COUNTDOWN) * 100}%` }} /></div>
    </Dialog>
  );
}
