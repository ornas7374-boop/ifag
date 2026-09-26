import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { BookingTimeline } from "@/components/booking/booking-timeline";
import { ReleaseControl } from "@/components/booking/release-control";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR } from "@/lib/format";
import { getBooking, listCalendar } from "@/lib/data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  /*
   * نبحث عن أقرب حجز تالٍ على نفس المكان لتحذير صاحب المكان قبل أن
   * يمدّد وقت الإتاحة إلى ما يتعارض معه. قاعدة البيانات سترفض التعارض
   * على أي حال، لكن معرفة السبب قبل المحاولة أفضل من رسالة خطأ بعدها.
   */
  const calendar = await listCalendar(booking.host_id);
  const currentEnd = new Date(booking.booking_end).getTime();
  const nextBookingStart =
    calendar
      .filter(
        (e) =>
          e.id !== booking.id &&
          new Date(e.booking_start).getTime() >= currentEnd,
      )
      .sort(
        (a, b) =>
          new Date(a.booking_start).getTime() -
          new Date(b.booking_start).getTime(),
      )[0]?.booking_start ?? null;

  const isBlock = booking.customer_id === "";

  return (
    <>
      <PageHeader
        title={booking.place_title_ar}
        description={isBlock ? "حجب صيانة" : booking.reference}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <BookingStatusBadge status={booking.status} />
        {!isBlock ? <PaymentStatusBadge status={booking.payment_status} /> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ar.booking.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingTimeline booking={booking} />
            </CardContent>
          </Card>

          {!isBlock ? (
            <Card>
              <CardHeader>
                <CardTitle>الدخول والخروج</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  variant={booking.actual_check_in ? "outline" : "default"}
                  disabled={Boolean(booking.actual_check_in)}
                >
                  {booking.actual_check_in ? "تم تسجيل الدخول" : "تسجيل دخول العميل"}
                </Button>
                <Button
                  variant={booking.actual_check_out ? "outline" : "default"}
                  disabled={
                    !booking.actual_check_in || Boolean(booking.actual_check_out)
                  }
                >
                  {booking.actual_check_out ? "تم تسجيل الخروج" : "تسجيل خروج العميل"}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إتاحة المكان</CardTitle>
            </CardHeader>
            <CardContent>
              <ReleaseControl
                bookingEnd={booking.booking_end}
                availableAgainAt={booking.available_again_at}
                nextBookingStart={nextBookingStart}
              />
            </CardContent>
          </Card>

          {!isBlock ? (
            <Card>
              <CardHeader>
                <CardTitle>الأرباح</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{ar.booking.total}</span>
                  <span>{formatSAR(booking.total_amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{ar.booking.commission}</span>
                  <span>- {formatSAR(booking.commission_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{ar.booking.netEarnings}</span>
                  <span>
                    {formatSAR(
                      (booking.total_amount - booking.commission_amount) as typeof booking.total_amount,
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-muted-foreground">
                  <span>{ar.common.guests}</span>
                  <span>{formatNumber(booking.guests)}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
