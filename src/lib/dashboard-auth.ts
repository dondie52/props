import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { LandlordScope } from "@/lib/dashboard-scope";
import type { UserRole } from "@/types";

type DashboardProfile = {
  id: string;
  role: UserRole;
  full_name?: string | null;
  email?: string | null;
};

function toIds(rows: Array<{ id?: unknown }> | null | undefined): string[] {
  return (rows ?? []).map((row) => String(row.id ?? "")).filter(Boolean);
}

export async function getAuthProfile(supabase: SupabaseClient, user: User): Promise<DashboardProfile | null> {
  const { data: directProfile } = await supabase
    .from("profiles")
    .select("id,role,full_name,email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (directProfile) return directProfile as DashboardProfile;

  const email = user.email?.trim().toLowerCase();
  if (!email) return null;

  const { data: fallbackProfile } = await supabase
    .from("profiles")
    .select("id,role,full_name,email")
    .eq("email", email)
    .is("auth_user_id", null)
    .maybeSingle();

  return (fallbackProfile as DashboardProfile | null) ?? null;
}

export async function getDashboardSession(supabase: SupabaseClient): Promise<{
  user: User | null;
  profile: DashboardProfile | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  return {
    user,
    profile: await getAuthProfile(supabase, user),
  };
}

export async function getLandlordScopeForProfile(
  supabase: SupabaseClient,
  profile: DashboardProfile | null,
): Promise<LandlordScope> {
  if (!profile || profile.role !== "landlord") {
    return { landlordId: null, propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const { data: landlord } = await supabase.from("landlords").select("id").eq("profile_id", profile.id).maybeSingle();
  if (!landlord?.id) {
    return { landlordId: null, propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const landlordId = String(landlord.id);
  const { data: properties } = await supabase.from("properties").select("id").eq("landlord_id", landlordId);
  const propertyIds = toIds(properties as Array<{ id?: unknown }>);
  if (propertyIds.length === 0) {
    return { landlordId, propertyIds: [], unitIds: [], tenantIds: [] };
  }

  const { data: units } = await supabase.from("units").select("id").in("property_id", propertyIds);
  const unitIds = toIds(units as Array<{ id?: unknown }>);
  if (unitIds.length === 0) {
    return { landlordId, propertyIds, unitIds: [], tenantIds: [] };
  }

  const { data: tenants } = await supabase.from("tenants").select("id").in("unit_id", unitIds);
  const tenantIds = toIds(tenants as Array<{ id?: unknown }>);

  return { landlordId, propertyIds, unitIds, tenantIds };
}

export async function getDashboardAuthScope(supabase: SupabaseClient) {
  const session = await getDashboardSession(supabase);
  const scope = await getLandlordScopeForProfile(supabase, session.profile);
  return { ...session, scope };
}
