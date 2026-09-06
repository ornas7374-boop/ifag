import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { BookingRow } from "@/components/domain/booking-row";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR, formatTime } from "@/lib/format";
import { halalas } from "@/lib/money";
import { listBookings, listHostDueActions, listOrders } from "@/lib/data";

export const metadata = { title: ar.host.title };

export default async function Page() {
  const [upcoming, allBookings, orders, due] = await Promise.all([
    listBookings({ as: "host", when: "upcoming", includeBlocks: true }),
    listBookings({ as: "host", when: "all", includeBlocks: false }),
    listOrders({ as: "host" }),
    listHostDueActions("u-host-1"),
  ]);

  // الأرباح من الحجوزات المدفوعة فقط — المعلّقة ليست دخلًا بعد
  const paid = allBookings.filter((b) => b.payment_status === "paid");
  const gross = halalas(paid.reduce((s, b) => s + b.total_amount, 0));
  const commission = halalas(paid.reduce((s, b) => s + b.commission_amount, 0));
  const net = halalas(gross - commission);

  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  return (
    <>
      <PageHeader title={ar.host.title} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={ar.host.totalBookings} value={formatNumber(allBookings.length)} />
        <StatCard label={ar.host.totalOrders} value={formatNumber(orders.length)} hint={`${formatNumber(activeOrders.length)} نشط`} />
        <StatCard label={ar.host.totalEarnings} value={formatSAR(gross)} hint={`عمولة ${formatSAR(commission)}`} />
        <StatCard label={ar.booking.netEarnings} value={formatSAR(net)} />
      </div>

      {due.needsCheckIn.length > 0 || due.needsCheckOut.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">إجراءات مستحقة الآن</h2>
          <div className="space-y-3">
            {due.needsCheckIn.map((b) => (
              <Card key={`in-${b.id}`}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <LogIn className="size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="font-medium">{b.place_title_ar}</p>
                      <p className="text-sm text-muted-foreground">
                        بدأ {formatTime(b.booking_start)} — لم يُسجَّل الدخول
                      </p>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/host/bookings/${b.id}`}>تسجيل الدخول</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}

            {due.needsCheckOut.map((b) => (
              <Card key={`out-${b.id}`}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <LogOut className="size-5 shrink-0 text-accent" aria-hidden />
                    <div>
                      <p className="font-medium">{b.place_title_ar}</p>
                      <p className="text-sm text-muted-foreground">
                        انتهى {formatTime(b.booking_end)} — المكان ما زال محجوبًا
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="accent" asChild>
                    <Link href={`/host/bookings/${b.id}`}>تسجيل الخروج</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">الحجوزات القادمة</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/host/bookings">{ar.common.showAll}</Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState title="لا توجد حجوزات قادمة" />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((b) =>
              b.customer_id === "" ? (
                <Card key={b.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{b.place_title_ar}</p>
                      <p className="text-sm text-muted-foreground">حجب صيانة</p>
                    </div>
                    <Badge variant="secondary">محجوب</Badge>
                  </CardContent>
                </Card>
              ) : (
                <BookingRow key={b.id} booking={b} href={`/host/bookings/${b.id}`} />
              ),
            )}
          </div>
        )}
      </section>
    </>
  );
}
