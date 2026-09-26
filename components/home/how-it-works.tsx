import { ar } from "@/lib/content/ar";
import { cn } from "@/lib/cn";

/**
 * الخطوات تسلسل حقيقي، فتُعرض كسلسلة موصولة (نفس فكرة الشعار):
 * عمودية على الجوال، أفقية من 768px. الحلقة الأخيرة ممتلئة — الوصول للمصدر.
 */
export function HowItWorks() {
  const { title, intro, steps } = ar.howItWorks;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 id="how-it-works-title" className="text-2xl font-bold text-text sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-text-muted">{intro}</p>

        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-8">
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
                <div className="md:mt-5">
                  <h3 className="text-lg font-semibold text-text">{step.title}</h3>
                  <p className="mt-1 max-w-[22rem] text-text-muted">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
