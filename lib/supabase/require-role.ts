import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Role } from "@/types/domain";

/**
 * حارس دور من طرف الخادم للوحات `/admin` و`/host`.
 *
 * middleware.ts يتحقق فقط من "هل المستخدم مسجّل دخول؟" — لا يعرف
 * دوره. بدون هذا الحارس، أي عميل مسجّل يقدر يفتح شاشات لوحة الإدارة
 * (الأزرار والحقول تظهر له، حتى لو RLS تمنع القراءة والكتابة
 * فعليًا). هذا الحارس يقفل الشاشة نفسها قبل أن تُعرض.
 *
 * قبل ربط Supabase تبقى كل اللوحات مفتوحة للمعاينة (نفس سلوك
 * middleware.ts) — لا معنى لحارس دور بلا نظام دخول حقيقي أصلًا.
 */
export async function requireRole(allowed: Role[]) {
  if (!isSupabaseConfigured) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !allowed.includes(profile.role as Role)) {
    redirect("/");
  }
}
