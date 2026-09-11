"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/domain";

export type AuthActionState = { error: string } | null;

/**
 * ★ الاتصال الحقيقي بـ Supabase Auth ★
 *
 * صف profiles يُنشأ تلقائيًا عبر مُشغّل قاعدة بيانات (migration 0014)،
 * لا هنا — حتى يبقى صحيحًا بغض النظر عن طريقة التسجيل مستقبلًا
 * (OAuth، رابط سحري...) لا مسار signUp هذا فقط.
 */
export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const accountType = String(formData.get("accountType") ?? "customer");
  // "admin" غير مسموح كقيمة قادمة من النموذج — يُمنح يدويًا فقط.
  const role: Role = accountType === "host" ? "host" : "customer";

  if (!email || !password || !fullName) {
    return { error: "املأ الاسم والبريد وكلمة المرور." };
  }
  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone || undefined, role },
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // لا جلسة فورية ⇒ Supabase يتطلب تأكيد البريد قبل الدخول.
  if (data.session === null) {
    redirect("/login?confirm=1");
  }

  redirect(role === "host" ? "/host" : "/account");
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/account";

  if (!email || !password) {
    return { error: "أدخل البريد وكلمة المرور." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** رسائل Supabase الافتراضية إنجليزية — نترجم الشائع منها فقط. */
function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    "Invalid login credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "User already registered": "هذا البريد الإلكتروني مسجّل مسبقًا.",
    "Email not confirmed": "لم يُفعَّل البريد الإلكتروني بعد. تحقق من صندوق الوارد.",
    "Password should be at least 6 characters": "كلمة المرور قصيرة جدًا.",
  };
  return known[message] ?? "حدث خطأ. حاول مرة أخرى.";
}
