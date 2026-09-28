import type { AssistantMessage, MessagePart, StreamEvent } from "@/lib/ai/types";

/** يطبّق حدث بث واحد على رسالة المساعد (دالة نقية، بلا تعديل في المكان). */
export function applyStreamEvent(message: AssistantMessage, event: StreamEvent): AssistantMessage {
  switch (event.type) {
    case "sources":
      return { ...message, sources: event.sources };

    case "part-start": {
      const part: MessagePart =
        event.part.type === "quote"
          ? { type: "quote", sourceId: event.part.sourceId, text: "" }
          : { type: "text", text: "" };
      return { ...message, parts: [...message.parts, part] };
    }

    case "delta": {
      const last = message.parts.at(-1);
      if (!last) return message;
      const parts = [...message.parts.slice(0, -1), { ...last, text: last.text + event.text }];
      return { ...message, parts };
    }

    case "no-source":
      return { ...message, parts: [], sources: [], status: "no-source" };

    case "out-of-scope":
      return { ...message, parts: [], sources: [], status: "out-of-scope" };

    case "done":
      return message;
  }
}

/** هل في الرسالة نص ظاهر للمستخدم؟ */
export function hasVisibleText(message: AssistantMessage) {
  return message.parts.some((p) => p.text.trim().length > 0);
}
