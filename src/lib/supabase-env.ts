/** Shared env helpers for Supabase clients (URL + anon/publishable key). */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  return { url, anonKey };
}

/** True when public Supabase credentials are configured. */
export function hasSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey);
}

/**
 * Credentials for client construction.
 * During `next build` without secrets, use placeholders so module evaluation
 * does not crash; runtime requests still need real env vars.
 */
export function getSupabaseClientCredentials() {
  const { url, anonKey } = getSupabaseEnv();
  if (url && anonKey) {
    return { url, anonKey };
  }

  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to your environment.",
    );
  }

  return {
    url: url || "https://placeholder.supabase.co",
    anonKey: anonKey || "public-anon-key",
  };
}
