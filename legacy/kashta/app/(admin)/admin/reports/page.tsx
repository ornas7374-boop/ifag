import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { StackedBars } from "@/components/charts/stacked-bars";
import { DataTable, Td } from "@/components/domain/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR } from "@/lib/format";
import { halalas } from "@/lib/money";
import { listBookings, listMonthlyEarnings, listOrders, listPlaces } from "@/lib/data";

export const metadata = { title: ar.admin.reports };

export default async function Page() {
  const [months, bookings, orders, places] = await Promise.all([
    listMonthlyEarnings(),
    listBookings({ as: "host", when: "all" }),
    listOrders({ as: "host" }),
    listPlaces(),
  ]);

  const gross = halalas(months.reduce((s, m) => s + m.gross, 0));
  const commission = halalas(months.reduce((s, m) => s + m.commission, 0));

  // أكثر المدن نشاطًا حسب عدد الأماكن المنشورة فيها
  const byCity = new Map<string, number>();
  for (const p of places.data) {
    byCity.set(p.city_name_ar, (byCity.get(p.city_name_ar) ?? 0) + 1);
  }
  const cities = [...byCity.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title={ar.admin.reports} description="آخر ستة أشهر." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المبيعات" value={formatSAR(gross)} />
        <StatCard label="إجمالي العمولات" value={formatSAR(commission)} />
        <StatCard label={ar.admin.bookings} value={formatNumber(bookings.length)} />
        <StatCard label={ar.admin.orders} value={formatNumber(orders.length)} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الإيرادات والعمولات شهريًا</CardTitle>
        </CardHeader>
        <CardContent>
          <StackedBars
            data={months.map((m) => ({
              label: m.label,
              primary: halalas(m.net),
              secondary: halalas(m.commission),
            }))}
            primaryLabel="صافي المزوّدين"
            secondaryLabel={ar.admin.totalCommission}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>النشاط حسب المدينة</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable headers={["المدينة", "عدد الأماكن"]}>
            {cities.map(([city, count]) => (
              <tr key={city}>
                <Td className="font-medium">{city}</Td>
                <Td className="tabular-nums">{formatNumber(count)}</Td>
              </tr>
            ))}
          </DataTable>
        </CardContent>
      </Card>
    </>
  );
}
