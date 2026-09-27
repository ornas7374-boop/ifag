"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AIProviderError, getProvider, type AssistantMessage, type ChatMessage } from "@/lib/ai";
import { getConversationStore, type Conversation } from "@/lib/store";

import { applyStreamEvent } from "./apply-event";

/**
 * - idle:      لا طلب جارٍ.
 * - waiting:   أُرسل السؤال ولم يصل أي نص بعد.
 * - streaming: النص يصل تدريجيًا.
 */
export type ChatStatus = "idle" | "waiting" | "streaming";

const TITLE_MAX = 60;
const SAVE_THROTTLE_MS = 800;

export function useChat() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<ChatStatus>("idle");

  // نسخة متزامنة من المحادثة الحالية للاستخدام داخل الدوال غير المتزامنة.
  const conversationRef = useRef<Conversation | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // قفل متزامن من لحظة الإرسال حتى يبدأ run(): يمنع إرسالًا مزدوجًا بضغطتين سريعتين.
  const sendingRef = useRef(false);
  const lastSaveRef = useRef(0);

  const commit = useCallback((next: Conversation | null) => {
    conversationRef.current = next;
    setConversation(next);
  }, []);

  // تحميل المحادثة الحالية بعد الـ hydration (localStorage متاح في المتصفح فقط).
  useEffect(() => {
    let cancelled = false;
    const store = getConversationStore();
    (async () => {
      const id = await store.getCurrentId();
      const saved = id ? await store.get(id) : null;
      if (cancelled) return;
      commit(saved ? recoverInterrupted(saved) : null);
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [commit]);

  // إلغاء أي بث جارٍ عند مغادرة الصفحة.
  useEffect(() => () => abortRef.current?.abort(), []);

  /** يعدّل رسالة مساعد في محادثة معيّنة، حتى لو لم تعد هي المعروضة. */
  const updateAssistant = useCallback(
    async (
      conversationId: string,
      messageId: string,
      fn: (m: AssistantMessage) => AssistantMessage,
      { persist }: { persist: "now" | "throttled" },
    ) => {
      const store = getConversationStore();
      const current = conversationRef.current;
      const target = current?.id === conversationId ? current : await store.get(conversationId);
      if (!target) return;

      const next: Conversation = {
        ...target,
        updatedAt: Date.now(),
        messages: target.messages.map((m) =>
          m.id === messageId && m.role === "assistant" ? fn(m) : m,
        ),
      };

      if (conversationRef.current?.id === conversationId) commit(next);

      const now = Date.now();
      if (persist === "now" || now - lastSaveRef.current > SAVE_THROTTLE_MS) {
        lastSaveRef.current = now;
        await store.save(next);
      }
    },
    [commit],
  );

  /** يشغّل المزوّد لرسالة مساعد موجودة (إرسال جديد أو إعادة محاولة). */
  const run = useCallback(
    async (conversationId: string, assistantId: string) => {
      const source = conversationRef.current;
      if (!source) return;
      const index = source.messages.findIndex((m) => m.id === assistantId);
      const history = source.messages.slice(0, index);

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("waiting");

      try {
        for await (const event of getProvider().ask({ messages: history, signal: controller.signal })) {
          if (event.type === "delta") setStatus("streaming");
          await updateAssistant(conversationId, assistantId, (m) => applyStreamEvent(m, event), {
            persist: "throttled",
          });
        }
        await updateAssistant(
          conversationId,
          assistantId,
          (m) => ({ ...m, status: m.status === "no-source" ? "no-source" : "done" }),
          { persist: "now" },
        );
      } catch (error) {
        const aborted = error instanceof DOMException && error.name === "AbortError";
        await updateAssistant(
          conversationId,
          assistantId,
          (m) =>
            aborted
              ? { ...m, status: "stopped" }
              : {
                  ...m,
                  status: "error",
                  errorKind: error instanceof AIProviderError ? error.kind : "unknown",
                },
          { persist: "now" },
        );
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStatus("idle");
      }
    },
    [updateAssistant],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || abortRef.current || sendingRef.current) return false;
      sendingRef.current = true;

      const now = Date.now();
      const base = conversationRef.current ?? newConversation(content, now);
      const user: ChatMessage = { id: newId(), role: "user", content, createdAt: now };
      const assistant: AssistantMessage = emptyAssistant(now);
      const next: Conversation = {
        ...base,
        updatedAt: now,
        messages: [...base.messages, user, assistant],
      };

      commit(next);
      try {
        const store = getConversationStore();
        await store.save(next);
        await store.setCurrentId(next.id);
      } finally {
        // run() يضبط abortRef متزامنًا في أول سطر، فيبقى الإرسال مقفولًا بلا فجوة.
        void run(next.id, assistant.id);
        sendingRef.current = false;
      }
      return true;
    },
    [commit, run],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(
    async (assistantId: string) => {
      const current = conversationRef.current;
      if (!current || abortRef.current) return;
      const fresh = emptyAssistant(Date.now());
      commit({
        ...current,
        messages: current.messages.map((m) =>
          m.id === assistantId ? { ...fresh, id: assistantId } : m,
        ),
      });
      void run(current.id, assistantId);
    },
    [commit, run],
  );

  const newChat = useCallback(async () => {
    abortRef.current?.abort();
    commit(null);
    await getConversationStore().setCurrentId(null);
  }, [commit]);

  return {
    messages: conversation?.messages ?? [],
    status,
    isLoaded,
    send,
    stop,
    retry,
    newChat,
  };
}

function newConversation(firstMessage: string, now: number): Conversation {
  const title =
    firstMessage.length > TITLE_MAX ? `${firstMessage.slice(0, TITLE_MAX).trimEnd()}…` : firstMessage;
  return { id: newId(), title, createdAt: now, updatedAt: now, messages: [] };
}

function emptyAssistant(now: number): AssistantMessage {
  return { id: newId(), role: "assistant", parts: [], sources: [], status: "streaming", createdAt: now };
}

/** بث انقطع بتحديث الصفحة: بنص جزئي ← "أُوقف"، وبلا نص ← خطأ قابل لإعادة المحاولة. */
function recoverInterrupted(conversation: Conversation): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map((m) => {
      if (m.role !== "assistant" || m.status !== "streaming") return m;
      const hasText = m.parts.some((p) => p.text.trim());
      return hasText ? { ...m, status: "stopped" } : { ...m, status: "error", errorKind: "unknown" };
    }),
  };
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
