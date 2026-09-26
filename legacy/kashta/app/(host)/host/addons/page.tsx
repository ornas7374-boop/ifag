import { PageHeader } from "@/components/layout/page-shell";
import { AddonsManager } from "@/components/forms/addons-manager";
import { ar } from "@/content/ar";
import { listAddonsForPlace } from "@/lib/data";

export const metadata = { title: ar.host.addons };

export default async function Page() {
  const addons = await listAddonsForPlace("p-1");

  return (
    <>
      <PageHeader
        title={ar.host.addons}
        description="تُعرض للعميل أثناء الحجز وتُضاف تلقائيًا إلى السعر النهائي."
      />
      <AddonsManager initial={addons} />
    </>
  );
}
