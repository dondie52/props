"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerActionClient } from "@/lib/supabase-server";

function requireText(value: string, field: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required.`);
  return trimmed;
}

async function assertCanManageUnit(supabase: ReturnType<typeof createSupabaseServerActionClient>, unitId: string) {
  const { data: unit, error } = await supabase.from("units").select("id,property_id").eq("id", unitId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!unit?.id) throw new Error("Unit not found for this account.");
  return unit;
}

export async function addUnitAction(input: { propertyId: string; unitNumber: string; rentAmount: number }) {
  const propertyId = requireText(input.propertyId, "Property");
  const unitNumber = requireText(input.unitNumber, "Unit number");
  const rentAmount = Math.max(0, Number(input.rentAmount ?? 0));

  const supabase = createSupabaseServerActionClient();
  const { error } = await supabase.from("units").insert({
    property_id: propertyId,
    unit_number: unitNumber,
    rent_amount: rentAmount,
    status: "vacant",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function assignTenantToUnitAction(input: {
  unitId: string;
  fullName: string;
  email: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount?: number | null;
  createInvite?: boolean;
}) {
  const unitId = requireText(input.unitId, "Unit");
  const fullName = requireText(input.fullName, "Tenant name");
  const email = requireText(input.email, "Tenant email").toLowerCase();
  const leaseStart = requireText(input.leaseStart, "Lease start");
  const leaseEnd = requireText(input.leaseEnd, "Lease end");

  if (new Date(leaseEnd) < new Date(leaseStart)) {
    throw new Error("Lease end must be after lease start.");
  }

  const supabase = createSupabaseServerActionClient();
  const unit = await assertCanManageUnit(supabase, unitId);

  const { data: existingTenant, error: existingError } = await supabase
    .from("tenants")
    .select("id")
    .eq("unit_id", unitId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existingTenant?.id) throw new Error("This unit already has a tenant.");

  const { data: propertyUnits, error: propertyUnitsError } = await supabase
    .from("units")
    .select("id,unit_number,properties(name)")
    .eq("property_id", unit.property_id);
  if (propertyUnitsError) throw new Error(propertyUnitsError.message);

  const propertyUnitIds = (propertyUnits ?? []).map((row) => row.id);
  const { data: propertyTenants, error: propertyTenantsError } = propertyUnitIds.length
    ? await supabase.from("tenants").select("id,email,unit_id").in("unit_id", propertyUnitIds)
    : { data: [], error: null };
  if (propertyTenantsError) throw new Error(propertyTenantsError.message);

  const tenantWithEmail = (propertyTenants ?? []).find((tenant) => tenant.email.trim().toLowerCase() === email);
  if (tenantWithEmail?.id) {
    const assignedUnit = (propertyUnits ?? []).find((row) => row.id === tenantWithEmail.unit_id);
    const row = assignedUnit as unknown as { unit_number?: unknown; properties?: unknown } | undefined;
    const property = row?.properties && Array.isArray(row.properties) ? row.properties[0] : row?.properties;
    const propertyObj = property as { name?: unknown } | null;
    const assignedPlace = [propertyObj?.name, row?.unit_number ? `Unit ${row.unit_number}` : null].filter(Boolean).join(" - ");
    throw new Error(`This tenant email is already assigned${assignedPlace ? ` to ${assignedPlace}` : " to another unit"}.`);
  }

  const { data: tenantWithEmailOutsideProperty, error: tenantEmailError } = await supabase
    .from("tenants")
    .select("id,email,unit_id,units(unit_number,properties(name))")
    .ilike("email", email);
  if (tenantEmailError) throw new Error(tenantEmailError.message);
  const outsideMatch = (tenantWithEmailOutsideProperty ?? []).find((tenant) => String(tenant.email ?? "").trim().toLowerCase() === email);
  if (outsideMatch?.id) {
    const row = outsideMatch as unknown as { units?: unknown };
    const tenantUnit = Array.isArray(row.units) ? row.units[0] : row.units;
    const tenantUnitObj = tenantUnit as { unit_number?: unknown; properties?: unknown } | null;
    const tenantProperty = tenantUnitObj?.properties && Array.isArray(tenantUnitObj.properties) ? tenantUnitObj.properties[0] : tenantUnitObj?.properties;
    const tenantPropertyObj = tenantProperty as { name?: unknown } | null;
    const assignedPlace = [tenantPropertyObj?.name, tenantUnitObj?.unit_number ? `Unit ${tenantUnitObj.unit_number}` : null]
      .filter(Boolean)
      .join(" - ");
    throw new Error(`This tenant email is already assigned${assignedPlace ? ` to ${assignedPlace}` : " to another unit"}.`);
  }

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id,auth_user_id")
    .eq("email", email)
    .maybeSingle();
  if (profileLookupError) throw new Error(profileLookupError.message);

  if (!existingProfile?.id && !input.createInvite) {
    return {
      ok: false,
      needsInvite: true,
      message: "No tenant account exists for this email yet.",
    };
  }

  const { error: tenantError } = await supabase.from("tenants").insert({
    unit_id: unitId,
    full_name: fullName,
    email,
    lease_start: leaseStart,
    lease_end: leaseEnd,
  });
  if (tenantError) throw new Error(tenantError.message);

  if (existingProfile?.id) {
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, role: "tenant" })
      .eq("id", existingProfile.id)
      .is("auth_user_id", null);
    if (profileUpdateError) {
      console.warn("Tenant profile could not be updated during assignment.", profileUpdateError.message);
    }
  } else {
    const { error: profileInsertError } = await supabase.from("profiles").insert({
      full_name: fullName,
      email,
      role: "tenant",
    });
    if (profileInsertError) {
      console.warn("Pending tenant profile could not be created. The tenant auth signup can create it later.", profileInsertError.message);
    }
  }

  const update: { status: string; rent_amount?: number } = { status: "occupied" };
  if (input.rentAmount !== null && input.rentAmount !== undefined && String(input.rentAmount) !== "") {
    update.rent_amount = Math.max(0, Number(input.rentAmount));
  }

  const { error: unitError } = await supabase.from("units").update(update).eq("id", unitId);
  if (unitError) throw new Error(unitError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${unit.property_id}`);
  return { ok: true, needsInvite: false };
}
