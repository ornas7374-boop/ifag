import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.footer.privacy };

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.footer.privacy}  />
      <SectionPlaceholder title={ar.footer.privacy} />
    </PageShell>
  );
}
