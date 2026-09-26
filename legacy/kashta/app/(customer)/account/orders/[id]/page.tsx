import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { OrderDetail } from "@/components/domain/order-detail";
import { getOrder } from "@/lib/data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <>
      <PageHeader title={`طلب ${order.reference}`} />
      <OrderDetail order={order} showCommission={false} />
    </>
  );
}
