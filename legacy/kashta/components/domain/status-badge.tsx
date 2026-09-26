import { Badge } from "@/components/ui/badge";
import { ar } from "@/content/ar";
import type { BookingStatus, OrderStatus, PaymentStatus } from "@/types/domain";

/** خريطة واحدة للحالة → لون، بدل تكرار الشروط في كل شاشة. */
const BOOKING_VARIANT: Record<BookingStatus, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  checked_in: "success",
  checked_out: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

const ORDER_VARIANT: Record<OrderStatus, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  preparing: "warning",
  out_for_delivery: "default",
  delivered: "success",
  completed: "secondary",
  cancelled: "destructive",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={BOOKING_VARIANT[status]}>{ar.booking.statuses[status]}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_VARIANT[status]}>{ar.order.statuses[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const labels: Record<PaymentStatus, string> = {
    unpaid: "غير مدفوع",
    paid: "مدفوع",
    failed: "فشل الدفع",
    refunded: "مسترجع",
  };
  const variants: Record<PaymentStatus, "success" | "warning" | "destructive" | "secondary"> = {
    unpaid: "warning",
    paid: "success",
    failed: "destructive",
    refunded: "secondary",
  };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
