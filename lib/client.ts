import { createBrowserClient } from "@supabase/ssr";

declare global {
  var __supabase_browser_client: ReturnType<typeof createBrowserClient> | undefined;
}

export function createClient() {
  if (!globalThis.__supabase_browser_client) {
    console.log("[v0] Creating new Supabase browser client");
    globalThis.__supabase_browser_client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return globalThis.__supabase_browser_client;
}
