import { cn } from "@/lib/cn";

/**
 * علامة سَنَد: سلسلة من ثلاث حلقات متصلة — الإسناد الذي ينتهي بمصدره.
 * الحلقة الأخيرة ممتلئة: الإجابة تنتهي عند الأصل.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M16 9.5v13"
        className="stroke-on-primary"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="16" cy="8.5" r="2.25" className="fill-primary stroke-on-primary" strokeWidth="1.75" />
      <circle cx="16" cy="16" r="2.25" className="fill-primary stroke-on-primary" strokeWidth="1.75" />
      <circle cx="16" cy="23.5" r="3" className="fill-on-primary" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-xl font-bold leading-none text-primary">سَنَد</span>
    </span>
  );
}
