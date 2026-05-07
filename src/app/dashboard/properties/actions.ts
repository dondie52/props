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

  const { error: tenantError } = await supabase.from("tenants").insert({
    unit_id: unitId,
    full_name: fullName,
    email,
    lease_start: leaseStart,
    lease_end: leaseEnd,
  });
  if (tenantError) throw new Error(tenantError.message);

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
  return { ok: true };
}
