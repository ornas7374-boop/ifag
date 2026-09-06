"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "@/lib/supabase/env";

/** عميل المتصفح — يستخدم مفتاح anon العام ويخضع بالكامل لسياسات RLS. */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
