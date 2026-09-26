import { LocalStorageConversationStore } from "./local-storage-store";
import type { ConversationStore } from "./types";

export * from "./types";

let store: ConversationStore | null = null;

/** نقطة الاختيار الوحيدة للمخزن (localStorage الآن، قاعدة بيانات لاحقًا). */
export function getConversationStore(): ConversationStore {
  store ??= new LocalStorageConversationStore();
  return store;
}
