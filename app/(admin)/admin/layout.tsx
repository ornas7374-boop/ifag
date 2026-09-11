import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ar } from "@/content/ar";
import { requireRole } from "@/lib/supabase/require-role";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);

  return (
    <DashboardShell role="admin" title={ar.admin.title}>
      {children}
    </DashboardShell>
  );
}
