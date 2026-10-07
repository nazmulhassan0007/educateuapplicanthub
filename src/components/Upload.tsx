import { useRef, useState } from "react";
import { Camera, FileText, FolderOpen, Upload as UpIcon } from "./icons";
import { useHub } from "../store";
import { Button, cx, Dialog } from "./ui";

const OK = ["application/pdf", "image/jpeg", "image/png"];
const MAX = 10 * 1024 * 1024;

export function validateFile(f: File): string | null {
  if (!OK.includes(f.type) && !/\.(pdf|jpe?g|png)$/i.test(f.name)) return "That file type is not accepted. Use a PDF, JPG or PNG.";
  if (f.size > MAX) return `That file is ${(f.size / 1048576).toFixed(1)} MB. The limit is 10 MB.`;
  return null;
}

export function UploadDialog({ open, onClose, title, slot, onPick }: { open: boolean; onClose: () => void; title: string; slot?: string; onPick: (name: string) => void }) {
  const { s, addLibDoc, net } = useHub();
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const take = (f?: File) => {
    if (!f) return;
    const e = validateFile(f);
    setErr(e);
    if (e) return;
    setBusy(true);
    window.setTimeout(() => {
      if (net === "offline") {
        setBusy(false);
        setFailed(f);
        setErr("The upload did not finish. We could not reach the server, so nothing was added. Check your connection and try again.");
        return;
      }
      addLibDoc(f.name, slot ?? "Document", f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`);
      onPick(f.name);
      setBusy(false);
      setErr(null);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={open} onClose={() => { setErr(null); onClose(); }} title={title}>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}
        className={cx("rounded-[24px] border-2 border-dashed px-5 py-7 text-center transition-colors duration-300", over ? "border-ink bg-[#eef9f6]" : "border-[#b9cbd3] bg-mist")}
      >
        <UpIcon className="mx-auto size-7 text-teal" aria-hidden />
        <p className="mt-3 font-bold">Drop a file here, or choose one</p>
        <p className="mt-1 text-sm text-slate">PDF, JPG or PNG, up to 10 MB.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <Button size="sm" className="min-h-11" loading={busy} onClick={() => input.current?.click()}>
            <FolderOpen className="size-4" aria-hidden />
            Choose file
          </Button>
          <Button size="sm" variant="secondary" className="min-h-11 sm:hidden" onClick={() => input.current?.click()}>
            <Camera className="size-4" aria-hidden />
            Take a photo
          </Button>
        </div>
        <input ref={input} type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" aria-label="Upload a file" onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {err && (
        <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-error-tint px-4 py-3 text-sm font-semibold text-[#a42424]">
          <span className="min-w-0 flex-1 basis-56">{err}</span>
          {failed && <Button size="sm" variant="danger" className="min-h-11" onClick={() => take(failed)}>Try again</Button>}
        </div>
      )}
      {s.library.length > 0 && (
        <>
          <h3 className="mt-6 text-base">Or pick from your documents</h3>
          <ul className="mt-2 grid gap-1.5">
            {s.library.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => { onPick(l.name); onClose(); }}
                  className="press flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left shadow-[inset_0_0_0_1.5px_#d3e0e5] transition-shadow duration-300 hover:shadow-[inset_0_0_0_2px_var(--color-ink)]"
                >
                  <FileText className="size-5 shrink-0 text-teal" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{l.name}</span>
                    <span className="block text-[13px] text-slate">{l.kind}, {l.size}</span>
                  </span>
                  <span className="text-sm font-bold">Use this</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Dialog>
  );
}
