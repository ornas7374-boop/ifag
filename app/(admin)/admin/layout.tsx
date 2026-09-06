import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ar } from "@/content/ar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin" title={ar.admin.title}>
      {children}
    </DashboardShell>
  );
}
