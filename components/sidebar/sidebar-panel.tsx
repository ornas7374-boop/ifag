"use client";

import { Search, Settings, SquarePen } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { buttonClasses } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";
import type { ConversationSummary } from "@/lib/store";
import { normalizeForSearch } from "@/lib/text/normalize";

import { SidebarListSkeleton } from "@/components/chat/skeletons";

import { ConversationItem } from "./conversation-item";

export type SidebarActions = {
  conversations: ConversationSummary[];
  currentId: string | null;
  isLoaded: boolean;
  canStartNew: boolean;
  onOpen: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onRequestDelete: (conversation: ConversationSummary) => void;
};

/** محتوى القائمة الجانبية — نفسه في العمود الثابت (سطح المكتب) والـ Drawer (الجوال). */
export function SidebarPanel({
  headerAction,
  conversations,
  currentId,
  isLoaded,
  canStartNew,
  onOpen,
  onNewChat,
  onRename,
  onRequestDelete,
}: SidebarActions & { headerAction: React.ReactNode }) {
  const t = ar.sidebar;
  const [query, setQuery] = useState("");
  const searchId = useId(); // اللوحة قد تظهر مرتين (عمود + Drawer)

  const visible = useMemo(() => {
    const q = normalizeForSearch(query);
    return q
      ? conversations.filter((c) => normalizeForSearch(c.title).includes(q))
      : conversations;
  }, [conversations, query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 ps-4 pe-2 sm:h-16">
        <Logo />
        {headerAction}
      </div>

      <div className="shrink-0 space-y-2 p-3">
        <button
          type="button"
          onClick={onNewChat}
          disabled={!canStartNew}
          data-testid="new-chat"
          className={buttonClasses({
            variant: "secondary",
            className:
              "w-full justify-start disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-text",
          })}
        >
          <SquarePen aria-hidden="true" className="size-4" />
          {t.newChat}
        </button>

        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            {t.searchLabel}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            data-testid={searchId}
            className="min-h-11 w-full rounded-md border border-border bg-surface ps-9 pe-3 text-sm text-text placeholder:text-text-subtle"
          />
        </div>
      </div>

      <nav
        aria-label={t.listLabel}
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
      >
        {!isLoaded && <SidebarListSkeleton />}
        {isLoaded && conversations.length === 0 && (
          <p className="px-3 py-2 text-sm text-text-subtle">{t.empty}</p>
        )}
        {conversations.length > 0 && visible.length === 0 && (
          <p
            data-testid="no-results"
            className="px-3 py-2 text-sm text-text-subtle"
          >
            {t.noResults}
          </p>
        )}
        <ul className="space-y-0.5">
          {visible.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isCurrent={c.id === currentId}
              onOpen={() => onOpen(c.id)}
              onRename={(title) => onRename(c.id, title)}
              onDelete={() => onRequestDelete(c)}
            />
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border/70 p-3">
        <button
          type="button"
          disabled
          className="flex min-h-11 w-full cursor-not-allowed items-center gap-2 rounded-md px-3 text-sm text-text-subtle"
        >
          <Settings aria-hidden="true" className="size-4" />
          {t.settings}
          <span className="ms-auto rounded-full bg-surface-muted px-2 py-0.5 text-xs">
            {t.soon}
          </span>
        </button>
      </div>
    </div>
  );
}
