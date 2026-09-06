import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.admin.reviews };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.admin.reviews} />
      <SectionPlaceholder title={ar.admin.reviews} />
    </>
  );
}
