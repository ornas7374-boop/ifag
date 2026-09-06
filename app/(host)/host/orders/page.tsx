import { PageHeader } from "@/components/layout/page-shell";
import { OrderRow } from "@/components/domain/order-row";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { listOrders } from "@/lib/data";

export const metadata = { title: ar.host.orders };

export default async function Page() {
  const orders = await listOrders({ as: "host" });

  return (
    <>
      <PageHeader title={ar.host.orders} />
      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات" />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} href={`/host/orders/${o.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
