"use client";

import { ArrowUp } from "lucide-react";
import { useCallback, useLayoutEffect, useState } from "react";

import { ar } from "@/lib/content/ar";
import { cn } from "@/lib/cn";

/** أقصى ارتفاع ≈ 6 أسطر (16px × 1.75 × 6 = 168px) ثم scroll داخلي. */
const MAX_HEIGHT_PX = 168;

export function Composer({
  busy,
  onSend,
  inputRef,
}: {
  /** أثناء انتظار الرد أو البث: الكتابة مسموحة، والإرسال لا. */
  busy: boolean;
  onSend: (text: string) => Promise<boolean>;
  /** لإعادة التركيز إلى الحقل من الشاشة الأم (بعد الإيقاف أو إعادة المحاولة). */
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const t = ar.chat;
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !busy;

  // التمدد التلقائي مع كل تغيير في النص.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value, inputRef]);

  const submit = useCallback(async () => {
    if (!canSend) return;
    const sent = await onSend(value);
    if (sent) setValue("");
    inputRef.current?.focus();
  }, [canSend, onSend, value, inputRef]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      data-testid="composer"
      className="flex items-end gap-2 rounded-xl border border-border-strong bg-surface p-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
    >
      <label htmlFor="chat-input" className="sr-only">
        {t.inputLabel}
      </label>
      <textarea
        id="chat-input"
        ref={inputRef}
        rows={1}
        value={value}
        placeholder={t.inputPlaceholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          // Enter = إرسال، Shift+Enter = سطر جديد، ولا إرسال أثناء كتابة IME.
          if (e.key !== "Enter" || e.shiftKey) return;
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          e.preventDefault();
          void submit();
        }}
        className="max-h-[168px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-text placeholder:text-text-subtle focus-visible:outline-none"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label={t.send}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
          "bg-primary text-on-primary hover:bg-primary-hover",
          "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-subtle",
        )}
      >
        <ArrowUp aria-hidden="true" className="size-5" />
      </button>
    </form>
  );
}
