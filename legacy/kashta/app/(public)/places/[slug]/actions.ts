"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { RateUnit } from "@/types/domain";

export interface BookingRequest {
  placeId: string;
  rateUnit: RateUnit;
  /** YYYY-MM-DD */
  date: string;
  duration: number;
  guests: number;
  /** HH:MM — للحجز بالساعة فقط */
  startTime?: string;
  addonIds: string[];
}

export type BookingResult =
  | { ok: true; reference: string; total: number }
  | { ok: false; error: string };

/**
 * ★ لا يمرّر أي مبلغ ★
 *
 * يرسل ما اختاره العميل فقط. دالة create_booking في القاعدة تعيد حساب
 * السعر من places و addons و platform_settings، وقيد الاستبعاد يمنع
 * التداخل ذرّيًا. ما تعرضه الواجهة معاينة، وهذا هو المصدر الموثوق.
 */
export async function submitBooking(req: BookingRequest): Promise<BookingResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_booking", {
    p_place_id: req.placeId,
    p_rate_unit: req.rateUnit,
    p_date: req.date,
    p_duration: req.duration,
    p_guests: req.guests,
    p_start_time: req.startTime ?? null,
    p_addon_ids: req.addonIds,
  });

  if (error) {
    return { ok: false, error: translateBookingError(error.message) };
  }

  revalidatePath("/account/bookings");
  return { ok: true, reference: data.reference, total: data.total_amount };
}

/**
 * الدالة ترفع رموزًا ثابتة لا جملًا — حتى تبقى الترجمة هنا في طبقة
 * العرض، ولا تتغيّر رسائل القاعدة بتغيّر لغة الواجهة.
 */
function translateBookingError(message: string): string {
  const codes: Record<string, string> = {
    AUTH_REQUIRED: "سجّل الدخول أولًا لإتمام الحجز.",
    SLOT_TAKEN: "هذا الموعد حُجز للتو. اختر وقتًا آخر.",
    PLACE_UNAVAILABLE: "هذا المكان غير متاح للحجز حاليًا.",
    GUESTS_OUT_OF_RANGE: "عدد الأشخاص خارج السعة المسموحة لهذا المكان.",
    PAST_DATE: "لا يمكن الحجز في تاريخ مضى.",
    INVALID_DURATION: "المدة غير صالحة.",
    INVALID_WINDOW: "الفترة المحددة غير صالحة.",
    RATE_UNIT_UNAVAILABLE: "نوع الحجز هذا غير متاح لهذا المكان.",
  };

  for (const [code, text] of Object.entries(codes)) {
    if (message.includes(code)) return text;
  }
  return "تعذّر إتمام الحجز. حاول مرة أخرى.";
}
