import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { StackedBars } from "@/components/charts/stacked-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { halalas } from "@/lib/money";
import { listMonthlyEarnings } from "@/lib/data";

export const metadata = { title: ar.host.earnings };

export default async function Page() {
  const months = await listMonthlyEarnings();

  const gross = halalas(months.reduce((s, m) => s + m.gross, 0));
  const commission = halalas(months.reduce((s, m) => s + m.commission, 0));
  const net = halalas(gross - commission);

  return (
    <>
      <PageHeader
        title={ar.host.earnings}
        description="آخر ستة أشهر، من المدفوعات المكتملة فقط."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي المبيعات" value={formatSAR(gross)} />
        <StatCard label={ar.booking.commission} value={formatSAR(commission)} />
        <StatCard label={ar.booking.netEarnings} value={formatSAR(net)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأرباح شهريًا</CardTitle>
        </CardHeader>
        <CardContent>
          <StackedBars
            data={months.map((m) => ({
              label: m.label,
              primary: halalas(m.net),
              secondary: halalas(m.commission),
            }))}
            primaryLabel={ar.booking.netEarnings}
            secondaryLabel={ar.booking.commission}
          />
        </CardContent>
      </Card>
    </>
  );
}
