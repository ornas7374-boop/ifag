import { ar } from "@/lib/content/ar";

/** مؤشر "يكتب…" قبل وصول أول جزء من الرد. الحركة تتوقف مع prefers-reduced-motion. */
export function TypingIndicator() {
  return (
    <div data-testid="waiting" role="status" className="flex items-center gap-3 text-sm text-text-muted">
      <span aria-hidden="true" className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-2 animate-bounce rounded-full bg-primary/60 motion-reduce:animate-none"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      {ar.chat.waiting}
    </div>
  );
}
