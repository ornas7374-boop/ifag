"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sarToHalalas } from "@/lib/money";
import { randomSlug } from "@/lib/slug";
import type {
  DeliveryFeeStrategy,
  PlaceKind,
  PricingMode,
  ServiceKind,
} from "@/types/domain";

export type FormResult = { ok: true; slug: string } | { ok: false; error: string } | null;

/** ريال نصّي من نموذج ⇒ هللة، أو null إن تُرك فارغًا. */
function money(form: FormData, key: string): number | null {
  const raw = String(form.get(key) ?? "").trim();
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return sarToHalalas(n);
}

function int(form: FormData, key: string, fallback: number): number {
  const n = Number(String(form.get(key) ?? ""));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/**
 * إضافة مكان.
 *
 * ★ إدخال مباشر لا دالة خادم ★
 * بخلاف الحجز، المضيف هنا يحدد أسعاره بنفسه وهذا حقّه — فلا شيء
 * يُزوَّر. سياسة "host inserts own places" في 0012 تفرض أصلًا
 * `host_id = auth.uid()` و`auth_role() = 'host'`، فالقاعدة ترفض
 * أي محاولة لإدخال مكان باسم مضيف آخر.
 *
 * الحالة `pending` لا `published`: كل إعلان يمرّ على مراجعة الإدارة.
 */
export async function createPlace(_prev: FormResult, form: FormData): Promise<FormResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "سجّل الدخول كمقدّم خدمة أولًا." };

  const title = text(form, "title");
  if (!title) return { ok: false, error: "اسم المكان مطلوب." };

  const perHour = money(form, "price_per_hour");
  const perDay = money(form, "price_per_day");
  const perNight = money(form, "price_per_night");
  if (perHour === null && perDay === null && perNight === null) {
    return { ok: false, error: "حدّد سعرًا واحدًا على الأقل." };
  }

  const lat = Number(form.get("latitude"));
  const lng = Number(form.get("longitude"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "حدّد موقع المكان على الخريطة." };
  }

  const capMin = int(form, "capacity_min", 1);
  const capMax = int(form, "capacity_max", 1);
  if (capMax < capMin || capMin < 1) {
    return { ok: false, error: "نطاق السعة غير صالح." };
  }

  const slug = randomSlug("p");
  const { data, error } = await supabase
    .from("places")
    .insert({
      slug,
      host_id: user.id,
      title_ar: title,
      description_ar: text(form, "description"),
      place_kind: text(form, "place_kind") as PlaceKind,
      status: "pending",
      city_id: text(form, "city_id"),
      latitude: lat,
      longitude: lng,
      capacity_min: capMin,
      capacity_max: capMax,
      check_in_time: text(form, "check_in_time") || "16:00",
      check_out_time: text(form, "check_out_time") || "12:00",
      turnaround_minutes: int(form, "turnaround_minutes", 0),
      price_per_hour: perHour,
      price_per_day: perDay,
      price_per_night: perNight,
      cancellation_policy_ar: text(form, "cancellation_policy"),
      rules_ar: text(form, "rules") || null,
    })
    .select("id, slug")
    .single();

  if (error) return { ok: false, error: translate(error.message) };

  const amenityIds = form.getAll("amenities").map(String).filter(Boolean);
  if (amenityIds.length > 0) {
    await supabase
      .from("place_amenities")
      .insert(amenityIds.map((amenity_id) => ({ place_id: data.id, amenity_id })));
  }

  revalidatePath("/host/places");
  return { ok: true, slug: data.slug };
}

/** إضافة خدمة متنقلة. نفس المنطق — سياسة RLS تفرض ملكية المضيف. */
export async function createService(
  _prev: FormResult,
  form: FormData,
): Promise<FormResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "سجّل الدخول كمقدّم خدمة أولًا." };

  const title = text(form, "title");
  if (!title) return { ok: false, error: "اسم الخدمة مطلوب." };

  const price = money(form, "price");
  if (price === null) return { ok: false, error: "حدّد سعر الخدمة." };

  const requiresDelivery = form.get("requires_delivery") === "on";
  const strategy = (requiresDelivery
    ? (text(form, "delivery_strategy") as DeliveryFeeStrategy)
    : "free") as DeliveryFeeStrategy;
  const fee = money(form, "delivery_fee") ?? 0;

  // قيد services_fee_matches_strategy يرفض استراتيجية غير مجانية برسوم
  // صفر. نمسك ذلك هنا برسالة مفهومة بدل خطأ قاعدة خام.
  if (strategy !== "free" && fee <= 0) {
    return { ok: false, error: "حدّد رسوم توصيل أكبر من صفر، أو اختر توصيلًا مجانيًا." };
  }

  const slug = randomSlug("s");
  const { data, error } = await supabase
    .from("services")
    .insert({
      slug,
      host_id: user.id,
      title_ar: title,
      description_ar: text(form, "description"),
      service_kind: text(form, "service_kind") as ServiceKind,
      status: "pending",
      city_id: text(form, "city_id"),
      price,
      pricing_mode: text(form, "pricing_mode") as PricingMode,
      min_quantity: int(form, "min_quantity", 1),
      unit_label_ar: text(form, "unit_label") || "وحدة",
      requires_delivery: requiresDelivery,
      delivery_strategy: strategy,
      delivery_fee: fee,
      free_delivery_over: money(form, "free_delivery_over"),
      max_distance_km: Number(form.get("max_distance_km")) || null,
    })
    .select("slug")
    .single();

  if (error) return { ok: false, error: translate(error.message) };

  revalidatePath("/host/services");
  return { ok: true, slug: data.slug };
}

function translate(message: string): string {
  if (message.includes("row-level security")) {
    return "حسابك ليس حساب مقدّم خدمة. غيّر نوع الحساب أو أنشئ حسابًا جديدًا.";
  }
  if (message.includes("places_has_a_price")) return "حدّد سعرًا واحدًا على الأقل.";
  if (message.includes("services_fee_matches_strategy")) {
    return "رسوم التوصيل يجب أن تكون أكبر من صفر مع هذه الاستراتيجية.";
  }
  if (message.includes("duplicate key")) return "حدث تعارض. حاول مرة أخرى.";
  return "تعذّر الحفظ. تأكد من اكتمال الحقول وحاول مرة أخرى.";
}
