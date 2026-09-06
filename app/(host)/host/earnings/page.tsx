import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.host.earnings };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.host.earnings} />
      <SectionPlaceholder title={ar.host.earnings} />
    </>
  );
}
