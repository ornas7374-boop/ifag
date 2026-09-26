import type { Conversation, ConversationStore, ConversationSummary } from "./types";

const CONVERSATIONS_KEY = "sanad:conversations:v1";
const CURRENT_KEY = "sanad:current:v1";

type Snapshot = Record<string, Conversation>;

/**
 * ConversationStore فوق localStorage.
 * كل قراءة وكتابة داخل try/catch: التخزين قد يكون معطّلًا (تصفح خاص،
 * امتلاء الحصة)، فتعمل المحادثة عندها في الذاكرة فقط دون أن تنكسر الواجهة.
 */
export class LocalStorageConversationStore implements ConversationStore {
  async list(): Promise<ConversationSummary[]> {
    return Object.values(readAll())
      .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Conversation | null> {
    return readAll()[id] ?? null;
  }

  async save(conversation: Conversation): Promise<void> {
    const all = readAll();
    all[conversation.id] = conversation;
    write(CONVERSATIONS_KEY, JSON.stringify(all));
  }

  async remove(id: string): Promise<void> {
    const all = readAll();
    delete all[id];
    write(CONVERSATIONS_KEY, JSON.stringify(all));
  }

  async getCurrentId(): Promise<string | null> {
    return read(CURRENT_KEY);
  }

  async setCurrentId(id: string | null): Promise<void> {
    if (id === null) {
      try {
        localStorage.removeItem(CURRENT_KEY);
      } catch {
        /* التخزين غير متاح */
      }
      return;
    }
    write(CURRENT_KEY, id);
  }
}

function readAll(): Snapshot {
  const raw = read(CONVERSATIONS_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Snapshot) : {};
  } catch {
    return {};
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* التخزين غير متاح أو ممتلئ — تستمر المحادثة في الذاكرة */
  }
}
