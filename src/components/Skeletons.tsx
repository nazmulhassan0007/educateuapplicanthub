import { Skeleton } from "./ui";

const card = "rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgb(1_62_91/0.07)]";

function AppCardSk() {
  return (
    <div className={card}>
      <div className="flex gap-4"><Skeleton className="size-12 !rounded-2xl" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>
      <Skeleton className="mt-6 h-7 w-full !rounded-full" />
      <Skeleton className="mt-5 h-4 w-2/3" />
      <Skeleton className="mt-6 h-11 w-28 !rounded-full" />
    </div>
  );
}

export function PageSkeleton({ kind }: { kind: "dashboard" | "list" | "detail" | "messages" }) {
  return (
    <div role="status" aria-label="Loading" aria-busy="true">
      <span className="sr-only">Loading your applications</span>
      {kind === "dashboard" && (
        <>
          <Skeleton className="h-12 w-full max-w-xl" />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.9fr_1fr]">
            <div className="grid gap-6">
              <div className={card}><Skeleton className="h-6 w-40" /><div className="mt-5 space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div></div>
              <div className="grid gap-6 md:grid-cols-2"><AppCardSk /><AppCardSk /></div>
            </div>
            <div className="grid gap-6">{[0, 1, 2].map((i) => <div key={i} className={card}><Skeleton className="h-5 w-32" /><Skeleton className="mt-4 h-20 w-full" /></div>)}</div>
          </div>
        </>
      )}
      {kind === "list" && (
        <>
          <Skeleton className="h-11 w-72" />
          <Skeleton className="mt-8 h-11 w-96 max-w-full !rounded-full" />
          <div className="mt-6 grid gap-6 lg:grid-cols-2"><AppCardSk /><AppCardSk /><AppCardSk /><AppCardSk /></div>
        </>
      )}
      {kind === "detail" && (
        <>
          <Skeleton className="h-5 w-40" />
          <div className={`${card} mt-5`}><div className="flex gap-5"><Skeleton className="size-14 !rounded-2xl" /><div className="flex-1 space-y-3"><Skeleton className="h-9 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div><Skeleton className="mt-6 h-16 w-full" /></div>
          <Skeleton className="mt-7 h-11 w-96 max-w-full !rounded-full" />
          <div className={`${card} mt-4`}><Skeleton className="h-8 w-full !rounded-full" /><Skeleton className="mt-8 h-6 w-40" /><Skeleton className="mt-3 h-5 w-2/3" /></div>
        </>
      )}
      {kind === "messages" && (
        <>
          <Skeleton className="h-11 w-56" />
          <div className="mt-8 grid gap-5 lg:grid-cols-[360px_1fr]"><div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full !rounded-[22px]" />)}</div><div className={card}><Skeleton className="h-7 w-2/3" /><Skeleton className="mt-6 h-24 w-3/4" /><Skeleton className="mt-4 ml-auto h-16 w-2/3" /></div></div>
        </>
      )}
    </div>
  );
}

export function skeletonKind(path: string): "dashboard" | "list" | "detail" | "messages" | null {
  if (path === "/") return "dashboard";
  if (path === "/applications" || path === "/documents") return "list";
  if (path.startsWith("/applications/")) return "detail";
  if (path === "/messages") return "messages";
  return null;
}
