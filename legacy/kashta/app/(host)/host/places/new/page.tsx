import { PageHeader } from "@/components/layout/page-shell";
import { PlaceForm } from "@/components/forms/place-form";
import { ar } from "@/content/ar";
import { listAmenities, listCities } from "@/lib/data";

export const metadata = { title: ar.host.addPlace };

export default async function Page() {
  const [cities, amenities] = await Promise.all([listCities(), listAmenities()]);

  return (
    <>
      <PageHeader
        title={ar.host.addPlace}
        description="بعد الإرسال يصبح المكان قيد المراجعة ولا يظهر للعامة حتى تقبله الإدارة."
      />
      <PlaceForm cities={cities} amenities={amenities} />
    </>
  );
}
