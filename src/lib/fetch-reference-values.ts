import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchReferenceValues(
  supabase: SupabaseClient,
  category: "city" | "property_type",
): Promise<string[]> {
  const { data, error } = await supabase
    .from("app_reference_items")
    .select("value")
    .eq("category", category)
    .order("sort_order", { ascending: true });
  if (error) {
    console.warn("[fetchReferenceValues]", category, error.message);
    return [];
  }
  return (data ?? []).map((row) => row.value);
}
