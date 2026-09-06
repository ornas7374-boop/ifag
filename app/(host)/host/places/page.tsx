import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.host.places };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.host.places} />
      <SectionPlaceholder title={ar.host.places} />
    </>
  );
}
