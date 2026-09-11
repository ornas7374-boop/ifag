import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ar } from "@/content/ar";
import { requireRole } from "@/lib/supabase/require-role";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole(["host", "admin"]);

  return (
    <DashboardShell role="host" title={ar.host.title}>
      {children}
    </DashboardShell>
  );
}
