import { ar } from "@/lib/content/ar";

const bar = "rounded-sm bg-border/70 animate-pulse motion-reduce:animate-none";

/** هيكل مؤقت لمنطقة المحادثة أثناء تحميلها من التخزين. */
export function ChatSkeleton() {
  return (
    <div data-testid="chat-skeleton" role="status" className="mx-auto max-w-reading space-y-8 px-4 py-8 sm:px-6">
      <span className="sr-only">{ar.chat.loading}</span>
      <div className="flex justify-end">
        <div className={`${bar} h-11 w-1/2 rounded-lg`} />
      </div>
      <div className="grid grid-cols-[2rem_1fr] gap-x-3 sm:gap-x-4">
        <div className={`${bar} size-8 rounded-[9px]`} />
        <div className="space-y-3 pt-1">
          <div className={`${bar} h-3 w-16`} />
          <div className={`${bar} h-4 w-full`} />
          <div className={`${bar} h-4 w-11/12`} />
          <div className={`${bar} h-4 w-4/6`} />
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <div className={`${bar} h-24 rounded-md`} />
            <div className={`${bar} h-24 rounded-md`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** هيكل مؤقت لقائمة المحادثات. */
export function SidebarListSkeleton() {
  return (
    <div data-testid="sidebar-skeleton" role="status" className="space-y-2 px-3 py-2">
      <span className="sr-only">{ar.chat.loading}</span>
      {["w-4/5", "w-3/5", "w-2/3", "w-1/2"].map((w) => (
        <div key={w} className={`${bar} h-4 ${w}`} />
      ))}
    </div>
  );
}
