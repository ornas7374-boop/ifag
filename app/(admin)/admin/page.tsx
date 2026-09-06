import { PageHeader } from "@/components/layout/page-shell";
import { StatCard } from "@/components/layout/dashboard-shell";
import { SectionPlaceholder } from "@/components/states/section-placeholder";
import { ar } from "@/content/ar";

export const metadata = { title: ar.admin.title };

export default function Page() {
  return (
    <>
      <PageHeader title={ar.admin.title} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={ar.admin.totalUsers} value="—" />
        <StatCard label={ar.admin.totalSales} value="—" />
        <StatCard label={ar.admin.totalCommission} value="—" />
        <StatCard label={ar.admin.pendingReview} value="—" />
      </div>

      <SectionPlaceholder title={ar.admin.title} />
    </>
  );
}
