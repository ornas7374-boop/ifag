import { Suspense } from "react";

import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { SearchBar } from "@/components/domain/search-bar";
import { FilterSheet, FilterSidebar } from "@/components/domain/filter-panel";
import { ListingGrid } from "@/components/domain/listing-card";
import { ListingGridSkeleton } from "@/components/states/listing-card-skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ar } from "@/content/ar";
import { formatNumber } from "@/lib/format";
import {
  listAmenities,
  listCities,
  listPlaces,
  listServices,
  type ListingFilters,
} from "@/lib/data";
import { placeToCard, serviceToCard } from "@/lib/adapters";

export const metadata = { title: ar.search.title };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** يترجم معاملات الـ URL إلى نفس كائن الفلاتر الذي ستستخدمه المرحلة 2. */
async function buildFilters(params: SearchParams): Promise<ListingFilters> {
  const citySlug = first(params.city);
  const cities = await listCities();
  const city = citySlug ? cities.find((c) => c.slug === citySlug) : undefined;

  const sort = first(params.sort) as ListingFilters["sort"] | undefined;
  const minPrice = first(params.minPrice);
  const maxPrice = first(params.maxPrice);

  const minRating = first(params.minRating);
  const amenityIds = first(params.amenities)?.split(",").filter(Boolean);

  return {
    cityId: city?.id,
    query: first(params.q) || undefined,
    sort: sort ?? "recommended",
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    amenityIds: amenityIds?.length ? amenityIds : undefined,
  };
}

async function Results({ params }: { params: SearchParams }) {
  const filters = await buildFilters(params);
  const kind = first(params.kind) ?? "place";

  // نحوّل كل فرع إلى ListingCardData داخل الفرع نفسه، فيبقى النوع دقيقًا
  const { items, count } =
    kind === "service"
      ? await listServices(filters).then((r) => ({
          items: r.data.map(serviceToCard),
          count: r.count,
        }))
      : await listPlaces(filters).then((r) => ({
          items: r.data.map(placeToCard),
          count: r.count,
        }));

  if (count === 0) {
    return (
      <EmptyState
        title={ar.search.noResults}
        hint={ar.search.noResultsHint}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {formatNumber(count)} {ar.search.resultsCount}
      </p>
      <ListingGrid items={items} />
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  // في Next 16 صارت searchParams وعدًا (Promise) — لا بد من await
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const kind = first(params.kind) ?? "place";
  const amenities = await listAmenities();

  return (
    <PageShell>
      <PageHeader title={ar.search.title} />

      <div className="mb-6">
        <SearchBar />
      </div>

      <Tabs value={kind} className="mb-6">
        <TabsList>
          <TabsTrigger value="place" asChild>
            <a href="/search?kind=place">{ar.nav.places}</a>
          </TabsTrigger>
          <TabsTrigger value="service" asChild>
            <a href="/search?kind=service">{ar.nav.services}</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-6">
        <FilterSidebar amenities={amenities} />

        <div className="min-w-0 flex-1 space-y-4">
          <FilterSheet amenities={amenities} />
          <Suspense fallback={<ListingGridSkeleton />}>
            <Results params={params} />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
