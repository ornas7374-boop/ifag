import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { CartContents } from "@/components/cart/cart-contents";
import { ar } from "@/content/ar";

export const metadata = { title: ar.nav.cart };

export default function CartPage() {
  return (
    <PageShell>
      <PageHeader title={ar.nav.cart} />
      <CartContents />
    </PageShell>
  );
}
