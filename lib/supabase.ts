"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// Lazy initialization to avoid build-time errors
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(supabaseUrl && supabaseKey);
}

// Proxy to lazily initialize the client
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_target, prop: keyof ReturnType<typeof createBrowserClient<Database>>) {
    const client = createClient();
    if (!client) {
      return () => ({
        then: () => ({ catch: () => ({}) }),
        catch: () => ({ finally: () => ({}) }),
        finally: () => ({}),
        data: null,
        error: { message: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      });
    }
    return client[prop];
  },
});