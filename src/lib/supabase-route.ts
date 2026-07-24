import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { getSupabaseClientCredentials } from "@/lib/supabase-env";

/** Supabase client for App Router Route Handlers (cookie session). */
export function createSupabaseRouteHandlerClient() {
  const cookieStore = nextCookies();
  const { url, anonKey } = getSupabaseClientCredentials();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
