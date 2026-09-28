import Link from "next/link";
import { Menu, PanelRightOpen, SquarePen } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { buttonClasses } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";
import { cn } from "@/lib/cn";

const iconButton =
  "flex size-11 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text";

export function ChatHeader({
  onNewChat,
  canStartNew,
  sidebarVisible,
  drawerOpen,
  onOpenDrawer,
  onShowSidebar,
}: {
  onNewChat: () => void;
  canStartNew: boolean;
  /** القائمة الثابتة ظاهرة (سطح المكتب وغير مطوية). */
  sidebarVisible: boolean;
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  onShowSidebar: () => void;
}) {
  const t = ar.sidebar;

  return (
    <header className="shrink-0 border-b border-border/70 bg-bg">
      <div className="flex h-14 items-center justify-between gap-2 px-2 sm:h-16 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          {/* الجوال: فتح الـ Drawer */}
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label={t.open}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            aria-controls="sidebar-drawer"
            data-testid="drawer-toggle"
            className={cn(iconButton, "lg:hidden")}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          {/* سطح المكتب: إظهار القائمة المطوية */}
          {!sidebarVisible && (
            <button
              type="button"
              onClick={onShowSidebar}
              aria-label={t.show}
              data-testid="sidebar-show"
              className={cn(iconButton, "hidden lg:flex")}
            >
              <PanelRightOpen aria-hidden="true" className="size-5" />
            </button>
          )}
          <Link
            href="/"
            aria-label={ar.a11y.home}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-1 transition-opacity hover:opacity-75",
              sidebarVisible && "lg:hidden",
            )}
          >
            <Logo />
          </Link>
        </div>

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
              className: cn(
                "min-w-11 px-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-text sm:px-4",
                sidebarVisible && "lg:hidden",
              ),
            })}
          >
            <SquarePen aria-hidden="true" className="size-4" />
            <span className="sr-only sm:not-sr-only">{ar.chat.newChat}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
