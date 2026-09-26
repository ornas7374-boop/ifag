import { PageHeader } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { BookingStatusBadge } from "@/components/domain/status-badge";
import { ar } from "@/content/ar";
import { formatDate, formatDateRange, formatTime } from "@/lib/format";
import { listCalendar } from "@/lib/data";

export const metadata = { title: ar.host.calendar };

export default async function Page() {
  const entries = await listCalendar("u-host-1");

  // التجميع باليوم — عرض زمني مسطّح أوضح من شبكة شهرية على الجوال
  const byDay = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = formatDate(entry.booking_start);
    byDay.set(key, [...(byDay.get(key) ?? []), entry]);
  }

  return (
    <>
      <PageHeader
        title={ar.host.calendar}
        description="الأوقات المحجوزة تشمل مدة التجهيز بعد كل حجز."
      />

      {entries.length === 0 ? (
        <EmptyState title="لا توجد حجوزات في التقويم" />
      ) : (
        <div className="space-y-6">
          {[...byDay.entries()].map(([day, dayEntries]) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                {day}
              </h2>
              <div className="space-y-3">
                {dayEntries.map((entry) => {
                  const blockedUntil = entry.available_again_at ?? entry.booking_end;
                  const hasBuffer =
                    new Date(blockedUntil).getTime() !==
                    new Date(entry.booking_end).getTime();

                  return (
                    <Card key={entry.id}>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{entry.place_title_ar}</p>
                          <div className="flex gap-2">
                            {entry.source === "host_block" ? (
                              <Badge variant="secondary">حجب صيانة</Badge>
                            ) : null}
                            <BookingStatusBadge status={entry.status} />
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {formatDateRange(entry.booking_start, entry.booking_end)}
                        </p>

                        {hasBuffer ? (
                          <p className="text-xs text-accent">
                            محجوب حتى {formatTime(blockedUntil)}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
