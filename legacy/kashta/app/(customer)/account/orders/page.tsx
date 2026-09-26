import { PageHeader } from "@/components/layout/page-shell";
import { OrderRow } from "@/components/domain/order-row";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { listOrders } from "@/lib/data";

export const metadata = { title: ar.account.orders };

export default async function Page() {
  const orders = await listOrders({ as: "customer" });

  return (
    <>
      <PageHeader title={ar.account.orders} />
      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات" />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} href={`/account/orders/${o.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
