import { notFound } from "next/navigation";

import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { ListingGrid } from "@/components/domain/listing-card";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { listCategories, listPlaces, listServices } from "@/lib/data";
import { placeToCard, serviceToCard } from "@/lib/adapters";

/** التصنيفات المرتبطة بالخدمات بدل الأماكن. */
const SERVICE_CATEGORIES = new Set([
  "tents",
  "majlis",
  "tables",
  "hospitality",
  "setup",
  "equipment",
]);

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const isService = SERVICE_CATEGORIES.has(slug);
  const items = isService
    ? await listServices({ limit: 12 }).then((r) => r.data.map(serviceToCard))
    : await listPlaces({ limit: 12 }).then((r) => r.data.map(placeToCard));

  return (
    <PageShell>
      <PageHeader title={category.name_ar} />
      {items.length === 0 ? (
        <EmptyState title={ar.search.noResults} hint={ar.search.noResultsHint} />
      ) : (
        <ListingGrid items={items} />
      )}
    </PageShell>
  );
}
