import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR } from "@/lib/format";
import { halalas } from "@/lib/money";
import {
  listBookings,
  listOrders,
  listPayments,
  listPlaces,
  listProfiles,
  listServices,
} from "@/lib/data";

export const metadata = { title: ar.admin.title };

export default async function Page() {
  const [profiles, places, services, bookings, orders, payments] =
    await Promise.all([
      listProfiles(),
      listPlaces(),
      listServices(),
      listBookings({ as: "host", when: "all", includeBlocks: false }),
      listOrders({ as: "host" }),
      listPayments(),
    ]);

  // المبيعات من المدفوعات الناجحة فقط — المسترجع ليس إيرادًا
  const settled = payments.filter((p) => p.status === "paid");
  const sales = halalas(settled.reduce((s, p) => s + p.amount, 0));
  const commission = halalas(settled.reduce((s, p) => s + p.commission, 0));

  const hosts = profiles.filter((p) => p.role === "host").length;
  const customers = profiles.filter((p) => p.role === "customer").length;
  const pendingPlaces = places.data.filter((p) => p.status === "pending").length;

  const quickLinks = [
    { href: "/admin/places", label: ar.admin.places, value: places.count },
    { href: "/admin/services", label: ar.admin.services, value: services.count },
    { href: "/admin/bookings", label: ar.admin.bookings, value: bookings.length },
    { href: "/admin/orders", label: ar.admin.orders, value: orders.length },
  ];

  return (
    <>
      <PageHeader title={ar.admin.title} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={ar.admin.totalUsers}
          value={formatNumber(profiles.length)}
          hint={`${formatNumber(customers)} عميل · ${formatNumber(hosts)} مزوّد`}
        />
        <StatCard label={ar.admin.totalSales} value={formatSAR(sales)} />
        <StatCard
          label={ar.admin.totalCommission}
          value={formatSAR(commission)}
          hint="دخل المنصة"
        />
        <StatCard
          label={ar.admin.pendingReview}
          value={formatNumber(pendingPlaces)}
          hint={pendingPlaces > 0 ? "بانتظار قرارك" : "لا شيء معلّق"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{link.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(link.value)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>آخر المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {payments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm" dir="ltr">{p.reference}</p>
                  <p className="text-xs text-muted-foreground">{p.customer_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.status === "paid" ? "success" : "secondary"}>
                    {p.status === "paid" ? "مدفوع" : "مسترجع"}
                  </Badge>
                  <span className="font-semibold">{formatSAR(p.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" asChild>
            <Link href="/admin/payments">{ar.common.showAll}</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
