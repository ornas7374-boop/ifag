import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { formatDateRange, formatNumber, formatSAR } from "@/lib/format";
import { ar } from "@/content/ar";
import type { Booking } from "@/types/domain";

export function BookingRow({ booking, href }: { booking: Booking; href: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Link href={href} className="font-semibold text-foreground hover:underline">
              {booking.place_title_ar}
            </Link>
            <p className="font-mono text-xs text-muted-foreground" dir="ltr">
              {booking.reference}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.payment_status} />
          </div>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <dd>{formatDateRange(booking.booking_start, booking.booking_end)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <dd>
              {formatNumber(booking.guests)} {ar.common.guests}
            </dd>
          </div>
          <div className="sm:text-end">
            <dd className="font-bold">{formatSAR(booking.total_amount)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
