import { cn } from "@/lib/utils";

/**
 * جدول بسيط للوحات الإدارة.
 *
 * ملفوف في حاوية تمرير أفقي خاصة به: الجداول العريضة يجب أن تمرّر
 * داخل نفسها، لا أن تدفع الصفحة كلها للتمرير الأفقي على الجوال.
 */
export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full min-w-[36rem] text-sm">
        <thead className="bg-secondary/60">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-start font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}
