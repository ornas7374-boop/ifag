"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * DirectionProvider ليس اختياريًا في واجهة RTL.
 *
 * سمة dir="rtl" على <html> تعالج التخطيط فقط. مكونات Radix
 * (Select, Tabs, Menu, Popover) تقرأ الاتجاه من هذا الـ Provider،
 * وبدونه تتحرك أسهم لوحة المفاتيح بالعكس ويظهر الـ Popover على
 * الجهة الخاطئة. shadcn لا يضيفه افتراضيًا.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <DirectionProvider dir="rtl">
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </DirectionProvider>
  );
}
