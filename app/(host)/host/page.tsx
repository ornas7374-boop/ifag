import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.host.title };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.host.title} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={ar.host.totalBookings} value="—" />
        <StatCard label={ar.host.totalOrders} value="—" />
        <StatCard label={ar.host.totalEarnings} value="—" />
        <StatCard label={ar.host.views} value="—" />
      </div>

      <SectionPlaceholder title={ar.host.title} />
    </>
  );
}
