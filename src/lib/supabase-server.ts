import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/auth-helpers-nextjs";

export function createSupabaseServerComponentClient() {
  const cookieStore = nextCookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore as unknown as CookieMethodsServer },
  );
}

export function createSupabaseServerActionClient() {
  const cookieStore = nextCookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore as unknown as CookieMethodsServer },
  );
}
