import { PageHeader } from "@/components/layout/page-shell";
import { RatingStars } from "@/components/domain/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDate } from "@/lib/format";
import { listReviews } from "@/lib/data";

export const metadata = { title: ar.account.reviews };

export default async function Page() {
  const reviews = await listReviews();

  return (
    <>
      <PageHeader title={ar.account.reviews} />

      {reviews.length === 0 ? (
        <EmptyState
          title="لم تكتب أي تقييم بعد"
          hint="يمكنك تقييم الأماكن والخدمات بعد انتهاء الحجز أو الطلب."
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <RatingStars rating={r.rating} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.created_at)}
                    </span>
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
