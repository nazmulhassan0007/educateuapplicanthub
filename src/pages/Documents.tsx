import { useState } from "react";
import { FileImage, FileText, FolderOpen, Trash2, Upload as UpIcon } from "../components/icons";
import { UploadDialog } from "../components/Upload";
import { Button, Dialog, Empty, PageHeader } from "../components/ui";
import type { LibDoc } from "../data/types";
import { fmt } from "../lib/date";
import { cOf } from "../lib/app";
import { useHub } from "../store";

export function Documents() {
  const { s, removeLibDoc } = useHub();
  const [up, setUp] = useState(false);
  const [del, setDel] = useState<LibDoc | null>(null);
  const usedIn = (name: string) => s.apps.filter((a) => a.docs.some((d) => d.name === name) || Object.values(a.form.docs).includes(name));
  return (
    <div>
      <PageHeader title="Documents" lead="Upload a file once and attach it to any application. PDF, JPG or PNG, up to 10 MB.">
        <Button onClick={() => setUp(true)}><UpIcon className="size-4.5" aria-hidden />Upload a document</Button>
      </PageHeader>
      {s.library.length === 0 ? (
        <Empty icon={<FolderOpen className="size-7" />} title="No documents yet" action={<Button onClick={() => setUp(true)}>Upload a document</Button>}>
          Add your photo ID, qualification certificates and proof of address here. When an application asks for them you can pick them with one tap.
        </Empty>
      ) : (
        <ul className="grid gap-3">
          {s.library.map((l, i) => {
            const used = usedIn(l.name);
            const Icon = /\.(jpe?g|png)$/i.test(l.name) ? FileImage : FileText;
            return (
              <li key={l.id} className="rise flex flex-wrap items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgb(1_62_91/0.07)] sm:p-5" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-teal"><Icon className="size-6" aria-hidden /></span>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-extrabold">{l.name}</p>
                  <p className="text-sm text-slate">{l.kind}, {l.size}. Added {fmt(l.addedAt)}.</p>
                  <p className="mt-0.5 text-sm text-slate">{used.length ? `Used in ${used.map((a) => cOf(a).title).join(", ")}` : "Not attached to an application yet"}</p>
                </div>
                <Button variant="ghost" size="sm" className="min-h-11" onClick={() => setDel(l)}><Trash2 className="size-4" aria-hidden />Remove<span className="sr-only"> {l.name}</span></Button>
              </li>
            );
          })}
        </ul>
      )}
      <UploadDialog open={up} onClose={() => setUp(false)} title="Upload a document" onPick={() => undefined} />
      <Dialog open={!!del} onClose={() => setDel(null)} title="Remove this document?" footer={<><Button variant="ghost" onClick={() => setDel(null)}>Keep it</Button><Button variant="danger" onClick={() => { if (del) removeLibDoc(del.id); setDel(null); }}>Remove document</Button></>}>
        {del && <p className="text-slate"><strong className="text-ink">{del.name}</strong> leaves your library. Copies already sent with an application stay with that application.</p>}
      </Dialog>
    </div>
  );
}
