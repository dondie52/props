import { DEFAULT_ONBOARDING_CITIES, DEFAULT_PROPERTY_TYPES } from "@/lib/default-reference-values";
import { fetchReferenceValues } from "@/lib/fetch-reference-values";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export { fetchReferenceValues } from "@/lib/fetch-reference-values";

export async function getOnboardingReferenceLists(): Promise<{ cities: string[]; propertyTypes: string[] }> {
  const supabase = createSupabaseServerComponentClient();
  try {
    const [cities, propertyTypes] = await Promise.all([
      fetchReferenceValues(supabase, "city"),
      fetchReferenceValues(supabase, "property_type"),
    ]);
    return {
      cities: cities.length ? cities : DEFAULT_ONBOARDING_CITIES,
      propertyTypes: propertyTypes.length ? propertyTypes : DEFAULT_PROPERTY_TYPES,
    };
  } catch (e) {
    console.warn("[getOnboardingReferenceLists]", e);
    return { cities: DEFAULT_ONBOARDING_CITIES, propertyTypes: DEFAULT_PROPERTY_TYPES };
  }
}
