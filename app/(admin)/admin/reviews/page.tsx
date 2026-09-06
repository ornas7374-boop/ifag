import { PageHeader } from "@/components/layout/page-shell";
import { RatingStars } from "@/components/domain/rating-stars";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDate } from "@/lib/format";
import { listReviews } from "@/lib/data";

export const metadata = { title: ar.admin.reviews };

export default async function Page() {
  const reviews = await listReviews();

  return (
    <>
      <PageHeader
        title={ar.admin.reviews}
        description="الإخفاء لا يحذف التقييم — يبقى مرئيًا لكاتبه وللإدارة."
      />

      {reviews.length === 0 ? (
        <EmptyState title={ar.listing.noReviews} />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{r.author_name}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.created_at)}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">{r.body_ar}</p>

                  <Button size="sm" variant="ghost" className="text-destructive">
                    إخفاء التقييم
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
