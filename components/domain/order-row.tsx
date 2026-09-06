import Link from "next/link";
import { MapPin, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { formatDateTime, formatNumber, formatSAR } from "@/lib/format";
import type { Order } from "@/types/domain";

export function OrderRow({ order, href }: { order: Order; href: string }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Link href={href} className="font-semibold text-foreground hover:underline">
              {order.items[0]?.service_title_ar ?? "طلب"}
              {order.items.length > 1 ? ` + ${formatNumber(order.items.length - 1)}` : ""}
            </Link>
            <p className="font-mono text-xs text-muted-foreground" dir="ltr">
              {order.reference}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Package className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <dd>{formatNumber(itemCount)} قطعة</dd>
          </div>
          {order.delivery_address ? (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <dd className="truncate">{order.delivery_address.address_text}</dd>
            </div>
          ) : null}
          <div className="sm:text-end">
            <dd className="font-bold">{formatSAR(order.total_amount)}</dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
      </CardContent>
    </Card>
  );
}
