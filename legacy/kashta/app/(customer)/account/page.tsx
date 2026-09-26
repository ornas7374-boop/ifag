import Link from "next/link";
import { CalendarDays, Heart, Package } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { BookingRow } from "@/components/domain/booking-row";
import { OrderRow } from "@/components/domain/order-row";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { formatNumber } from "@/lib/format";
import { listBookings, listNotifications, listOrders } from "@/lib/data";

export const metadata = { title: ar.account.title };

export default async function Page() {
  const [upcoming, orders, notifications] = await Promise.all([
    listBookings({ as: "customer", when: "upcoming" }),
    listOrders({ as: "customer" }),
    listNotifications("u-cust-1"),
  ]);

  // الطلبات التي ما زالت في مسارها التشغيلي — ليست مكتملة ولا ملغاة
  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <PageHeader title={ar.account.title} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={ar.account.upcomingBookings}
          value={formatNumber(upcoming.length)}
        />
        <StatCard label="طلبات نشطة" value={formatNumber(activeOrders.length)} />
        <StatCard
          label={ar.account.notifications}
          value={formatNumber(unread)}
          hint={unread > 0 ? "غير مقروءة" : "لا جديد"}
        />
        <StatCard
          label={ar.account.orders}
          value={formatNumber(orders.length)}
          hint="الإجمالي"
        />
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            {ar.account.upcomingBookings}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/bookings">{ar.common.showAll}</Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="لا توجد حجوزات قادمة"
            action={
              <Button asChild>
                <Link href="/search?kind=place">{ar.nav.places}</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 2).map((b) => (
              <BookingRow key={b.id} booking={b} href={`/account/bookings/${b.id}`} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Package className="size-5 text-primary" aria-hidden />
            طلبات نشطة
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">{ar.common.showAll}</Link>
          </Button>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState
            title="لا توجد طلبات نشطة"
            action={
              <Button variant="outline" asChild>
                <Link href="/account/favorites">
                  <Heart aria-hidden />
                  {ar.account.favorites}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {activeOrders.slice(0, 2).map((o) => (
              <OrderRow key={o.id} order={o} href={`/account/orders/${o.id}`} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
