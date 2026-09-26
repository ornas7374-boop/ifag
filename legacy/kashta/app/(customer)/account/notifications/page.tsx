import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listNotifications } from "@/lib/data";

export const metadata = { title: ar.account.notifications };

export default async function Page() {
  const notifications = await listNotifications("u-cust-1");

  return (
    <>
      <PageHeader title={ar.account.notifications} />

      {notifications.length === 0 ? (
        <EmptyState title="لا توجد إشعارات" />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const body = (
              <CardContent className="space-y-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">{n.title_ar}</p>
                  {/* النقطة ليست الدليل الوحيد: النص الأثقل يميّز غير المقروء أيضًا */}
                  {!n.is_read ? (
                    <span
                      className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                      aria-label="غير مقروء"
                    />
                  ) : null}
                </div>
                {n.body_ar ? (
                  <p className="text-sm text-muted-foreground">{n.body_ar}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(n.created_at)}
                </p>
              </CardContent>
            );

            return (
              <li key={n.id}>
                <Card className={cn(!n.is_read && "border-primary/30 bg-primary/5")}>
                  {n.link ? <Link href={n.link}>{body}</Link> : body}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
