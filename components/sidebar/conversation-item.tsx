"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ar } from "@/lib/content/ar";
import { cn } from "@/lib/cn";
import type { ConversationSummary } from "@/lib/store";

const iconButton =
  "flex size-11 shrink-0 items-center justify-center rounded-md text-text-subtle transition-[color,background-color,opacity] " +
  "hover:bg-surface hover:text-text " +
  // مخفية حتى hover/focus على سطح المكتب، وظاهرة دائمًا على اللمس
  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

export function ConversationItem({
  conversation,
  isCurrent,
  onOpen,
  onRename,
  onDelete,
}: {
  conversation: ConversationSummary;
  isCurrent: boolean;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const t = ar.sidebar;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameButtonRef = useRef<HTMLButtonElement>(null);
  // Enter/Esc تُنهي التحرير بنفسها، فيُتجاهل الـ blur الذي يليها.
  const handledRef = useRef(false);
  const returnFocusRef = useRef(false);

  useEffect(() => {
    if (editing) {
      handledRef.current = false;
      inputRef.current?.select();
    } else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      renameButtonRef.current?.focus();
    }
  }, [editing]);

  const finish = (save: boolean, { fromKeyboard }: { fromKeyboard: boolean }) => {
    if (fromKeyboard) {
      handledRef.current = true;
      returnFocusRef.current = true;
    }
    if (save && draft.trim() && draft.trim() !== conversation.title) onRename(draft);
    if (!save) setDraft(conversation.title);
    setEditing(false);
  };

  return (
    <li
      data-testid="conversation-item"
      className={cn(
        "group flex items-center gap-0.5 rounded-md transition-colors",
        isCurrent ? "bg-primary-soft" : "hover:bg-surface-muted",
      )}
    >
      {editing ? (
        <form
          className="flex-1 p-1"
          onSubmit={(e) => {
            e.preventDefault();
            finish(true, { fromKeyboard: true });
          }}
        >
          <label htmlFor={`rename-${conversation.id}`} className="sr-only">
            {t.renameLabel}
          </label>
          <input
            id={`rename-${conversation.id}`}
            ref={inputRef}
            value={draft}
            maxLength={120}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (handledRef.current) {
                handledRef.current = false;
                return;
              }
              finish(true, { fromKeyboard: false });
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation(); // لا تُغلق القائمة على الجوال
                finish(false, { fromKeyboard: true });
              }
            }}
            data-testid="rename-input"
            className="min-h-11 w-full rounded-sm border border-primary bg-surface px-2 text-sm text-text"
          />
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={onOpen}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "min-h-11 min-w-0 flex-1 truncate rounded-md px-3 text-start text-sm",
              isCurrent ? "font-semibold text-primary hover:bg-primary/5" : "text-text hover:text-primary",
            )}
          >
            {conversation.title}
          </button>
          <button
            ref={renameButtonRef}
            type="button"
            onClick={() => {
              setDraft(conversation.title);
              setEditing(true);
            }}
            aria-label={`${t.rename}: ${conversation.title}`}
            className={iconButton}
          >
            <Pencil aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`${t.delete}: ${conversation.title}`}
            className={cn(iconButton, "hover:text-danger")}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </>
      )}
    </li>
  );
}
