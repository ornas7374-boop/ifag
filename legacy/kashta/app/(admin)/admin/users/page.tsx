import { PageHeader } from "@/components/layout/page-shell";
import { DataTable, Td } from "@/components/domain/data-table";
import { StatCard } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { formatNumber } from "@/lib/format";
import { listProfiles } from "@/lib/data";
import type { Role } from "@/types/domain";

export const metadata = { title: ar.admin.users };

const ROLE: Record<Role, { label: string; variant: "default" | "accent" | "secondary" }> = {
  customer: { label: "عميل", variant: "secondary" },
  host: { label: "مزوّد", variant: "default" },
  admin: { label: "إدارة", variant: "accent" },
};

export default async function Page() {
  const profiles = await listProfiles();
  const byRole = (r: Role) => profiles.filter((p) => p.role === r).length;

  return (
    <>
      <PageHeader title={ar.admin.users} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="العملاء" value={formatNumber(byRole("customer"))} />
        <StatCard label="المزوّدون" value={formatNumber(byRole("host"))} />
        <StatCard label="الإدارة" value={formatNumber(byRole("admin"))} />
      </div>

      <DataTable headers={["الاسم", "الدور", "الجوال", "إجراء"]}>
        {profiles.map((p) => (
          <tr key={p.id}>
            <Td className="font-medium">{p.full_name}</Td>
            <Td><Badge variant={ROLE[p.role].variant}>{ROLE[p.role].label}</Badge></Td>
            <Td dir="ltr" className="font-mono text-xs">{p.phone ?? "—"}</Td>
            <Td>
              <Button size="sm" variant="ghost" className="text-destructive">
                تعطيل
              </Button>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
