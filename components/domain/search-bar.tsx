import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ar } from "@/content/ar";
import { listCities } from "@/lib/data";

/**
 * نموذج GET بسيط يوجّه إلى /search — يعمل بدون JavaScript،
 * والفلاتر تعيش في الـ URL فتصبح قابلة للمشاركة والحفظ.
 */
export async function SearchBar() {
  const cities = await listCities();

  return (
    <form
      action="/search"
      method="get"
      className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
    >
      <div className="space-y-1.5">
        <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
          {ar.common.search}
        </label>
        <Input id="q" name="q" placeholder={ar.common.searchPlaceholder} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="city" className="text-xs font-medium text-muted-foreground">
          {ar.common.city}
        </label>
        <select
          id="city"
          name="city"
          className="h-11 w-full cursor-pointer rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <option value="">كل المدن</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name_ar}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="guests" className="text-xs font-medium text-muted-foreground">
          {ar.common.guests}
        </label>
        <Input id="guests" name="guests" type="number" min={1} defaultValue={4} />
      </div>

      <div className="flex items-end">
        <Button type="submit" size="lg" className="w-full lg:w-auto">
          <Search aria-hidden />
          {ar.common.search}
        </Button>
      </div>
    </form>
  );
}
