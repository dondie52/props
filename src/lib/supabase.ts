import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseClientCredentials } from "@/lib/supabase-env";

const { url, anonKey } = getSupabaseClientCredentials();

/** Browser Supabase client (singleton via @supabase/ssr). */
export const supabase = createBrowserClient(url, anonKey);

export function createClient() {
  return supabase;
}
