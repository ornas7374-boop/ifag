import { PageHeader } from "@/components/layout/page-shell";
import { DataTable, Td } from "@/components/domain/data-table";
import { StatCard } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { ar } from "@/content/ar";
import { formatDateTime, formatSAR } from "@/lib/format";
import { halalas } from "@/lib/money";
import { listPayments } from "@/lib/data";

export const metadata = { title: ar.admin.payments };

export default async function Page() {
  const payments = await listPayments();

  const settled = payments.filter((p) => p.status === "paid");
  const gross = halalas(settled.reduce((s, p) => s + p.amount, 0));
  const commission = halalas(settled.reduce((s, p) => s + p.commission, 0));
  const refunded = halalas(
    payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0),
  );

  return (
    <>
      <PageHeader
        title={ar.admin.payments}
        description="لا تُخزَّن بيانات البطاقات — فقط معرّف العملية لدى بوابة الدفع."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="المحصَّل" value={formatSAR(gross)} />
        <StatCard label="عمولة المنصة" value={formatSAR(commission)} />
        <StatCard label="المسترجع" value={formatSAR(refunded)} />
      </div>

      <DataTable headers={["المرجع", "النوع", "العميل", "البوابة", "التاريخ", "الحالة", "المبلغ", "العمولة"]}>
        {payments.map((p) => (
          <tr key={p.id}>
            <Td dir="ltr" className="font-mono text-xs">{p.reference}</Td>
            <Td>{p.kind === "booking" ? "حجز" : "طلب"}</Td>
            <Td>{p.customer_name}</Td>
            <Td dir="ltr" className="text-xs">{p.provider}</Td>
            <Td className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDateTime(p.created_at)}
            </Td>
            <Td>
              <Badge variant={p.status === "paid" ? "success" : "secondary"}>
                {p.status === "paid" ? "مدفوع" : "مسترجع"}
              </Badge>
            </Td>
            <Td className="whitespace-nowrap font-medium">{formatSAR(p.amount)}</Td>
            <Td className="whitespace-nowrap text-muted-foreground">{formatSAR(p.commission)}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
