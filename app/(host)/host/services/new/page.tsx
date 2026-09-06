import { PageHeader } from "@/components/layout/page-shell";
import { ServiceForm } from "@/components/forms/service-form";
import { ar } from "@/content/ar";
import { listCities } from "@/lib/data";

export const metadata = { title: ar.host.addService };

export default async function Page() {
  const cities = await listCities();
  return (
    <>
      <PageHeader
        title={ar.host.addService}
        description="بعد الحفظ تُراجع الخدمة من الإدارة قبل ظهورها للعملاء."
      />
      <ServiceForm cities={cities} />
    </>
  );
}
