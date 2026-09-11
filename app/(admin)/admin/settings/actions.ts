"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SettingsResult = { ok: true } | { ok: false; error: string } | null;

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * تُشترك بين نموذجي الهوية والعمولة: RLS في 0012 ("admin updates
 * settings") تقصر UPDATE على is_admin() — لعميل عادي هذا لا يُرجع
 * خطأ، يُحدّث ببساطة صفر صف، فحارس requireRole في الـ layout يمنع
 * الوصول أصلًا. هذا فحص دفاعي إضافي: إن لم يعد أي صف، لا نصمت.
 */
function checkUpdated<T>(data: T[] | null, error: { message: string } | null): SettingsResult {
  if (error) return { ok: false, error: "تعذّر الحفظ. حاول مرة أخرى." };
  if (!data || data.length === 0) {
    return { ok: false, error: "صلاحيتك لا تسمح بهذا التعديل." };
  }
  return { ok: true };
}

/**
 * ★ نقطة الاتصال التي وعدت بها شاشة الهوية منذ البداية ★
 * تكتب platform_settings مباشرة — getBrand() (config/brand.ts) يقرأها
 * فورًا في الطلب التالي، فتتغيّر الواجهة كلها دون إعادة نشر.
 */
export async function updateBranding(
  _prev: SettingsResult,
  form: FormData,
): Promise<SettingsResult> {
  const appName = text(form, "appName");
  const logoUrl = text(form, "logoUrl");
  const radius = text(form, "radius");
  const fontFamily = text(form, "fontFamily");
  const primary = text(form, "primary");
  const accent = text(form, "accent");
  const background = text(form, "background");
  const foreground = text(form, "foreground");

  if (!appName) return { ok: false, error: "اسم المنصة مطلوب." };
  for (const [label, value] of [
    ["اللون الأساسي", primary],
    ["لون الإجراء", accent],
    ["الخلفية", background],
    ["لون النص", foreground],
  ] as const) {
    if (value && !HEX.test(value)) {
      return { ok: false, error: `${label}: صيغة اللون يجب أن تكون مثل #A65A2A.` };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .update({
      app_name: appName,
      logo_url: logoUrl || null,
      border_radius: radius || null,
      font_family: fontFamily || null,
      brand_colors: {
        light: {
          ...(primary ? { primary } : {}),
          ...(accent ? { accent } : {}),
          ...(background ? { background } : {}),
          ...(foreground ? { foreground } : {}),
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", true)
    .select("id");

  const result = checkUpdated(data, error);
  if (result?.ok) {
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings/branding");
  }
  return result;
}

export async function updateCommission(
  _prev: SettingsResult,
  form: FormData,
): Promise<SettingsResult> {
  const percent = Number(text(form, "rate"));
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return { ok: false, error: "النسبة يجب أن تكون بين 0 و100." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .update({ commission_rate: percent / 100, updated_at: new Date().toISOString() })
    .eq("id", true)
    .select("id");

  const result = checkUpdated(data, error);
  if (result?.ok) revalidatePath("/admin/commission");
  return result;
}
