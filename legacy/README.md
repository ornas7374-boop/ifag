# أرشيف

## `kashta/` — منصة "كشتة" السابقة

منصة حجز الكشتات والمخيمات التي كانت في هذا المستودع قبل سَنَد، مؤرشفة كاملة بقرار المالك
(PHASE 1)، بما فيها لوحات التحكم الثلاث:

| اللوحة | المسار داخل الأرشيف |
|---|---|
| الإدارة | `kashta/app/(admin)/admin/` |
| المزوّد | `kashta/app/(host)/` |
| العميل | `kashta/app/(customer)/` |

- **لا تُبنى ولا تُفحص** مع سَنَد: مستبعدة في `tsconfig.json` و`eslint.config.mjs` و`app/globals.css` (`@source not`).
- الأرشيف مشروع مستقل كامل (له `package.json` و`pnpm-lock.yaml` وإعداداته). لتشغيله: انسخ المجلد خارج المستودع ثم `pnpm install && pnpm dev`.
- النسخة الأصلية أيضًا في الفرع `claude/install-ui-ux-pro-max-skill-xunks2` وفي commit `c3ceb33`.
