import { MockProvider } from "./mock-provider";
import type { AIProvider } from "./types";

export * from "./types";

let provider: AIProvider | null = null;

/**
 * نقطة الاختيار الوحيدة للمزوّد. اليوم: MockProvider دائمًا.
 * في PHASE 8: مزوّد يستدعي /api/chat، مع إبقاء AI_PROVIDER=mock للتطوير.
 */
export function getProvider(): AIProvider {
  provider ??= new MockProvider();
  return provider;
}
