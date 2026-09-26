# سَنَد — سجل التقدم (PROGRESS.md)

> يُحدَّث بعد كل مرحلة. القواعد في `CLAUDE.md`، ومواصفات المراحل حرفيًا في `PHASES.md`.

## حالة المراحل
| المرحلة | الوصف | الحالة |
|---|---|---|
| 0 | الفحص والتخطيط | ✅ مكتملة |
| 1 | الرئيسية "/" و"/about" | ✅ مكتملة — بانتظار الموافقة على PHASE 2 |
| 2 | واجهة المحادثة "/chat" + AIProvider + ConversationStore | ⬜ |
| 3 | Sidebar | ⬜ |
| 4 | الحالات الحدّية وصقل المحادثة | ⬜ |
| 5 | تدقيق Responsive | ⬜ |
| 6 | مراجعة UX/UI شاملة + Lighthouse | ⬜ |
| 7 | قاعدة الفتاوى (Data Pipeline) | ⬜ |
| 8 | ربط الذكاء الاصطناعي مع RAG | ⬜ |
| 9 | الإطلاق | ⬜ |

---

## PHASE 1 — الرئيسية "/" و"/about"

### ما أُنجز
- **أرشفة كشتة كاملة** في `legacy/kashta/` بـ `git mv` (بقرار المالك، حفاظًا على لوحات التحكم الثلاث: الإدارة والمزوّد والعميل). الأرشيف مستبعد من البناء والفحص وTailwind، وموثّق في `legacy/README.md`. النسخة الأصلية أيضًا في الفرع `claude/install-ui-ux-pro-max-skill-xunks2` وcommit `c3ceb33`.
- مشروع Next.js نظيف لسَنَد في جذر المستودع، مع الإبقاء على `.agents/` و`.claude/` (مهارات التصميم).
- الـ design tokens كاملة في `app/globals.css` (ألوان، type scale، مسافات، انحناء، ظلال، عروض) مع تعطيل لوحة Tailwind الافتراضية (`--color-*: initial`).
- الخطوط محلية عبر `next/font/local` من حزم `@fontsource` (عربي + لاتيني لكل عائلة مع unicode-range).
- الرئيسية: Header (الشعار + "عن سَنَد" + "اسأل الآن")، Hero (عنوان + وصف في سطرين + CTA + mockup)، "كيف يعمل" (3 خطوات كسلسلة)، Footer (التنبيه + الاستقلالية + الروابط).
- `/about`: الفكرة، المصدر مع زر الموقع الرسمي، حدود المساعد، التنبيه.
- `/chat`: placeholder. صفحة 404 عربية. رابط "انتقل إلى المحتوى" للوحة المفاتيح. أيقونة الموقع `app/icon.svg`.
- Playwright: `playwright.config.ts` + `tests/e2e/helpers.ts` (قابلة لإعادة الاستخدام) + `tests/e2e/phase-1.spec.ts` (30 اختبارًا).

### القرارات
| القرار | القيمة | السبب |
|---|---|---|
| تحميل الخطوط | `next/font/local` من `@fontsource` بدل `next/font/google` | الشبكة تمنع `fonts.gstatic.com` وقت البناء؛ والمحلي أثبت في CI وVercel |
| فكرة بصرية موحّدة | "سلسلة الإسناد": الشعار (3 حلقات)، خط يصل الإجابة ببطاقة المصدر، وخطوات "كيف يعمل" | تعبير بصري عن اسم سَنَد ووعد "كل إجابة تنتهي عند مصدرها" |
| موضع فقاعة المستخدم | نهاية السطر (يسار في RTL) | عكس المألوف في LTR |
| لون التمييز البرونزي | لبطاقة المصدر وعقدتها فقط | التزام "لون تمييز واحد" |
| الـ mockup | `role="img"` مع وصف، ولا عناصر قابلة للنقر داخله | عنصر توضيحي بنصوص placeholder |
| مجموعة المسارات `(site)` | `/` و`/about` و`/chat` تحت هيدر وفوتر مشتركين | `/chat` سيخرج منها في PHASE 2 بتخطيط خاص |
| الأرقام | لاتينية (1، 2، 3) | المعتاد في الواجهات السعودية الحديثة |

### المشاكل المعروفة
- التنبيه الثابت يظهر مرتين في `/about` (قسم "تنبيه" + الـ Footer)، وكلاهما مطلوب في المواصفات. يُراجع في PHASE 6.

### طلبات المالك بعد PHASE 1
- **مستودع جديد باسم المشروع** (`sanad`): يُنقل إليه المشروع بعد PHASE 1. محاولة الإنشاء من الجلسة فشلت (GitHub 403)، فيلزم أن ينشئه المالك ويمنح تطبيق Claude الوصول.
- **الواجهة مثل ChatGPT/Claude** (سؤال ← رد تدريجي في محادثة): مؤكَّد، وهو نطاق PHASE 2 (المحادثة) وPHASE 3 (القائمة الجانبية لسجل المحادثات).

### ملاحظات للمراحل القادمة
- **P2:** `/chat` يخرج من `(site)` بتخطيط ملء الشاشة. أعد استخدام `tests/e2e/helpers.ts`.
- **قاعدة CSS:** مع `@theme inline` لا يُولَّد `--color-*` في CSS. أي CSS مكتوب يدويًا يستخدم `--sanad-*` مباشرة (سبّب خطأ إطار focus أبيض، وأُصلح).
- **P7:** الوصول إلى `binbaz.org.sa` من بيئة التطوير الحالية محجوب بالـ proxy (403). يلزم إعداد شبكة البيئة أو تشغيل الـ fetcher من بيئة أخرى.

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
