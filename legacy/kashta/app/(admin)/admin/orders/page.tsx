import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { DataTable, Td } from "@/components/domain/data-table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDateTime, formatNumber, formatSAR } from "@/lib/format";
import { listOrders } from "@/lib/data";

export const metadata = { title: ar.admin.orders };

export default async function Page() {
  const orders = await listOrders({ as: "host" });

  if (orders.length === 0) return <EmptyState title="لا توجد طلبات" />;

  return (
    <>
      <PageHeader title={ar.admin.orders} />
      <DataTable headers={["المرجع", "الخدمات", "موقع التوصيل", "التاريخ", "الحالة", "الدفع", "الإجمالي"]}>
        {orders.map((o) => (
          <tr key={o.id}>
            <Td>
              <Link href={`/host/orders/${o.id}`} className="font-mono text-xs hover:underline" dir="ltr">
                {o.reference}
              </Link>
            </Td>
            <Td className="tabular-nums">{formatNumber(o.items.length)}</Td>
            <Td className="max-w-48 truncate text-xs text-muted-foreground">
              {o.delivery_address?.address_text ?? "—"}
            </Td>
            <Td className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDateTime(o.created_at)}
            </Td>
            <Td><OrderStatusBadge status={o.status} /></Td>
            <Td><PaymentStatusBadge status={o.payment_status} /></Td>
            <Td className="whitespace-nowrap font-medium">{formatSAR(o.total_amount)}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
