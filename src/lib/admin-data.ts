import type { SupabaseClient } from "@supabase/supabase-js";

type Client = SupabaseClient;

export type AdminLandlordRow = {
  id: string;
  profileId: string | null;
  name: string;
  email: string;
  joinedAt: string;
  propertyCount: number;
  tenantCount: number;
};

export type AdminLandlordDetail = {
  landlord: AdminLandlordRow;
  properties: Array<{ id: string; name: string; address: string; city: string; type: string; totalUnits: number; occupiedUnits: number }>;
  tenants: Array<{ id: string; name: string; email: string; propertyName: string; unitNumber: string; leaseEnd: string }>;
  paymentsTotal: number;
};

export async function getAdminLandlords(supabase: Client): Promise<AdminLandlordRow[]> {
  const [{ data: landlords }, { data: properties }, { data: units }, { data: tenants }] = await Promise.all([
    supabase.from("landlords").select("id,profile_id,full_name,email,created_at"),
    supabase.from("properties").select("id,landlord_id"),
    supabase.from("units").select("id,property_id"),
    supabase.from("tenants").select("id,unit_id"),
  ]);

  const propertyIdsByLandlord = new Map<string, string[]>();
  for (const property of properties ?? []) {
    const list = propertyIdsByLandlord.get(property.landlord_id) ?? [];
    list.push(property.id);
    propertyIdsByLandlord.set(property.landlord_id, list);
  }

  const unitIdsByProperty = new Map<string, string[]>();
  for (const unit of units ?? []) {
    const list = unitIdsByProperty.get(unit.property_id) ?? [];
    list.push(unit.id);
    unitIdsByProperty.set(unit.property_id, list);
  }

  const tenantCountByUnit = new Map<string, number>();
  for (const tenant of tenants ?? []) {
    tenantCountByUnit.set(tenant.unit_id, (tenantCountByUnit.get(tenant.unit_id) ?? 0) + 1);
  }

  return (landlords ?? []).map((landlord) => {
    const propertyIds = propertyIdsByLandlord.get(landlord.id) ?? [];
    let tenantCount = 0;
    for (const propertyId of propertyIds) {
      const unitIds = unitIdsByProperty.get(propertyId) ?? [];
      for (const unitId of unitIds) {
        tenantCount += tenantCountByUnit.get(unitId) ?? 0;
      }
    }

    return {
      id: landlord.id,
      profileId: landlord.profile_id,
      name: landlord.full_name,
      email: landlord.email,
      joinedAt: landlord.created_at,
      propertyCount: propertyIds.length,
      tenantCount,
    };
  });
}

export async function getAdminLandlordDetail(supabase: Client, landlordId: string): Promise<AdminLandlordDetail | null> {
  const [{ data: landlord }, { data: properties }, { data: units }, { data: tenants }, { data: payments }] = await Promise.all([
    supabase.from("landlords").select("id,profile_id,full_name,email,created_at").eq("id", landlordId).maybeSingle(),
    supabase.from("properties").select("id,name,address,city,type").eq("landlord_id", landlordId),
    supabase.from("units").select("id,property_id,unit_number,status"),
    supabase.from("tenants").select("id,unit_id,full_name,email,lease_end"),
    supabase.from("payments").select("amount,tenant_id,status"),
  ]);

  if (!landlord) return null;

  const propertyMap = new Map((properties ?? []).map((property) => [property.id, property]));
  const unitsForLandlord = (units ?? []).filter((unit) => propertyMap.has(unit.property_id));
  const unitMap = new Map(unitsForLandlord.map((unit) => [unit.id, unit]));

  const tenantsForLandlord = (tenants ?? []).filter((tenant) => unitMap.has(tenant.unit_id));
  const tenantsByUnit = new Map<string, number>();
  for (const tenant of tenantsForLandlord) {
    tenantsByUnit.set(tenant.unit_id, (tenantsByUnit.get(tenant.unit_id) ?? 0) + 1);
  }

  const paymentTotal = (payments ?? [])
    .filter((payment) => payment.status === "paid" && tenantsForLandlord.some((tenant) => tenant.id === payment.tenant_id))
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);

  const propertyRows = (properties ?? []).map((property) => {
    const propUnits = unitsForLandlord.filter((unit) => unit.property_id === property.id);
    return {
      id: property.id,
      name: property.name,
      address: property.address,
      city: property.city,
      type: property.type,
      totalUnits: propUnits.length,
      occupiedUnits: propUnits.filter((unit) => unit.status === "occupied").length,
    };
  });

  const tenantRows = tenantsForLandlord.map((tenant) => {
    const unit = unitMap.get(tenant.unit_id);
    const property = unit ? propertyMap.get(unit.property_id) : null;
    return {
      id: tenant.id,
      name: tenant.full_name,
      email: tenant.email,
      propertyName: property?.name ?? "Unknown",
      unitNumber: unit?.unit_number ?? "-",
      leaseEnd: tenant.lease_end,
    };
  });

  return {
    landlord: {
      id: landlord.id,
      profileId: landlord.profile_id,
      name: landlord.full_name,
      email: landlord.email,
      joinedAt: landlord.created_at,
      propertyCount: propertyRows.length,
      tenantCount: Array.from(tenantsByUnit.values()).reduce((a, b) => a + b, 0),
    },
    properties: propertyRows,
    tenants: tenantRows,
    paymentsTotal: paymentTotal,
  };
}

export async function getAdminOverviewStats(supabase: Client) {
  const [{ count: landlordCount }, { count: propertyCount }, { data: units }, { count: tenantCount }, { data: payments }] = await Promise.all([
    supabase.from("landlords").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("units").select("status"),
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount,status,due_date"),
  ]);

  const now = new Date();
  const currentMonthPayments = (payments ?? []).filter((payment) => {
    const dueDate = payment.due_date ? new Date(payment.due_date) : null;
    return (
      payment.status === "paid" &&
      dueDate &&
      dueDate.getUTCMonth() === now.getUTCMonth() &&
      dueDate.getUTCFullYear() === now.getUTCFullYear()
    );
  });

  return {
    landlords: landlordCount ?? 0,
    properties: propertyCount ?? 0,
    unitsTotal: units?.length ?? 0,
    unitsOccupied: (units ?? []).filter((unit) => unit.status === "occupied").length,
    tenants: tenantCount ?? 0,
    collectedThisMonth: currentMonthPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
  };
}
