import { PageHeader } from "@/components/layout/page-shell";
import { BookingRow } from "@/components/domain/booking-row";
import { EmptyState } from "@/components/states/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ar } from "@/content/ar";
import { listBookings } from "@/lib/data";

export const metadata = { title: ar.account.upcomingBookings };

export default async function Page() {
  const [upcoming, past] = await Promise.all([
    listBookings({ as: "customer", when: "upcoming" }),
    listBookings({ as: "customer", when: "past" }),
  ]);

  return (
    <>
      <PageHeader title={ar.account.upcomingBookings} />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">{ar.account.upcomingBookings}</TabsTrigger>
          <TabsTrigger value="past">{ar.account.pastBookings}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState title="لا توجد حجوزات قادمة" />
          ) : (
            upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} href={`/account/bookings/${b.id}`} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.length === 0 ? (
            <EmptyState title="لا توجد حجوزات سابقة" />
          ) : (
            past.map((b) => (
              <BookingRow key={b.id} booking={b} href={`/account/bookings/${b.id}`} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
