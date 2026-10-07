import { useMemo, useState } from "react";
import { AlertCircle, ClipboardList, FilePen, Archive, Plus } from "../components/icons";
import { AppCard } from "../components/AppCard";
import { Banner, Button, Dialog, Empty, LinkButton, PageHeader, Select, Tabs } from "../components/ui";
import type { Application } from "../data/types";
import { actionNeeded, cOf, isActive, isClosed, isDraft, liveOffers, sortApps, submittedCount } from "../lib/app";
import { fmtShort } from "../lib/date";
import { useHub } from "../store";

type Tab = "active" | "drafts" | "closed";
type Sort = "updated" | "intake" | "name";

export function MyApplications() {
  const { s, deleteDraft } = useHub();
  const active = s.apps.filter(isActive);
  const drafts = s.apps.filter(isDraft);
  const closed = s.apps.filter(isClosed);
  const [tab, setTab] = useState<Tab>(active.length ? "active" : drafts.length ? "drafts" : "active");
  const [onlyAction, setOnlyAction] = useState(false);
  const [sort, setSort] = useState<Sort>("updated");
  const [del, setDel] = useState<Application | null>(null);

  const offers = liveOffers(s.apps);
  const earliest = offers.map((a) => a.offer!.deadline).sort()[0];
  const actionCount = s.apps.filter((a) => !a.outcome && actionNeeded(a)).length;
  const intakes = useMemo(() => Array.from(new Set(s.apps.filter((a) => a.stage >= 2).map((a) => a.intake))), [s.apps]);

  const base = tab === "active" ? active : tab === "drafts" ? drafts : closed;
  const list = sortApps(onlyAction ? base.filter((a) => actionNeeded(a)) : base, sort);

  return (
    <div>
      <PageHeader title="My applications" lead="Every application you have started, and where each one stands." />

      {offers.length > 0 && (
        <div className="mb-6 rise">
          <Banner
            tone="action"
            title={`You have ${offers.length} offer${offers.length === 1 ? "" : "s"} waiting for your answer`}
            action={
              <LinkButton to="/offers" size="sm" className="min-h-11" arrow>
                Respond to offers
              </LinkButton>
            }
          >
            The earliest deadline is {fmtShort(earliest)}.
          </Banner>
        </div>
      )}

      {intakes.length > 0 && (
        <ul className="mb-6 flex flex-wrap gap-2.5" aria-label="Applications submitted per intake">
          {intakes.map((i) => {
            const n = submittedCount(s.apps, i);
            return (
              <li key={i} className="rounded-full bg-white px-4 py-2 text-[15px] shadow-[0_0_0_1px_rgb(1_62_91/0.07)]">
                <span className="tnum font-extrabold">
                  {n} of 5
                </span>{" "}
                applications submitted for {i.replace("Sep", "September").replace("Jan", "January")}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <Tabs
          label="Filter applications"
          value={tab}
          onChange={(t) => setTab(t)}
          tabs={[
            { id: "active", label: "Active", count: active.length },
            { id: "drafts", label: "Drafts", count: drafts.length },
            { id: "closed", label: "Closed", count: closed.length },
          ]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={onlyAction}
            onClick={() => setOnlyAction((v) => !v)}
            className={`press inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold ${onlyAction ? "bg-clay text-white" : "bg-clay-tint text-clay-text hover:bg-[#f8e0d3]"}`}
          >
            <AlertCircle className="size-4" aria-hidden />
            Action needed
            <span className="tnum rounded-full bg-white/70 px-2 text-[13px] text-clay-text">{actionCount}</span>
          </button>
          <div className="w-52">
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="!min-h-11 !py-2 text-[15px] font-bold">
              <option value="updated">Last updated</option>
              <option value="intake">Intake date</option>
              <option value="name">Institution A to Z</option>
            </Select>
          </div>
        </div>
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {list.length === 0 ? (
          onlyAction ? (
            <Empty icon={<AlertCircle className="size-7" />} title="Nothing needs your action here" action={<Button variant="secondary" onClick={() => setOnlyAction(false)}>Show all</Button>}>
              Nothing in this tab has a task waiting for you. We will flag it here and email you when that changes.
            </Empty>
          ) : tab === "active" ? (
            <Empty icon={<ClipboardList className="size-7" />} title="No active applications yet" action={<LinkButton to="/new" arrow>New application</LinkButton>}>
              Applications you have submitted appear here, with a tracker showing where each one has got to.
            </Empty>
          ) : tab === "drafts" ? (
            <Empty icon={<FilePen className="size-7" />} title="No drafts" action={<LinkButton to="/new" arrow>New application</LinkButton>}>
              When you start an application it is saved as a draft until you submit it. Drafts do not count toward your limit of five.
            </Empty>
          ) : (
            <Empty icon={<Archive className="size-7" />} title="Nothing closed yet">
              Applications that are withdrawn, unsuccessful or declined move here with their full history. They cannot be reopened.
            </Empty>
          )
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {list.map((a, i) => (
              <li key={a.id} className="rise" style={{ animationDelay: `${i * 50}ms` }}>
                <AppCard a={a} onDelete={setDel} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete this draft?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDel(null)}>Keep draft</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (del) deleteDraft(del.id);
                setDel(null);
              }}
            >
              Delete draft
            </Button>
          </>
        }
      >
        {del && (
          <p className="text-slate">
            Your draft for <strong className="text-ink">{cOf(del).title}</strong> at {cOf(del).institution} will be removed. Your profile and documents stay as they are. This cannot be undone.
          </p>
        )}
      </Dialog>
    </div>
  );
}
