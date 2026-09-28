import type { MessagePart, Source } from "./types";

/**
 * بيانات تجريبية للـ MockProvider ولصفحة /dev/states.
 * قاعدة المصدر: placeholders صريحة بين أقواس، وروابط example.com فقط.
 */

export const PLACEHOLDER_SOURCES: Source[] = [
  {
    id: "mock-source-1",
    title: "[عنوان الصفحة الأولى]",
    sourceLabel: "[اسم الموقع]",
    volume: null,
    page: null,
    url: "https://example.com/source-1",
  },
  {
    id: "mock-source-2",
    title: "[عنوان الصفحة الثانية]",
    sourceLabel: "[اسم الموقع]",
    volume: null,
    page: null,
    url: "https://example.com/source-2",
  },
];

export const LONG_SOURCES: Source[] = [1, 2, 3, 4].map((n) => ({
  id: `mock-long-${n}`,
  title: `[عنوان الصفحة ${n} — عنوان طويل نسبيًا لاختبار التفاف النص داخل البطاقة]`,
  sourceLabel: "[اسم الموقع]",
  volume: null,
  page: null,
  url: `https://example.com/long-source-${n}`,
}));

/** رد طويل جدًا: 10 أقسام × 5 فقرات × 5 جمل ≈ 2300 كلمة، كلها placeholder. */
export const LONG_PARTS: MessagePart[] = [
  { type: "text", text: "**[إجابة تجريبية طويلة]** لاختبار عرض الردود الطويلة جدًا والتمرير أثناء البث." },
  { type: "quote", sourceId: "mock-long-1", text: "[اقتباس تجريبي — نص منقول حرفيًا من المصدر الأول]" },
  {
    type: "text",
    text: Array.from({ length: 10 }, (_, s) =>
      [
        `### [قسم تجريبي ${s + 1}]`,
        ...Array.from({ length: 5 }, (_, p) =>
          Array.from({ length: 5 }, (_, j) => `[جملة تجريبية رقم ${j + 1} في الفقرة ${p + 1} من القسم ${s + 1}.]`).join(" "),
        ),
      ].join("\n\n"),
    ).join("\n\n"),
  },
];

/** رد تجريبي يستعرض كل أنواع الأجزاء وعناصر الـ Markdown المدعومة. */
export const PLACEHOLDER_PARTS: MessagePart[] = [
  {
    type: "text",
    text: "**[إجابة تجريبية]** ستظهر هنا إجابة سَنَد عن سؤالك، مجمّعة من المصادر.",
  },
  {
    type: "quote",
    sourceId: "mock-source-1",
    text: "[اقتباس تجريبي — يظهر هنا نص منقول حرفيًا من أحد المصادر]",
  },
  {
    type: "text",
    text: [
      "### [عنوان تجريبي]",
      "",
      "- [نقطة تجريبية أولى]",
      "- [نقطة تجريبية ثانية]",
      "",
      "> [ملاحظة تجريبية بصيغة اقتباس]",
    ].join("\n"),
  },
];

