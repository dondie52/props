import type { SupabaseClient } from "@supabase/supabase-js";

export type LandlordScope = {
  landlordId: string | null;
  propertyIds: string[];
  unitIds: string[];
  tenantIds: string[];
};

function toIds(rows: Array<{ id?: unknown }> | null | undefined): string[] {
  return (rows ?? []).map((row) => String(row.id ?? "")).filter(Boolean);
}

export async function getLandlordScope(supabase: SupabaseClient): Promise<LandlordScope> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { landlordId: null, propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "landlord") {
    return { landlordId: null, propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const { data: landlord } = await supabase.from("landlords").select("id").eq("profile_id", profile.id).maybeSingle();
  if (!landlord?.id) {
    return { landlordId: null, propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const { data: properties } = await supabase.from("properties").select("id").eq("landlord_id", landlord.id);
  const propertyIds = toIds(properties as Array<{ id?: unknown }>);
  if (propertyIds.length === 0) {
    return { landlordId: String(landlord.id), propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const { data: units } = await supabase.from("units").select("id").in("property_id", propertyIds);
  const unitIds = toIds(units as Array<{ id?: unknown }>);
  if (unitIds.length === 0) {
    return { landlordId: String(landlord.id), propertyIds, unitIds: [], tenantIds: [] };
  }

  const { data: tenants } = await supabase.from("tenants").select("id").in("unit_id", unitIds);
  const tenantIds = toIds(tenants as Array<{ id?: unknown }>);

  return {
    landlordId: String(landlord.id),
    propertyIds,
    unitIds,
    tenantIds,
  };
}
