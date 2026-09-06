import { PageHeader } from "@/components/layout/page-shell";
import { BookingRow } from "@/components/domain/booking-row";
import { EmptyState } from "@/components/states/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ar } from "@/content/ar";
import { listBookings } from "@/lib/data";

export const metadata = { title: ar.host.bookings };

export default async function Page() {
  // includeBlocks: صاحب المكان يرى حجب الصيانة أيضًا، بخلاف العميل
  const [upcoming, past] = await Promise.all([
    listBookings({ as: "host", when: "upcoming", includeBlocks: true }),
    listBookings({ as: "host", when: "past", includeBlocks: true }),
  ]);

  return (
    <>
      <PageHeader title={ar.host.bookings} />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="past">السابقة</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState title="لا توجد حجوزات قادمة" />
          ) : (
            upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} href={`/host/bookings/${b.id}`} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.length === 0 ? (
            <EmptyState title="لا توجد حجوزات سابقة" />
          ) : (
            past.map((b) => (
              <BookingRow key={b.id} booking={b} href={`/host/bookings/${b.id}`} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
