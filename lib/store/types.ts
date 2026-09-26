import type { ChatMessage } from "@/lib/ai/types";

export type Conversation = {
  id: string;
  /** عنوان تلقائي من أول رسالة (قابل لإعادة التسمية في PHASE 3). */
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export type ConversationSummary = Pick<Conversation, "id" | "title" | "createdAt" | "updatedAt">;

/**
 * مخزن المحادثات. غير متزامن من البداية عمدًا: التنفيذ الحالي localStorage،
 * واستبداله بقاعدة بيانات لاحقًا لا يغيّر أي مستدعٍ.
 */
export interface ConversationStore {
  /** الأحدث أولًا. */
  list(): Promise<ConversationSummary[]>;
  get(id: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
  remove(id: string): Promise<void>;
  getCurrentId(): Promise<string | null>;
  setCurrentId(id: string | null): Promise<void>;
}
