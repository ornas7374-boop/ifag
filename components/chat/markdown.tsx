import ReactMarkdown, { type Components } from "react-markdown";

import { ar } from "@/lib/content/ar";

/**
 * Markdown للنص المولَّد فقط (لا للاقتباس — ذاك يُعرض حرفيًا).
 * آمن افتراضيًا: react-markdown لا يعرض HTML خام.
 * الحجم الأدنى للعناوين عمدًا: الرد جزء من محادثة لا صفحة مقال.
 */
const components: Components = {
  h1: ({ children }) => <h3 className="mt-5 text-lg font-semibold text-text first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-5 text-lg font-semibold text-text first:mt-0">{children}</h3>,
  h3: ({ children }) => <h3 className="mt-5 text-base font-semibold text-text first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 text-base font-semibold text-text first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 ps-6 marker:text-text-subtle">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 ps-6 marker:text-text-subtle">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-s-2 border-border-strong ps-4 text-text-muted">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
    >
      {children}
      <span className="sr-only"> {ar.a11y.opensInNewTab}</span>
    </a>
  ),
  code: ({ children }) => (
    <code dir="ltr" className="rounded-sm bg-surface-muted px-1.5 py-0.5 text-sm">
      {children}
    </code>
  ),
  hr: () => <hr className="my-5 border-border" />,
  // الأسطر الطويلة تُمرَّر داخل الكتلة نفسها، لا في الصفحة.
  pre: ({ children }) => (
    <pre dir="ltr" className="mt-3 overflow-x-auto rounded-md bg-surface-muted p-3 text-sm [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-base text-text [overflow-wrap:anywhere]">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
