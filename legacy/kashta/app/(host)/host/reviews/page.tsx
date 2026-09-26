import { PageHeader } from "@/components/layout/page-shell";
import { RatingStars } from "@/components/domain/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { StatCard } from "@/components/layout/dashboard-shell";
import { ar } from "@/content/ar";
import { formatDate, formatNumber } from "@/lib/format";
import { listReviews } from "@/lib/data";

export const metadata = { title: ar.host.reviews };

export default async function Page() {
  const reviews = await listReviews();

  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const fiveStar = reviews.filter((r) => r.rating === 5).length;

  return (
    <>
      <PageHeader title={ar.host.reviews} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="متوسط التقييم" value={average.toFixed(1)} />
        <StatCard label="عدد التقييمات" value={formatNumber(reviews.length)} />
        <StatCard label="تقييمات 5 نجوم" value={formatNumber(fiveStar)} />
      </div>

      {reviews.length === 0 ? (
        <EmptyState title={ar.listing.noReviews} />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">{r.author_name}</p>
                    <div className="flex items-center gap-3">
                      <RatingStars rating={r.rating} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{r.body_ar}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
