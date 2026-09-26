import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { DataTable, Td } from "@/components/domain/data-table";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/domain/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDateRange, formatNumber, formatSAR } from "@/lib/format";
import { listBookings } from "@/lib/data";

export const metadata = { title: ar.admin.bookings };

export default async function Page() {
  const bookings = await listBookings({ as: "host", when: "all", includeBlocks: true });

  if (bookings.length === 0) return <EmptyState title="لا توجد حجوزات" />;

  return (
    <>
      <PageHeader title={ar.admin.bookings} />
      <DataTable
        headers={["المرجع", "المكان", "الفترة", "الأشخاص", "الحالة", "الدفع", "الإجمالي"]}
      >
        {bookings.map((b) => (
          <tr key={b.id}>
            <Td>
              <Link href={`/host/bookings/${b.id}`} className="font-mono text-xs hover:underline" dir="ltr">
                {b.reference}
              </Link>
            </Td>
            <Td>{b.place_title_ar}</Td>
            <Td className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDateRange(b.booking_start, b.booking_end)}
            </Td>
            <Td className="tabular-nums">{formatNumber(b.guests)}</Td>
            <Td><BookingStatusBadge status={b.status} /></Td>
            <Td><PaymentStatusBadge status={b.payment_status} /></Td>
            <Td className="whitespace-nowrap font-medium">{formatSAR(b.total_amount)}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
