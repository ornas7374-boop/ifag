import Link from "next/link";
import { SquarePen } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { buttonClasses } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";

export function ChatHeader({ onNewChat, canStartNew }: { onNewChat: () => void; canStartNew: boolean }) {
  return (
    <header className="shrink-0 border-b border-border/70 bg-bg">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          aria-label={ar.a11y.home}
          className="-ms-1 inline-flex min-h-11 items-center rounded-md px-1 transition-opacity hover:opacity-75"
        >
          <Logo />
        </Link>

        <nav aria-label={ar.a11y.mainNav} className="flex items-center gap-1 sm:gap-2">
          <Link href="/about" className={buttonClasses({ variant: "ghost" })}>
            {ar.nav.about}
          </Link>
          <button
            type="button"
            onClick={onNewChat}
            disabled={!canStartNew}
            data-testid="new-chat"
            className={buttonClasses({
              variant: "secondary",
              className: "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-text",
            })}
          >
            <SquarePen aria-hidden="true" className="size-4" />
            {ar.chat.newChat}
          </button>
        </nav>
      </div>
    </header>
  );
}
