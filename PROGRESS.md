# سَنَد — سجل التقدم (PROGRESS.md)

> يُحدَّث بعد كل مرحلة. القواعد في `CLAUDE.md`، ومواصفات المراحل حرفيًا في `PHASES.md`.

## حالة المراحل
| المرحلة | الوصف | الحالة |
|---|---|---|
| 0 | الفحص والتخطيط | ✅ مكتملة — بانتظار الموافقة على PHASE 1 |
| 1 | الرئيسية "/" و"/about" | ⬜ |
| 2 | واجهة المحادثة "/chat" + AIProvider + ConversationStore | ⬜ |
| 3 | Sidebar | ⬜ |
| 4 | الحالات الحدّية وصقل المحادثة | ⬜ |
| 5 | تدقيق Responsive | ⬜ |
| 6 | مراجعة UX/UI شاملة + Lighthouse | ⬜ |
| 7 | قاعدة الفتاوى (Data Pipeline) | ⬜ |
| 8 | ربط الذكاء الاصطناعي مع RAG | ⬜ |
| 9 | الإطلاق | ⬜ |

---

## PHASE 0 — الفحص والتخطيط

### ما أُنجز
- فحص المستودع (`ornas7374-boop/ifag`): كان يحتوي منتجًا مختلفًا (منصة "كشتة" للحجوزات، Next.js 16 + Supabase، 52 صفحة).
- محاولة إنشاء مستودع جديد `sanad` فشلت (GitHub 403: لا صلاحية إنشاء مستودعات).
- بقرار المالك: سَنَد يُبنى في نفس المستودع `ifag` **بدلًا من** كشتة. كود كشتة محفوظ كاملًا في الفرع `claude/install-ui-ux-pro-max-skill-xunks2` وفي سجل git (commit `c3ceb33`). **لم يُحذف شيء في PHASE 0**؛ الحذف في بداية PHASE 1.
- اعتماد الاسم والهوية البصرية والخطوط وخريطة الصفحات وتوزيع المكونات (التفاصيل في `CLAUDE.md` القسم 0).
- إنشاء `CLAUDE.md` و`PHASES.md` و`PROGRESS.md`.

### القرارات
| القرار | القيمة | من قرّر |
|---|---|---|
| المستودع | `ifag` نفسه، الفرع `claude/compassionate-dirac-e320kg`، يحل محل كشتة | المالك |
| الاسم | سَنَد | المالك |
| اللون الأساسي | كحلي حبري `#1E3A5F` | المالك |
| خط الفتاوى | Noto Naskh Arabic | المالك |
| خط الواجهة | IBM Plex Sans Arabic | Claude (مذكور في التعليمات كمثال) |
| لون التمييز | برونزي `#8C6420`، لبطاقات المصادر فقط | Claude |
| مدير الحزم | pnpm | Claude |
| ملف `PHASES.md` | نسخة حرفية من مواصفات المراحل، حتى لا تضيع بعد ضغط السياق | Claude |
| الـ screenshots | تُحفظ في المستودع كدليل مراجعة (PNG) | Claude — قابل للتغيير |

### خريطة الصفحات
| المسار | المرحلة |
|---|---|
| `/` | P1 |
| `/about` | P1 |
| `/chat` | P1 (placeholder) ← P2 |
| `/dev/states` (development فقط) | P4 |

### المكونات حسب المرحلة
| المرحلة | المكونات |
|---|---|
| P1 | site-header, site-footer, disclaimer-note, hero, hero-mockup, how-it-works, button, إعداد Playwright |
| P2 | AIProvider + MockProvider + ConversationStore، chat-header، message-list، user/assistant-message، source-card، no-source-state، empty-state، suggested-questions، composer، error-state، markdown |
| P3 | sidebar (desktop ثابت + drawer)، بحث، إعادة تسمية، حذف مع تأكيد |
| P4 | typing-indicator، scroll-to-bottom، copy-button، skeleton، أنواع الأخطاء، /dev/states |
| P5–P6 | تدقيق وإصلاح فقط |

### شجرة المجلدات المستهدفة
```
app/            layout.tsx · globals.css (★ tokens) · page.tsx · about/ · chat/ · dev/states/ (P4) · api/chat/ (P8)
components/     layout/ · home/ · chat/ · sidebar/ (P3) · ui/
lib/            ai/ (types, mock-provider, index) · store/ · content/ar.ts · site.ts · cn.ts
pipeline/       (P7)
supabase/       migrations/ (P7)
tests/e2e/      Playwright
screenshots/    phase-X/
```

### المخاطر المعروفة
1. **الإذن بالسحب:** الموقع يسمح بالنقل مع ذكر المصدر، لكن سحب كل الفتاوى وفهرستها استخدام أوسع. **يُنصح بمراسلة إدارة binbaz.org.sa قبل PHASE 7** لطلب إذن أو نسخة بيانات. robots.txt وحده لا يكفي كإذن.
2. **الحرفية مع النماذج اللغوية:** النموذج قد يغيّر التشكيل أو الترقيم. المقترح: لا يكتب النموذج نص الفتوى إطلاقًا، بل يُعرض من قاعدة البيانات مباشرة.
3. **الملخص المولَّد** قد يُحرّف المعنى. يُقترح تعطيله افتراضيًا. القرار في P8.
4. **rate limiting على Vercel** يحتاج مخزنًا خارجيًا (Supabase أو Upstash).

### ملاحظات للمراحل القادمة
- **P1:** أولًا: حذف كود كشتة من هذا الفرع (app, components, config, content, lib, supabase, scripts, types, public, middleware.ts, README.md, إعدادات Supabase/Google Maps) مع **الإبقاء على** `.agents/` و`.claude/` و`skills-lock.json` ومهارات التصميم. ثم إنشاء مشروع Next.js نظيف في جذر المستودع، وضبط tokens في `app/globals.css` عبر `@theme inline`، وتثبيت `@playwright/test` واستخدام Chromium المثبت مسبقًا (`/opt/pw-browsers`). ممنوع أي نص منسوب للشيخ في الـ hero mockup: placeholders فقط.
- **P2:** نوع رسالة المساعد يتكون من أجزاء (`quote` مرتبط بـ source + `generated`)، مع `sources[]` بحقول: title, sourceLabel, volume?, page?, url.
- **P4:** زر النسخ يضيف تلقائيًا: عنوان الفتوى + المصدر + الرابط.
- **P7:** قبل أي سحب: robots.txt + موافقة المالك. الفتاوى فقط أولًا.
- **P8:** اسأل المالك عن المزود قبل البدء.
