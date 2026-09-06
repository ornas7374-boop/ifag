import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.account.title };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.account.title} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={ar.account.upcomingBookings} value="—" />
        <StatCard label={ar.account.orders} value="—" />
        <StatCard label={ar.account.favorites} value="—" />
        <StatCard label={ar.account.reviews} value="—" />
      </div>

      <SectionPlaceholder title={ar.account.title} />
    </>
  );
}
