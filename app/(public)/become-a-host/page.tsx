import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.nav.becomeHost };

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.nav.becomeHost}  />
      <SectionPlaceholder title={ar.nav.becomeHost} />
    </PageShell>
  );
}
