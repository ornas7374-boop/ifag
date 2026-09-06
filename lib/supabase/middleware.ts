import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * تجديد جلسة Supabase على كل طلب.
 *
 * ضروري لأن رموز الوصول تنتهي صلاحيتها؛ بدون هذا التجديد يُطرد
 * المستخدم من لوحة التحكم فجأة أثناء الاستخدام.
 *
 * يُرجع الاستجابة والمستخدم معًا حتى يستفيد middleware من الاثنين
 * دون استدعاء الشبكة مرتين.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return { response, user: null };
  }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() وليس getSession(): الأولى تتحقق من الرمز مع خادم Supabase،
  // والثانية تقرأ الكوكي كما هو دون تحقق — وهي قابلة للتزوير.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
