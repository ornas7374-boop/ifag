"use client";

import { Square } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { buttonClasses } from "@/components/ui/button";
import { useChat } from "@/lib/chat/use-chat";
import { ar } from "@/lib/content/ar";
import { site } from "@/lib/site";

import { ChatHeader } from "./chat-header";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { AssistantMessage, UserMessage } from "./messages";

export function ChatScreen() {
  const t = ar.chat;
  const { messages, status, isLoaded, send, stop, retry, newChat } = useChat();
  const busy = status !== "idle";
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCount = messages.length;

  // الزر الذي ضُغط (إيقاف / إعادة المحاولة) يختفي بعد الضغط، فيضيع التركيز.
  // نعيده إلى مربع الكتابة — على الأجهزة ذات المؤشر فقط، حتى لا تنفتح
  // لوحة مفاتيح الجوال دون طلب.
  const focusInput = useCallback(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  // انتهى الرد بينما التركيز على زر الإيقاف (اختفى): أعده إلى مربع الكتابة.
  const wasBusy = useRef(false);
  useEffect(() => {
    if (wasBusy.current && !busy && document.activeElement === document.body) focusInput();
    wasBusy.current = busy;
  }, [busy, focusInput]);

  // عند إضافة رسالة جديدة: انزل لأسفل المحادثة.
  // (المتابعة الذكية أثناء البث وزر "النزول للأسفل" في PHASE 4.)
  useEffect(() => {
    const el = scrollRef.current;
    if (el && messageCount > 0) el.scrollTo({ top: el.scrollHeight });
  }, [messageCount]);

  return (
    <div className="flex h-dvh flex-col">
      <ChatHeader onNewChat={() => void newChat()} canStartNew={messageCount > 0} />

      <main ref={scrollRef} id="main" className="flex-1 overflow-y-auto">
        {!isLoaded ? null : messageCount === 0 ? (
          <EmptyState onPick={(q) => void send(q)} disabled={busy} />
        ) : (
          <>
            <h1 className="sr-only">{t.srTitle}</h1>
            <div
              role="log"
              aria-label={t.logLabel}
              className="mx-auto max-w-reading space-y-8 px-4 py-8 sm:px-6"
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

      <div className="shrink-0 bg-bg px-4 pb-3 pt-2 sm:px-6">
        <div className="mx-auto max-w-reading">
          {busy && (
            <div className="mb-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  stop();
                  focusInput();
                }}
                data-testid="stop"
                className={buttonClasses({ variant: "secondary", className: "shadow-sm" })}
              >
                <Square aria-hidden="true" className="size-3.5 fill-current" />
                {t.stop}
              </button>
            </div>
          )}
          <Composer busy={busy} onSend={send} inputRef={inputRef} />
          <p data-testid="disclaimer" className="mt-2 text-center text-xs text-text-subtle">
            {site.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
