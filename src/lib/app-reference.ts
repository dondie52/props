import { fetchReferenceValues } from "@/lib/fetch-reference-values";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export { fetchReferenceValues } from "@/lib/fetch-reference-values";

export async function getOnboardingReferenceLists(): Promise<{ cities: string[]; propertyTypes: string[] }> {
  const supabase = createSupabaseServerComponentClient();
  const [cities, propertyTypes] = await Promise.all([
    fetchReferenceValues(supabase, "city"),
    fetchReferenceValues(supabase, "property_type"),
  ]);
  return { cities, propertyTypes };
}
