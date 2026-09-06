import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.order.checkout };

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.order.checkout}  />
      <SectionPlaceholder title={ar.order.checkout} />
    </PageShell>
  );
}
