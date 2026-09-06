import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.admin.payments };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.admin.payments} />
      <SectionPlaceholder title={ar.admin.payments} />
    </>
  );
}
