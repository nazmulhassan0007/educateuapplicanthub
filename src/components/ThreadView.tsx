import { useState } from "react";
import { Send } from "./icons";
import type { Thread } from "../data/types";
import { fmtDateTime } from "../lib/date";
import { useHub } from "../store";
import { Button, cx, Initials, TextArea } from "./ui";

export function ThreadView({ t }: { t: Thread }) {
  const { sendMessage } = useHub();
  const [text, setText] = useState("");
  return (
    <div>
      <ul className="grid gap-4" aria-label={`Messages: ${t.subject}`}>
        {t.messages.map((m) => (
          <li key={m.id} className={cx("flex gap-3", m.from === "you" && "flex-row-reverse")}>
            <Initials name={m.from === "you" ? "You A" : m.who} className={cx("mt-1 size-9 text-[13px]", m.from === "you" ? "bg-mint !text-abyss" : "")} />
            <div className={cx("max-w-[85%] rounded-[22px] px-4 py-3", m.from === "you" ? "rounded-tr-md bg-ink text-white" : "rounded-tl-md bg-mist")} data-dark={m.from === "you" ? "" : undefined}>
              <p className={cx("text-[13px] font-bold", m.from === "you" ? "text-white/80" : "text-slate")}>
                {m.who} <span className="font-medium">{fmtDateTime(m.at)}</span>
              </p>
              <p className="mt-1 whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendMessage(t.id, text.trim());
          setText("");
        }}
      >
        <label htmlFor={`reply-${t.id}`} className="mb-1.5 block text-[15px] font-bold">Reply</label>
        <TextArea id={`reply-${t.id}`} value={text} onChange={(e) => setText(e.target.value)} className="!min-h-28" placeholder="Write your message" />
        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={!text.trim()}>
            <Send className="size-4" aria-hidden />
            Send message
          </Button>
        </div>
      </form>
    </div>
  );
}
