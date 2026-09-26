import Link from "next/link";
import { Suspense } from "react";

import { PageShell, SectionHeader } from "@/components/layout/page-shell";
import { SearchBar } from "@/components/domain/search-bar";
import { ListingGrid } from "@/components/domain/listing-card";
import { ListingGridSkeleton } from "@/components/states/listing-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { ar } from "@/content/ar";
import { listCategories, listPlaces, listServices } from "@/lib/data";
import { placeToCard, serviceToCard } from "@/lib/adapters";

async function FeaturedPlaces() {
  const { data } = await listPlaces({ sort: "rating", limit: 4 });
  return <ListingGrid items={data.map(placeToCard)} />;
}

async function NewestPlaces() {
  const { data } = await listPlaces({ sort: "newest", limit: 4 });
  return <ListingGrid items={data.map(placeToCard)} />;
}

async function FeaturedServices() {
  const { data } = await listServices({ sort: "rating", limit: 4 });
  return <ListingGrid items={data.map(serviceToCard)} />;
}

async function CategoryPills() {
  const categories = await listCategories();
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.slug}`}>
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-secondary"
          >
            {category.name_ar}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <PageShell>
        <section className="mb-10 space-y-5">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {ar.home.heroTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              {ar.home.heroSubtitle}
            </p>
          </div>

          <Suspense fallback={<div className="h-32 rounded-xl bg-muted" />}>
            <SearchBar />
          </Suspense>
        </section>

        <section className="mb-10">
          <SectionHeader title={ar.home.categories} />
          <Suspense fallback={<div className="h-10 rounded-md bg-muted" />}>
            <CategoryPills />
          </Suspense>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={ar.home.topRated}
            href="/search?kind=place&sort=rating"
            linkLabel={ar.common.showAll}
          />
          <Suspense fallback={<ListingGridSkeleton />}>
            <FeaturedPlaces />
          </Suspense>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={ar.home.newest}
            href="/search?kind=place&sort=newest"
            linkLabel={ar.common.showAll}
          />
          <Suspense fallback={<ListingGridSkeleton />}>
            <NewestPlaces />
          </Suspense>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={ar.home.featuredServices}
            href="/search?kind=service"
            linkLabel={ar.common.showAll}
          />
          <Suspense fallback={<ListingGridSkeleton />}>
            <FeaturedServices />
          </Suspense>
        </section>
      </PageShell>

    </>
  );
}
