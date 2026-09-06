import { PageHeader } from "@/components/layout/page-shell";
import { FavoritesList } from "@/components/domain/favorites-list";
import { ar } from "@/content/ar";
import { listPlaces, listServices } from "@/lib/data";
import { placeToCard, serviceToCard } from "@/lib/adapters";

export const metadata = { title: ar.account.favorites };

export default async function Page() {
  const [places, services] = await Promise.all([listPlaces(), listServices()]);
  const all = [
    ...places.data.map(placeToCard),
    ...services.data.map(serviceToCard),
  ];

  return (
    <>
      <PageHeader title={ar.account.favorites} />
      <FavoritesList all={all} />
    </>
  );
}
