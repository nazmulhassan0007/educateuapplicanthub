import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquarePlus, MessagesSquare } from "../components/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ThreadView } from "../components/ThreadView";
import { Button, cx, Empty, Field, Input, PageHeader, Select, TextArea } from "../components/ui";
import { cOf, isActive } from "../lib/app";
import { fmt } from "../lib/date";
import { useHub } from "../store";

function Compose({ onDone }: { onDone: (id: string) => void }) {
  const { s, startThread } = useHub();
  const [appId, setAppId] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [tried, setTried] = useState(false);
  const apps = s.apps.filter((a) => isActive(a) || a.stage === 1);
  return (
    <form
      className="grid max-w-xl gap-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!text.trim()) return;
        const a = s.apps.find((x) => x.id === appId);
        onDone(startThread(appId || undefined, subject.trim() || (a ? `${cOf(a).title}: your question` : "General question"), text.trim()));
      }}
    >
      <h2 className="text-2xl">Message the admissions team</h2>
      <Field label="What is it about?" hint="Pick an application so the right person sees it.">
        {(p) => (
          <Select {...p} value={appId} onChange={(e) => setAppId(e.target.value)}>
            <option value="">General question</option>
            {apps.map((a) => <option key={a.id} value={a.id}>{cOf(a).title}, {cOf(a).institution}</option>)}
          </Select>
        )}
      </Field>
      <Field label="Subject" optional>{(p) => <Input {...p} value={subject} onChange={(e) => setSubject(e.target.value)} />}</Field>
      <Field label="Your message" error={tried && !text.trim() ? "Write your message before sending." : undefined}>{(p) => <TextArea {...p} value={text} onChange={(e) => setText(e.target.value)} className="!min-h-40" />}</Field>
      <div><Button type="submit" arrow>Send message</Button></div>
    </form>
  );
}

export function Messages() {
  const { s, readThread } = useHub();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const composing = sp.get("new") === "1";
  const sel = sp.get("thread");
  const list = [...s.threads].sort((x, y) => y.messages[y.messages.length - 1].at.localeCompare(x.messages[x.messages.length - 1].at));
  const cur = composing ? undefined : s.threads.find((t) => t.id === sel) ?? (typeof window !== "undefined" && window.matchMedia("(min-width:1024px)").matches ? list[0] : undefined);
  useEffect(() => { if (cur?.unread) readThread(cur.id); }, [cur?.id, cur?.unread, readThread]);

  if (list.length === 0 && !composing) {
    return (
      <div>
        <PageHeader title="Messages" />
        <Empty icon={<MessagesSquare className="size-7" />} title="No messages yet" action={<Button arrow onClick={() => setSp({ new: "1" })}>Message admissions</Button>}>
          Conversations with the admissions team about your applications appear here. A real person replies, usually within one working day.
        </Empty>
      </div>
    );
  }

  const showList = !cur && !composing;
  return (
    <div>
      <PageHeader title="Messages" lead="Conversations with the admissions team, kept next to each application.">
        <Button onClick={() => setSp({ new: "1" })} variant="secondary"><MessageSquarePlus className="size-4.5" aria-hidden />New message</Button>
      </PageHeader>
      <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <nav aria-label="Conversations" className={cx((cur || composing) && "hidden lg:block")}>
          <ul className="grid gap-2">
            {list.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const on = cur?.id === t.id;
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setSp({ thread: t.id })} aria-current={on ? "true" : undefined} className={cx("press flex w-full items-start gap-3 rounded-[22px] p-4 text-left transition-shadow duration-300", on ? "bg-ink text-white" : "bg-white shadow-[0_0_0_1px_rgb(1_62_91/0.07)] hover:shadow-[0_0_0_1.5px_var(--color-ink)]")} data-dark={on ? "" : undefined}>
                    <span aria-hidden className={cx("mt-2 size-2.5 shrink-0 rounded-full", t.unread ? (on ? "bg-mint" : "bg-ink") : "bg-transparent")} />
                    <span className="min-w-0 flex-1">
                      <span className={cx("block truncate leading-snug", t.unread ? "font-extrabold" : "font-bold")}>{t.unread && <span className="sr-only">Unread. </span>}{t.subject}</span>
                      <span className={cx("mt-0.5 line-clamp-2 text-[14px] leading-snug", on ? "text-white/80" : "text-slate")}>{last.who.split(",")[0]}: {last.text}</span>
                      <span className={cx("mt-1 block text-[12px]", on ? "text-white/70" : "text-slate")}>{fmt(last.at)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <section aria-live="polite" className={cx("rise rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgb(1_62_91/0.07)] sm:p-8", showList && "hidden lg:block")} key={cur?.id ?? (composing ? "new" : "none")}>
          {composing ? (
            <>
              <button type="button" onClick={() => setSp({})} className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold lg:hidden"><ArrowLeft className="size-4" aria-hidden />All messages</button>
              <Compose onDone={(id) => { setSp({ thread: id }); }} />
            </>
          ) : cur ? (
            <>
              <button type="button" onClick={() => setSp({})} className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold lg:hidden"><ArrowLeft className="size-4" aria-hidden />All messages</button>
              <h2 className="mb-6 text-2xl">{cur.subject}</h2>
              <ThreadView t={cur} />
              {cur.appId && <Button variant="ghost" size="sm" className="mt-4 min-h-11" onClick={() => nav(`/applications/${cur.appId}`)}>Go to this application</Button>}
            </>
          ) : (
            <p className="text-slate">Choose a conversation.</p>
          )}
        </section>
      </div>
    </div>
  );
}
