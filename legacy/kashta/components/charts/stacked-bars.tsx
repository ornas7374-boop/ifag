import { formatSAR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { halalas, type Halalas } from "@/lib/money";

/**
 * مخطط أعمدة مكدّسة — سلسلتان تُكوّنان الإجمالي.
 *
 * لماذا مبني يدويًا بدل مكتبة؟ ستة أعمدة لا تستحق حزمة JavaScript
 * إضافية. هذا المكوّن يُعرض على الخادم بالكامل، والتلميح عند التحويم
 * يعمل بـ CSS وحده — صفر JavaScript على العميل.
 *
 * الألوان تأتي من --color-chart-1/2 المُتحقَّق منها آليًا: اللون
 * الأساسي للواجهة يرسب في فحص المخططات لانخفاض تشبّعه.
 */

export interface StackedBarDatum {
  label: string;
  /** الجزء السفلي — نصيب المزوّد. */
  primary: Halalas;
  /** الجزء العلوي — عمولة المنصة. */
  secondary: Halalas;
}

export function StackedBars({
  data,
  primaryLabel,
  secondaryLabel,
  className,
}: {
  data: StackedBarDatum[];
  primaryLabel: string;
  secondaryLabel: string;
  className?: string;
}) {
  const totals = data.map((d) => d.primary + d.secondary);
  const max = Math.max(1, ...totals);

  return (
    <figure className={cn("space-y-4", className)}>
      {/* سلسلتان ⇒ وسيلة إيضاح دائمة، فلا تعتمد الهوية على اللون وحده */}
      <figcaption className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-3 rounded-sm"
            style={{ backgroundColor: "var(--color-chart-1)" }}
          />
          <span className="text-muted-foreground">{primaryLabel}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-3 rounded-sm"
            style={{ backgroundColor: "var(--color-chart-2)" }}
          />
          <span className="text-muted-foreground">{secondaryLabel}</span>
        </span>
      </figcaption>

      <div className="flex h-56 items-end gap-2 sm:gap-4" role="presentation">
        {data.map((d, i) => {
          const total = totals[i] ?? 0;
          const totalPct = (total / max) * 100;
          const primaryShare = total > 0 ? (d.primary / total) * 100 : 0;

          return (
            <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end gap-2">
              {/* قيمة مباشرة فوق كل عمود — سلسلتان فقط فالتسمية المباشرة ممكنة */}
              <span className="text-center text-xs font-medium tabular-nums text-foreground">
                {formatSAR(halalas(total))}
              </span>

              {total === 0 ? (
                /*
                 * الصفر يجب أن يُقرأ صفرًا.
                 * إعطاؤه ارتفاعًا أدنى بلون العمولة يوحي بأن عمولة حُصّلت
                 * في شهر بلا دخل — خط محايد على خط الأساس هو الصادق.
                 */
                <div className="h-0.5 w-full rounded-full bg-border" />
              ) : (
                <div
                  className="relative w-full overflow-hidden rounded-t"
                  style={{ height: `${Math.max(totalPct, 2)}%` }}
                >
                  {/* الجزء العلوي: العمولة. فاصل 2px بلون السطح بين الجزأين */}
                  <div
                    className="absolute inset-x-0 top-0 border-b-2 border-card"
                    style={{
                      height: `${100 - primaryShare}%`,
                      backgroundColor: "var(--color-chart-2)",
                    }}
                  />
                  {/* الجزء السفلي: نصيب المزوّد، مثبّت على خط الأساس */}
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      height: `${primaryShare}%`,
                      backgroundColor: "var(--color-chart-1)",
                    }}
                  />
                </div>
              )}

              <span className="text-center text-xs text-muted-foreground">
                {d.label}
              </span>

              {/* تلميح عند التحويم — CSS فقط، بلا JavaScript */}
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full start-1/2 z-10 mb-1 hidden w-max -translate-x-1/2 rtl:translate-x-1/2 rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-lg group-hover:block"
              >
                <p className="font-medium">{d.label}</p>
                <p>
                  {primaryLabel}: {formatSAR(d.primary)}
                </p>
                <p>
                  {secondaryLabel}: {formatSAR(d.secondary)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* بديل جدولي — الوصول للبيانات لا يعتمد على قراءة الرسم */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          عرض البيانات كجدول
        </summary>
        <table className="mt-3 w-full text-start">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="py-2 text-start font-medium">الشهر</th>
              <th scope="col" className="py-2 text-start font-medium">{primaryLabel}</th>
              <th scope="col" className="py-2 text-start font-medium">{secondaryLabel}</th>
              <th scope="col" className="py-2 text-start font-medium">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.label} className="border-b border-border/50">
                <th scope="row" className="py-2 text-start font-normal">{d.label}</th>
                <td className="py-2 tabular-nums">{formatSAR(d.primary)}</td>
                <td className="py-2 tabular-nums">{formatSAR(d.secondary)}</td>
                <td className="py-2 font-medium tabular-nums">
                  {formatSAR(halalas(totals[i] ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
