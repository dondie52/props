import type { SupabaseClient } from "@supabase/supabase-js";
import type { LandlordScope } from "@/lib/dashboard-scope";

export type StatusValue =
  | "paid"
  | "pending"
  | "overdue"
  | "occupied"
  | "vacant"
  | "active"
  | "expiring"
  | "open"
  | "in-progress"
  | "resolved"
  | "high"
  | "medium"
  | "low";

export type DashboardPaymentRow = {
  tenant: string;
  property: string;
  unit: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "overdue";
};

export type DashboardMaintenanceRow = {
  category: string;
  unit: string;
  urgency: "high" | "medium" | "low";
};

const currency = new Intl.NumberFormat("en-BW", {
  style: "currency",
  currency: "BWP",
  maximumFractionDigits: 0,
});

const formatMoney = (value: number) => currency.format(value).replace("BWP", "P").trim();

const mapPaymentStatus = (status: string): "paid" | "pending" | "overdue" =>
  status === "paid" || status === "pending" || status === "overdue" ? status : "pending";

const mapUrgency = (urgency: string): "high" | "medium" | "low" =>
  urgency === "high" || urgency === "medium" || urgency === "low" ? urgency : "low";

type Client = SupabaseClient;
type QueryResult<T> = { data: T | null; error: { message: string } | null };

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function requireData<T>(result: QueryResult<T>, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data ?? ([] as T);
}

export async function getDashboardStats(supabase: Client, scope: LandlordScope) {
  if (!scope.landlordId) {
    return {
      totalProperties: 0,
      occupiedText: "0/0",
      rentDueText: formatMoney(0),
      openMaintenance: 0,
    };
  }

  const emptyStats = {
    totalProperties: scope.propertyIds.length,
    occupiedText: "0/0",
    rentDueText: formatMoney(0),
    openMaintenance: 0,
  };

  if (scope.propertyIds.length === 0) {
    return emptyStats;
  }

  if (scope.unitIds.length === 0) {
    return emptyStats;
  }

  const [unitsResult, paymentsResult, maintenanceResult] = await Promise.all([
    supabase.from("units").select("id,status").in("id", scope.unitIds),
    scope.tenantIds.length
      ? supabase.from("payments").select("id,amount,status").in("tenant_id", scope.tenantIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("maintenance_requests").select("id,status").in("unit_id", scope.unitIds),
  ]);

  const allUnits = requireData(unitsResult, "Dashboard units query");
  const payments = requireData(paymentsResult, "Dashboard payments query");
  const maintenance = requireData(maintenanceResult, "Dashboard maintenance query");

  const occupiedCount = allUnits.filter((unit) => unit.status === "occupied").length;
  const totalUnits = allUnits.length;
  const openMaintenance = maintenance.filter((request) => request.status !== "resolved").length;
  const pendingRent = payments
    .filter((payment) => payment.status !== "paid")
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);

  return {
    totalProperties: scope.propertyIds.length,
    occupiedText: `${occupiedCount}/${totalUnits || 0}`,
    rentDueText: formatMoney(pendingRent),
    openMaintenance,
  };
}

export async function getRecentPayments(supabase: Client, scope: LandlordScope, limit = 5): Promise<DashboardPaymentRow[]> {
  if (!scope.landlordId || scope.tenantIds.length === 0) return [];

  const result = await supabase
    .from("payments")
    .select("amount,payment_date,status,tenants(full_name,units(unit_number,properties(name)))")
    .in("tenant_id", scope.tenantIds)
    .order("payment_date", { ascending: false })
    .limit(limit);
  const data = requireData(result, "Recent payments query");

  return data.map((row) => {
    const rowObj = row as unknown as { tenants?: unknown; amount?: unknown; payment_date?: unknown; status?: unknown };
    const tenant = first(rowObj.tenants as unknown as { full_name?: unknown; units?: unknown } | { full_name?: unknown; units?: unknown }[]);
    const unit = tenant
      ? first(tenant.units as unknown as { unit_number?: unknown; properties?: unknown } | { unit_number?: unknown; properties?: unknown }[])
      : null;
    const property = unit
      ? first(unit.properties as unknown as { name?: unknown } | { name?: unknown }[])
      : null;

    return {
      tenant: (tenant?.full_name as string | undefined) ?? "Unknown",
      property: (property?.name as string | undefined) ?? "Unknown",
      unit: (unit?.unit_number as string | undefined) ?? "-",
      amount: formatMoney(Number(rowObj.amount ?? 0)),
      date: (rowObj.payment_date as string | undefined) ?? "-",
      status: mapPaymentStatus(String(rowObj.status ?? "pending")),
    };
  });
}

export async function getMaintenanceSummary(supabase: Client, scope: LandlordScope, limit = 3): Promise<DashboardMaintenanceRow[]> {
  if (!scope.landlordId || scope.unitIds.length === 0) return [];

  const result = await supabase
    .from("maintenance_requests")
    .select("category,urgency,units(unit_number)")
    .in("unit_id", scope.unitIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  const data = requireData(result, "Maintenance summary query");

  return data.map((row) => {
    const rowObj = row as unknown as { units?: unknown; category?: unknown; urgency?: unknown };
    const unit = first(rowObj.units as unknown as { unit_number?: unknown } | { unit_number?: unknown }[]);

    return {
      category: (rowObj.category as string | undefined) ?? "General",
      unit: (unit?.unit_number as string | undefined) ?? "-",
      urgency: mapUrgency(String(rowObj.urgency ?? "low")),
    };
  });
}

export async function getOccupancyData(supabase: Client, scope: LandlordScope) {
  if (!scope.landlordId || scope.propertyIds.length === 0) return [];

  const [propertiesResult, unitsResult] = await Promise.all([
    supabase.from("properties").select("id,name").in("id", scope.propertyIds),
    supabase.from("units").select("id,property_id,status").in("property_id", scope.propertyIds),
  ]);
  const properties = requireData(propertiesResult, "Occupancy properties query");
  const units = requireData(unitsResult, "Occupancy units query");

  const unitsByProperty = new Map<string, number>();
  for (const unit of units) {
    const unitObj = unit as unknown as { status?: unknown; property_id?: unknown };
    if (unitObj.status !== "occupied") continue;
    const propertyId = String(unitObj.property_id ?? "");
    unitsByProperty.set(propertyId, (unitsByProperty.get(propertyId) ?? 0) + 1);
  }

  return properties.map((property) => ({
    name: String((property as unknown as { name?: unknown }).name ?? ""),
    occupied: unitsByProperty.get(String((property as unknown as { id?: unknown }).id ?? "")) ?? 0,
  }));
}
