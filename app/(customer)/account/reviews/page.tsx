import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.account.reviews };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.account.reviews} />
      <SectionPlaceholder title={ar.account.reviews} />
    </>
  );
}
