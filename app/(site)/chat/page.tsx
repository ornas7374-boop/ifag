import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";

export const metadata: Metadata = {
  title: ar.chatPlaceholder.metaTitle,
};

/** placeholder مؤقت — واجهة المحادثة الكاملة في PHASE 2. */
export default function ChatPage() {
  const t = ar.chatPlaceholder;

  return (
    <div className="mx-auto flex max-w-reading flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
      <span className="flex size-14 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <MessagesSquare aria-hidden="true" className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-text sm:text-3xl">{t.title}</h1>
      <p className="mt-3 max-w-md text-text-muted">{t.body}</p>
      <ButtonLink href="/" variant="secondary" className="mt-8">
        {t.back}
      </ButtonLink>
    </div>
  );
}
