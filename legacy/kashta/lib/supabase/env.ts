/**
 * فحص إعداد Supabase في مكان واحد.
 *
 * المشروع يجب أن يبني ويعمل حتى قبل توفّر المفاتيح (المرحلة 1)،
 * ثم ينتقل تلقائيًا لقاعدة البيانات الحقيقية لحظة إضافتها — دون
 * تعديل أي صفحة أو مكوّن.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** هل الاتصال بقاعدة البيانات متاح؟ */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function requireSupabaseEnv() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "إعداد Supabase ناقص. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local",
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
