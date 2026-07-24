import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { getSupabaseClientCredentials } from "@/lib/supabase-env";

export function createSupabaseServerComponentClient() {
  const cookieStore = nextCookies();
  const { url, anonKey } = getSupabaseClientCredentials();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies; middleware refreshes them.
        }
      },
    },
  });
}

export function createSupabaseServerActionClient() {
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
