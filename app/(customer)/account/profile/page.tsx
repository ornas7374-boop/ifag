import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.account.profile };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.account.profile} />
      <SectionPlaceholder title={ar.account.profile} />
    </>
  );
}
