import { cn } from "@/lib/utils";
import { formatTime, formatDate } from "@/lib/format";
import { ar } from "@/content/ar";
import type { Booking } from "@/types/domain";

/**
 * يعرض النافذتين الزمنيتين جنبًا إلى جنب.
 *
 * وجود هذا المكوّن ليس تزيينًا: التمييز بين الفترة المتعاقد عليها
 * ونافذة الحجب هو أدق جزء في المنتج وأسهل ما يُساء فهمه. عرضه بصريًا
 * يجعل القاعدة مرئية لصاحب المكان وللمطوّر معًا، بدل بقائها مدفونة
 * في تعليق داخل ملف SQL.
 */

interface Props {
  booking: Pick<
    Booking,
    | "booking_start"
    | "booking_end"
    | "actual_check_in"
    | "actual_check_out"
    | "available_again_at"
    | "preparation_start"
  >;
  className?: string;
}

function ms(value: string | null): number | null {
  return value ? new Date(value).getTime() : null;
}

export function BookingTimeline({ booking, className }: Props) {
  const start = ms(booking.booking_start)!;
  const end = ms(booking.booking_end)!;
  const blockStart = ms(booking.preparation_start) ?? start;
  const blockEnd = ms(booking.available_again_at) ?? end;

  // المحور يغطي الاتحاد الكامل للنافذتين، مع هامش 10% لتنفّس العرض
  const min = Math.min(start, blockStart);
  const max = Math.max(end, blockEnd);
  const span = Math.max(1, max - min);
  const pad = span * 0.06;
  const axisMin = min - pad;
  const axisSpan = span + pad * 2;

  const pct = (t: number) => ((t - axisMin) / axisSpan) * 100;

  const releasedEarly = blockEnd < end;
  const extendedForCleanup = blockEnd > end;

  const bars = [
    {
      key: "contracted",
      label: ar.booking.contractedWindow,
      from: start,
      to: end,
      className: "bg-primary",
      note: "أساس التسعير — لا تتغيّر",
    },
    {
      key: "blocking",
      label: "نافذة الحجب في التقويم",
      from: blockStart,
      to: blockEnd,
      className: releasedEarly ? "bg-success" : "bg-accent",
      note: releasedEarly
        ? "تحرّر المكان مبكرًا"
        : extendedForCleanup
          ? "مُمدّدة للتجهيز"
          : "مطابقة للفترة المتعاقد عليها",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm text-muted-foreground">
        {formatDate(booking.booking_start)}
      </p>

      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.key} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{bar.label}</span>
              <span className="text-xs text-muted-foreground">{bar.note}</span>
            </div>

            {/* الشريط يُموضع بالنسبة المئوية داخل حاوية منطقية،
                فينعكس تلقائيًا مع اتجاه الصفحة دون حساب يدوي */}
            <div className="relative h-8 w-full rounded-md bg-muted">
              <div
                className={cn(
                  "absolute inset-y-0 rounded-md",
                  bar.className,
                )}
                style={{
                  insetInlineStart: `${pct(bar.from)}%`,
                  width: `${pct(bar.to) - pct(bar.from)}%`,
                }}
              />
              <span className="absolute inset-y-0 flex items-center px-2 text-xs font-medium text-foreground"
                    style={{ insetInlineStart: `${pct(bar.from)}%` }}>
                <span className="rounded bg-card/85 px-1.5 py-0.5">
                  {formatTime(new Date(bar.from))} – {formatTime(new Date(bar.to))}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {(booking.actual_check_in || booking.actual_check_out) && (
        <dl className="grid grid-cols-2 gap-3 rounded-md bg-secondary p-3 text-sm">
          {booking.actual_check_in ? (
            <div>
              <dt className="text-xs text-muted-foreground">
                {ar.booking.actualCheckIn}
              </dt>
              <dd className="font-medium">{formatTime(booking.actual_check_in)}</dd>
            </div>
          ) : null}
          {booking.actual_check_out ? (
            <div>
              <dt className="text-xs text-muted-foreground">
                {ar.booking.actualCheckOut}
              </dt>
              <dd className="font-medium">{formatTime(booking.actual_check_out)}</dd>
            </div>
          ) : null}
        </dl>
      )}

      {releasedEarly ? (
        <p className="rounded-md bg-success/10 p-3 text-xs leading-6 text-success">
          خرج العميل مبكرًا وحُرِّر المكان من {formatTime(new Date(blockEnd))}، بينما
          بقيت الفترة المتعاقد عليها حتى {formatTime(new Date(end))} — فالمبلغ
          المستحق لم يُنقص.
        </p>
      ) : null}
    </div>
  );
}
