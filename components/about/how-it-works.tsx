import { ar } from "@/lib/content/ar";
import { cn } from "@/lib/cn";

/**
 * الخطوات تسلسل حقيقي، فتُعرض كسلسلة موصولة (نفس فكرة الشعار):
 * عمودية على الجوال، أفقية من 768px. الحلقة الأخيرة ممتلئة — الوصول للمصدر.
 */
export function HowItWorksSteps() {
  const { steps } = ar.howItWorks;

  return (
    <ol className="grid gap-8 md:grid-cols-3">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.title}
            className={cn(
              "relative grid grid-cols-[2.5rem_1fr] gap-x-4 md:block",
              // الخط الواصل للحلقة التالية
              !isLast &&
                "after:absolute after:start-5 after:top-12 after:-bottom-6 after:w-px after:bg-border-strong " +
                  "md:after:start-14 md:after:-end-6 md:after:top-5 md:after:bottom-auto md:after:h-px md:after:w-auto",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-sm font-bold",
                isLast
                  ? "bg-primary text-on-primary"
                  : "border border-border-strong bg-surface text-primary",
              )}
            >
              {i + 1}
            </span>
            <div className="md:mt-4">
              <h3 className="text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-1 text-text-muted">{step.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
