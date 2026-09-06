import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.nav.cart };

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.nav.cart} description={ar.order.emptyCartHint} />
      <SectionPlaceholder title={ar.nav.cart} />
    </PageShell>
  );
}
