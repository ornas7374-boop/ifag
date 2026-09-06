import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.account.upcomingBookings };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.account.upcomingBookings} />
      <SectionPlaceholder title={ar.account.upcomingBookings} />
    </>
  );
}
