"use client";

import * as React from "react";
import { AlertTriangle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ar } from "@/content/ar";
import { formatTime, TIME_ZONE } from "@/lib/format";

/**
 * تحكّم صاحب المكان في `available_again_at`.
 *
 * هذه الشاشة هي الوجه العملي لأهم قاعدة في النظام: تعديل وقت
 * الإتاحة يغيّر حجب التقويم فقط، ولا يمس الفترة المتعاقد عليها ولا
 * المبلغ المستحق.
 *
 * التحذير عند التعارض ليس تجميليًا: قيد الاستبعاد في قاعدة البيانات
 * سيرفض الحفظ برمز 23P01 على أي حال، والأفضل أن يعرف صاحب المكان
 * السبب قبل الضغط لا بعده.
 */

interface Props {
  bookingEnd: string;
  availableAgainAt: string | null;
  /** بداية الحجز التالي على نفس المكان، إن وُجد. */
  nextBookingStart: string | null;
  onSave?: (isoValue: string) => void;
}

/** ISO ← قيمة input[type=datetime-local] بتوقيت الرياض. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** قيمة الحقل (تُقرأ كتوقيت رياض) ← ISO. */
function fromLocalInput(value: string): string {
  return new Date(`${value}:00+03:00`).toISOString();
}

export function ReleaseControl({
  bookingEnd,
  availableAgainAt,
  nextBookingStart,
  onSave,
}: Props) {
  const initial = toLocalInput(availableAgainAt ?? bookingEnd);
  const [value, setValue] = React.useState(initial);
  const [saved, setSaved] = React.useState(false);

  const selectedIso = React.useMemo(() => {
    try {
      return fromLocalInput(value);
    } catch {
      return null;
    }
  }, [value]);

  const selectedMs = selectedIso ? new Date(selectedIso).getTime() : null;
  const endMs = new Date(bookingEnd).getTime();
  const nextMs = nextBookingStart ? new Date(nextBookingStart).getTime() : null;

  const conflicts = selectedMs !== null && nextMs !== null && selectedMs > nextMs;
  const releasesEarly = selectedMs !== null && selectedMs < endMs;
  const dirty = value !== initial;

  function handleSave() {
    if (!selectedIso || conflicts) return;
    onSave?.(selectedIso);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="available-again">{ar.booking.availableAgainAt}</Label>
        <Input
          id="available-again"
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby="available-again-help"
        />
      </div>

      <p id="available-again-help" className="text-xs leading-6 text-muted-foreground">
        يحدد متى يعود المكان متاحًا للحجز. تقديمه يحرّر الوقت مبكرًا،
        وتأخيره يحجز وقتًا إضافيًا للتجهيز. الفترة المتعاقد عليها والمبلغ
        المستحق لا يتأثران.
      </p>

      {releasesEarly ? (
        <p className="rounded-md bg-success/10 p-3 text-xs leading-6 text-success">
          سيتحرّر المكان الساعة {formatTime(selectedIso!)} بدل{" "}
          {formatTime(bookingEnd)} — يمكن قبول حجز جديد يبدأ من ذلك الوقت،
          والمبلغ يبقى كما هو.
        </p>
      ) : null}

      {conflicts ? (
        <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs leading-6 text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            هذا الوقت يتعارض مع حجز مؤكد يبدأ الساعة{" "}
            {formatTime(nextBookingStart!)}. اختر وقتًا أبكر — قاعدة البيانات
            سترفض الحفظ وإلا.
          </span>
        </p>
      ) : null}

      <Button
        onClick={handleSave}
        disabled={!dirty || conflicts}
        className="w-full"
      >
        {saved ? <Check aria-hidden /> : null}
        {saved ? "تم الحفظ" : ar.common.save}
      </Button>
    </div>
  );
}
