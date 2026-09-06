import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.footer.terms };

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.footer.terms}  />
      <SectionPlaceholder title={ar.footer.terms} />
    </PageShell>
  );
}
