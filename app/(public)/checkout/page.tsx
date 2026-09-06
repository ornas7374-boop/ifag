import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { CheckoutFlow } from "@/components/cart/checkout-flow";
import { ar } from "@/content/ar";

export const metadata = { title: ar.order.checkout };

export default function CheckoutPage() {
  return (
    <PageShell>
      <PageHeader title={ar.order.checkout} />
      <CheckoutFlow />
    </PageShell>
  );
}
