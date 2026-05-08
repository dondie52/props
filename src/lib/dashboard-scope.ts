import type { SupabaseClient } from "@supabase/supabase-js";
import { getDashboardSession, getLandlordScopeForProfile } from "@/lib/dashboard-auth";

export type LandlordScope = {
  landlordId: string | null;
  propertyIds: string[];
  unitIds: string[];
  tenantIds: string[];
};

export async function getLandlordScope(supabase: SupabaseClient): Promise<LandlordScope> {
  const { profile } = await getDashboardSession(supabase);
  return getLandlordScopeForProfile(supabase, profile);
}
