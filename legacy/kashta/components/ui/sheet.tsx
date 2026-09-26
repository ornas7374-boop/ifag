"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "end",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** end = جهة النهاية المنطقية (يسار في RTL). لا تستخدم left/right. */
  side?: "start" | "end" | "bottom";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-card p-5 shadow-lg transition-transform",
          side === "end" && "inset-y-0 end-0 h-full w-full max-w-md border-s border-border",
          side === "start" && "inset-y-0 start-0 h-full w-full max-w-md border-e border-border",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t border-border",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="إغلاق"
          className="absolute end-4 top-4 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1 pe-8", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-auto space-y-3 border-t border-border pt-4", className)} {...props} />;
}
