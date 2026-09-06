import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * وظيفتان:
 *  1. تجديد جلسة Supabase على كل طلب — بدونه ينتهي الرمز ويُطرد
 *     المستخدم من لوحة التحكم فجأة أثناء العمل.
 *  2. توجيه غير المسجّلين بعيدًا عن المسارات المحمية.
 *
 * ★ هذا ليس حماية ★
 * الـ middleware يحسّن التجربة فقط. الحماية الفعلية سياسات RLS في
 * قاعدة البيانات: حتى لو تجاوز أحدهم هذا الملف تمامًا واستدعى
 * واجهة Supabase مباشرة، لن يرى إلا ما تسمح به سياساته.
 */

const PROTECTED_PREFIXES = ["/account", "/host", "/admin"];
/** مسارات لا معنى لدخولها بعد تسجيل الدخول. */
const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // قبل ربط Supabase تبقى كل المسارات مفتوحة حتى يمكن تصفح الواجهة.
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // نحتفظ بالوجهة ليعود إليها المستخدم بعد الدخول بدل رميه في الرئيسية
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * كل المسارات عدا الملفات الساكنة والصور.
     * استثناؤها مهم: تمرير كل طلب صورة عبر middleware يضيف رحلة
     * تحقق من الجلسة بلا فائدة ويبطّئ الصفحة.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand|placeholder|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
