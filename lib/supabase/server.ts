import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * عميل الخادم — للـ Server Components و Server Actions و Route Handlers.
 * يقرأ جلسة المستخدم من الكوكيز، فتُطبَّق سياسات RLS على هويته الحقيقية.
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // الكتابة في Server Component ممنوعة؛ التحديث يتم في middleware.
          // تجاهُل الخطأ هنا سليم ما دام middleware يجدّد الجلسة.
        }
      },
    },
  });
}

/**
 * ★ عميل الخدمة — يتجاوز كل سياسات RLS ★
 *
 * للاستخدام في webhooks الدفع والمهام الخلفية فقط.
 * لا تستدعه استجابةً لطلب مستخدم، ولا تمرّر مفتاحه للمتصفح أبدًا.
 */
export function createServiceClient() {
  const { url } = requireSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY غير معرّف — مطلوب للعمليات الخادمية.");
  }

  return createServerClient<Database>(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
