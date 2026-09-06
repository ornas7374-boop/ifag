import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { MapView } from "@/components/map/map-view";
import { ar } from "@/content/ar";
import { formatDateTime, formatNumber, formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import type { Halalas } from "@/lib/money";
import type { Order } from "@/types/domain";

/** تفاصيل الطلب — نفس العرض للعميل والمزوّد عدا كتلة العمولة. */
export function OrderDetail({
  order,
  showCommission = false,
}: {
  order: Order;
  showCommission?: boolean;
}) {
  const net = (order.total_amount - order.commission_amount) as Halalas;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{ar.order.items}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-medium">{item.service_title_ar}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(item.quantity)} ×{" "}
                      {formatSAR(item.unit_price)}{" "}
                      {priceUnitLabel(item.pricing_mode)}
                    </p>
                    {item.service_at ? (
                      <p className="text-xs text-muted-foreground">
                        {ar.order.serviceTime}: {formatDateTime(item.service_at)}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-semibold">
                    {formatSAR(item.line_total)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {order.delivery_address ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {ar.order.deliveryLocation}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{order.delivery_address.address_text}</p>
              {order.delivery_address.notes ? (
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address.notes}
                </p>
              ) : null}
              <MapView
                center={order.delivery_address.location}
                label={order.delivery_address.label_ar ?? undefined}
                className="min-h-48"
              />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{ar.order.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar.order.servicesTotal}</span>
            <span>{formatSAR(order.services_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar.listing.deliveryFee}</span>
            <span>
              {order.delivery_fee > 0
                ? formatSAR(order.delivery_fee)
                : ar.listing.freeDelivery}
            </span>
          </div>
          {order.discount_amount > 0 ? (
            <div className="flex justify-between text-success">
              <span>{ar.booking.discount}</span>
              <span>- {formatSAR(order.discount_amount)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>{ar.order.grandTotal}</span>
            <span>{formatSAR(order.total_amount)}</span>
          </div>

          {showCommission ? (
            <>
              <Separator />
              <div className="flex justify-between text-muted-foreground">
                <span>{ar.booking.commission}</span>
                <span>- {formatSAR(order.commission_amount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{ar.booking.netEarnings}</span>
                <span>{formatSAR(net)}</span>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
