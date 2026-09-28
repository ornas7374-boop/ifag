# سَنَد

مساعد ذكي عربي (مثل ChatGPT وClaude) يجيب عن أسئلتك العامة بالبحث في الإنترنت،
ويضع روابط المصادر مع كل إجابة. لا يجيب عن المسائل الشرعية والفتاوى.

> سَنَد يبحث في الإنترنت وقد يخطئ. تحقّق من المعلومات المهمة من مصادرها.

- قواعد المشروع: [`CLAUDE.md`](CLAUDE.md)
- مواصفات المراحل: [`PHASES.md`](PHASES.md)
- حالة التنفيذ: [`PROGRESS.md`](PROGRESS.md)

## التشغيل

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## الفحوص (Definition of Done)

```bash
npm run build
npm run lint
npx tsc --noEmit
npm run test:e2e  # Playwright على بناء الإنتاج — screenshots في screenshots/phase-X/
```

## أوامر الـ Mock (للتطوير)

اكتب داخل السؤال: `#error` (خطأ) · `#error-once` (خطأ ثم نجاح عند إعادة المحاولة) · `#nosource` (لم أجد مصادر) · `#religious` (خارج الاختصاص).

## التقنيات

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · lucide-react ·
IBM Plex Sans Arabic (محلي عبر next/font/local) · Playwright

## البنية

```
app/
  page.tsx       / = شاشة المحادثة (مثل ChatGPT)
  (site)/        الصفحات التعريفية بهيدر وفوتر: /about
  globals.css    ★ كل الـ design tokens
  fonts.ts       الخطوط (عربي + لاتيني لكل عائلة مع unicode-range)
components/
  layout/        الهيدر، الفوتر، التنبيه الثابت، الشعار
  chat/          شاشة المحادثة: الرسائل، بطاقات المصادر، الـ composer، الحالات
  sidebar/       القائمة الجانبية (عمود/Drawer)، إعادة التسمية، تأكيد الحذف
  about/         "كيف يعمل"
  ui/            الأزرار
lib/
  ai/            ★ AIProvider (العقد) + MockProvider
  store/         ★ ConversationStore (localStorage الآن)
  chat/          useChat: الإرسال، البث، الإيقاف، إعادة المحاولة، الحفظ، قائمة المحادثات
  hooks/         useMediaQuery، usePersistentFlag
  text/          تطبيع النص العربي للبحث
  site.ts        ★ الاسم والتنبيه الثابت
  content/ar.ts  ★ كل نصوص الواجهة
tests/e2e/       اختبارات Playwright لكل مرحلة
screenshots/     صور المراجعة لكل مرحلة
```
