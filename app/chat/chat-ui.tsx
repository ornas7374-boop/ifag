"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Plus, SendHorizontal, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  async function send(history: Message[]) {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") {
        throw new Error(data.error || "حدث خطأ غير متوقع.");
      }
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || loading) return;
    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    void send(history);
  }

  function handleNewChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setInput("");
    setError(null);
    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">المحادثة الذكية</h1>
        <Button variant="outline" size="sm" onClick={handleNewChat}>
          <Plus />
          محادثة جديدة
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 && !loading && (
            <div className="mt-24 text-center text-muted-foreground">
              <Bot className="mx-auto mb-3 size-10" />
              <p className="text-lg">كيف أستطيع مساعدتك اليوم؟</p>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>جارٍ كتابة الرد...</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <span>{error}</span>
              {messages.at(-1)?.role === "user" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => send(messages)}
                >
                  إعادة المحاولة
                </Button>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t border-border bg-background px-4 py-3">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="اكتب سؤالك هنا... (Shift + Enter لسطر جديد)"
            rows={3}
            maxLength={8000}
            autoFocus
            className="max-h-60 min-h-20 flex-1 resize-y rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-12 rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <SendHorizontal className="rtl:rotate-180" />}
            إرسال
          </Button>
        </form>
      </footer>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        dir="auto"
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
