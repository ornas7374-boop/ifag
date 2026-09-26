import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { BookingTimeline } from "@/components/booking/booking-timeline";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR } from "@/lib/format";
import { getBooking } from "@/lib/data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  return (
    <>
      <PageHeader title={booking.place_title_ar} description={booking.reference} />

      <div className="mb-4 flex flex-wrap gap-2">
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.payment_status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{ar.booking.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTimeline booking={booking} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>التكلفة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{ar.booking.subtotal}</span>
              <span>{formatSAR(booking.base_amount)}</span>
            </div>
            {booking.addons_amount > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{ar.booking.addonsTotal}</span>
                <span>{formatSAR(booking.addons_amount)}</span>
              </div>
            ) : null}
            {booking.discount_amount > 0 ? (
              <div className="flex justify-between text-success">
                <span>{ar.booking.discount}</span>
                <span>- {formatSAR(booking.discount_amount)}</span>
              </div>
            ) : null}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>{ar.booking.total}</span>
              <span>{formatSAR(booking.total_amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>{ar.common.guests}</span>
              <span>{formatNumber(booking.guests)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
