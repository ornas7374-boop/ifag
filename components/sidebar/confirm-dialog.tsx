"use client";

import { useEffect, useRef } from "react";

import { buttonClasses } from "@/components/ui/button";

/**
 * نافذة تأكيد فوق <dialog> الأصلي: حبس التركيز وEsc والطبقة العليا
 * يوفّرها المتصفح. التركيز الأول على "إلغاء" (الخيار الآمن).
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
      data-testid="confirm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel(); // نقرة على الخلفية
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-0 text-text shadow-md backdrop:bg-text/40"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p id="confirm-body" className="mt-2 text-sm text-text-muted [overflow-wrap:anywhere]">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className={buttonClasses({ variant: "secondary" })}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid="confirm-delete"
            className={buttonClasses({ variant: "danger" })}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
