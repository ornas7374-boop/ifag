"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import type { AssistantMessage } from "@/lib/ai/types";
import { buildCopyText } from "@/lib/chat/copy-text";
import { ar } from "@/lib/content/ar";

export function CopyButton({ message }: { message: AssistantMessage }) {
  const t = ar.chat;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      data-testid="copy"
      onClick={async () => {
        if (await copyToClipboard(buildCopyText(message))) setCopied(true);
      }}
      className="-ms-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
    >
      {copied ? <Check aria-hidden="true" className="size-4 text-primary" /> : <Copy aria-hidden="true" className="size-4" />}
      <span aria-live="polite">{copied ? t.copied : t.copy}</span>
    </button>
  );
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // احتياطي للمتصفحات/السياقات التي تمنع Clipboard API
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
