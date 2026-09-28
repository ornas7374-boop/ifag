"use client";

import { ArrowDown, Square } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ConfirmDialog } from "@/components/sidebar/confirm-dialog";
import { Sidebar } from "@/components/sidebar/sidebar";
import { buttonClasses } from "@/components/ui/button";
import { useChat } from "@/lib/chat/use-chat";
import { useMediaQuery, usePersistentFlag } from "@/lib/hooks/use-client-state";
import type { ConversationSummary } from "@/lib/store";
import { ar } from "@/lib/content/ar";
import { site } from "@/lib/site";

import { ChatHeader } from "./chat-header";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { AssistantMessage, UserMessage } from "./messages";
import { ChatSkeleton } from "./skeletons";

export function ChatScreen() {
  const t = ar.chat;
  const {
    messages,
    status,
    isLoaded,
    send,
    stop,
    retry,
    newChat,
    conversations,
    currentId,
    openConversation,
    rename,
    remove,
  } = useChat();
  const [collapsed, setCollapsed] = usePersistentFlag(
    "sanad:sidebar-collapsed",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<ConversationSummary | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // الـ Drawer للجوال فقط: إن اتّسعت الشاشة وهو مفتوح، يُغلق حتى لا يبقى modal مخفيًا.
  const drawerVisible = drawerOpen && !isDesktop;
  const busy = status !== "idle";
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCount = messages.length;

  // الزر الذي ضُغط (إيقاف / إعادة المحاولة) يختفي بعد الضغط، فيضيع التركيز.
  // نعيده إلى مربع الكتابة — على الأجهزة ذات المؤشر فقط، حتى لا تنفتح
  // لوحة مفاتيح الجوال دون طلب.
  const focusInput = useCallback(() => {
    if (window.matchMedia("(pointer: fine)").matches)
      inputRef.current?.focus({ preventScroll: true });
  }, []);

  // انتهى الرد بينما التركيز على زر الإيقاف (اختفى): أعده إلى مربع الكتابة.
  const wasBusy = useRef(false);
  useEffect(() => {
    if (wasBusy.current && !busy && document.activeElement === document.body)
      focusInput();
    wasBusy.current = busy;
  }, [busy, focusInput]);

  // ── المتابعة الذكية للتمرير ──
  // نلتصق بأسفل المحادثة أثناء البث، إلا إذا صعد المستخدم ليقرأ؛ عندها نتوقف
  // ويظهر زر "النزول لآخر المحادثة".
  const stickRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickRef.current = near;
    setAtBottom(near);
  }, []);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = true;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth && !reduce ? "smooth" : "auto",
    });
  }, []);

  // رسالة جديدة أو محادثة أخرى: التصق بالأسفل من جديد.
  useLayoutEffect(() => {
    if (messageCount > 0) scrollToBottom(false);
  }, [messageCount, currentId, scrollToBottom]);

  // كل تحديث للبث: تابع فقط إن كان المستخدم في الأسفل.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const showScrollButton = messageCount > 0 && !atBottom;

  return (
    <div
      // safe-area: المساحات حول الـ notch وشريط المنزل (فيزيائية بطبيعتها).
      className="flex h-dvh pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
    >
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        isLoaded={isLoaded}
        canStartNew={messageCount > 0}
        onOpen={(id) => void openConversation(id)}
        onNewChat={() => void newChat()}
        onRename={(id, title) => void rename(id, title)}
        onRequestDelete={setPendingDelete}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        drawerOpen={drawerVisible}
        onDrawerClose={() => setDrawerOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={ar.sidebar.deleteTitle}
        body={pendingDelete ? ar.sidebar.deleteBody(pendingDelete.title) : ""}
        confirmLabel={ar.sidebar.deleteConfirm}
        cancelLabel={ar.sidebar.cancel}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete.id);
          setPendingDelete(null);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onNewChat={() => void newChat()}
          canStartNew={messageCount > 0}
          sidebarVisible={!collapsed}
          drawerOpen={drawerVisible}
          onOpenDrawer={() => setDrawerOpen(true)}
          onShowSidebar={() => setCollapsed(false)}
        />

        <main
          ref={scrollRef}
          onScroll={onScroll}
          id="main"
          className="flex-1 overflow-y-auto"
        >
          {!isLoaded ? (
            <ChatSkeleton />
          ) : messageCount === 0 ? (
            <EmptyState onPick={(q) => void send(q)} disabled={busy} />
          ) : (
            <>
              <h1 className="sr-only">{t.srTitle}</h1>
              <div
                role="log"
                aria-label={t.logLabel}
                className="mx-auto max-w-reading space-y-8 px-4 pt-8 pb-20 sm:px-6"
              >
                {messages.map((m) =>
                  m.role === "user" ? (
                    <UserMessage key={m.id} message={m} />
                  ) : (
                    <AssistantMessage
                      key={m.id}
                      message={m}
                      canRetry={!busy}
                      onRetry={() => {
                        void retry(m.id);
                        focusInput();
                      }}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </main>

        <div className="relative shrink-0 bg-bg px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] short:pt-1 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mx-auto max-w-reading">
            {/* تطفو فوق الـ composer ولا تغيّر ارتفاعه: لا قفزات في التخطيط عند ظهورها. */}
            {(busy || showScrollButton) && (
              <div className="pointer-events-none absolute inset-x-0 bottom-full flex items-center justify-center gap-2 pb-2 [&>*]:pointer-events-auto">
                {showScrollButton && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom(true)}
                    aria-label={t.scrollToBottom}
                    data-testid="scroll-to-bottom"
                    className="flex size-11 items-center justify-center rounded-full border border-border-strong bg-surface text-text shadow-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <ArrowDown aria-hidden="true" className="size-5" />
                  </button>
                )}
                {busy && (
                  <button
                    type="button"
                    onClick={() => {
                      stop();
                      focusInput();
                    }}
                    data-testid="stop"
                    className={buttonClasses({
                      variant: "secondary",
                      className: "shadow-sm",
                    })}
                  >
                    <Square
                      aria-hidden="true"
                      className="size-3.5 fill-current"
                    />
                    {t.stop}
                  </button>
                )}
              </div>
            )}
            <Composer busy={busy} onSend={send} inputRef={inputRef} />
            <p
              data-testid="disclaimer"
              className="mt-2 text-center text-xs text-text-subtle"
            >
              {site.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
