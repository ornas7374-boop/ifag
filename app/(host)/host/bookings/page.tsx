import { PageHeader } from "@/components/layout/page-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.host.bookings };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.host.bookings} />
      <SectionPlaceholder title={ar.host.bookings} />
    </>
  );
}
