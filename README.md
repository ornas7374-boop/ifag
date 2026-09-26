# سَنَد

مساعد بحث مستقل لطلبة العلم، يجيب عن الأسئلة الشرعية اعتمادًا حصريًا على فتاوى سماحة الشيخ
عبدالعزيز بن باز رحمه الله المنشورة في موقعه الرسمي [binbaz.org.sa](https://binbaz.org.sa)،
ويعرض نص الفتوى كما هو مع رابط صفحتها الأصلية.

> المساعد أداة للبحث في فتاوى الشيخ ابن باز رحمه الله، وليس مفتيًا، ولا يغني عن سؤال أهل العلم في حالتك بعينها.

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

## التقنيات

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · lucide-react ·
IBM Plex Sans Arabic + Noto Naskh Arabic (محلية عبر next/font/local) · Playwright

## البنية

```
app/
  (site)/        الصفحات العامة بهيدر وفوتر مشتركين: / · /about · /chat
  globals.css    ★ كل الـ design tokens
  fonts.ts       الخطوط (عربي + لاتيني لكل عائلة مع unicode-range)
components/
  layout/        الهيدر، الفوتر، التنبيه الثابت، الشعار
  home/          الـ Hero والـ mockup و"كيف يعمل"
  ui/            الأزرار
lib/
  site.ts        ★ النصوص المعتمدة حرفيًا (التنبيه، الاستقلالية، رابط المصدر)
  content/ar.ts  ★ كل نصوص الواجهة
tests/e2e/       اختبارات Playwright لكل مرحلة
screenshots/     صور المراجعة لكل مرحلة
```
