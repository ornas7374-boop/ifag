import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import type { Quote } from "@/lib/pricing";

/**
 * تفصيل السعر قبل الدفع. العمولة تظهر فقط لمن يملك رؤيتها
 * (المزوّد والإدارة) ولا تُعرض للعميل إطلاقًا.
 */
export function PriceBreakdown({
  quote,
  showCommission = false,
}: {
  quote: Quote;
  showCommission?: boolean;
}) {
  return (
    <div className="space-y-2.5 text-sm">
      {quote.lines.map((line, index) => (
        <div key={`${line.label}-${index}`} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{line.label}</span>
          <span className="font-medium text-foreground">
            {formatSAR(line.amount)}
          </span>
        </div>
      ))}

      {quote.deliveryFee > 0 ? (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{ar.listing.deliveryFee}</span>
          <span className="font-medium text-foreground">
            {formatSAR(quote.deliveryFee)}
          </span>
        </div>
      ) : null}

      {quote.discount > 0 ? (
        <div className="flex justify-between gap-4 text-success">
          <span>{ar.booking.discount}</span>
          <span className="font-medium">- {formatSAR(quote.discount)}</span>
        </div>
      ) : null}

      <Separator />

      <div className="flex justify-between gap-4 text-base">
        <span className="font-semibold text-foreground">{ar.order.grandTotal}</span>
        <span className="font-bold text-foreground">{formatSAR(quote.total)}</span>
      </div>

      {showCommission ? (
        <div className="space-y-1.5 rounded-md bg-secondary p-3 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{ar.booking.commission}</span>
            <span>{formatSAR(quote.commission)}</span>
          </div>
          <div className="flex justify-between gap-4 font-medium">
            <span>{ar.booking.netEarnings}</span>
            <span>{formatSAR(quote.hostNet)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
