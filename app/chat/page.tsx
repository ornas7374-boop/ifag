import type { Metadata } from "next";

import { ChatUI } from "./chat-ui";

export const metadata: Metadata = { title: "المحادثة" };

export default function ChatPage() {
  return <ChatUI />;
}
