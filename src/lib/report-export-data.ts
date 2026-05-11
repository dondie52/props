import type { SupabaseClient } from "@supabase/supabase-js";
import type { LandlordScope } from "@/lib/dashboard-scope";
import type { PaymentExportRow, TenantExportRow } from "@/lib/report-xml";

function normalizePaymentStatus(value: unknown): "paid" | "pending" | "overdue" {
  return value === "paid" || value === "pending" || value === "overdue" ? value : "pending";
}

function tenantStatusFromLeaseEnd(leaseEnd: unknown): TenantExportRow["status"] {
  const leaseEndDate = leaseEnd ? new Date(String(leaseEnd)) : null;
  if (!leaseEndDate || Number.isNaN(leaseEndDate.getTime())) return "active";
  const daysToEnd = Math.ceil((leaseEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToEnd < 0) return "overdue";
  if (daysToEnd <= 60) return "expiring";
  return "active";
}

export async function fetchPaymentExportRows(
  supabase: SupabaseClient,
  scope: LandlordScope,
): Promise<PaymentExportRow[]> {
  if (!scope.landlordId || scope.tenantIds.length === 0) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("amount,due_date,payment_date,method,status,tenants(full_name,units(unit_number,properties(name)))")
    .in("tenant_id", scope.tenantIds)
    .order("due_date", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const rowObj = row as unknown as {
      tenants?: unknown;
      amount?: unknown;
      due_date?: unknown;
      payment_date?: unknown;
      method?: unknown;
      status?: unknown;
    };
    const tenant = Array.isArray(rowObj.tenants) ? rowObj.tenants[0] : rowObj.tenants;
    const tenantObj = tenant as { full_name?: unknown; units?: unknown } | null;
    const unit = tenantObj?.units && Array.isArray(tenantObj.units) ? tenantObj.units[0] : tenantObj?.units;
    const unitObj = unit as { unit_number?: unknown; properties?: unknown } | null;
    const property = unitObj?.properties && Array.isArray(unitObj.properties) ? unitObj.properties[0] : unitObj?.properties;
    const propertyObj = property as { name?: unknown } | null;
    const status = normalizePaymentStatus(rowObj.status);

    return {
      tenant: String(tenantObj?.full_name ?? "Unknown"),
      property: String(propertyObj?.name ?? "Unknown"),
      unit: String(unitObj?.unit_number ?? "-"),
      amount: Number(rowObj.amount ?? 0),
      dueDate: (rowObj.due_date as string | undefined) ?? "-",
      paymentDate: status === "paid" ? ((rowObj.payment_date as string | undefined) ?? "-") : "-",
      method: String(rowObj.method ?? ""),
      status,
    };
  });
}

export async function fetchTenantExportRows(
  supabase: SupabaseClient,
  scope: LandlordScope,
): Promise<TenantExportRow[]> {
  if (!scope.landlordId || scope.unitIds.length === 0) return [];

  const { data, error } = await supabase
    .from("tenants")
    .select("id,full_name,email,lease_start,lease_end,units(unit_number,rent_amount,properties(name))")
    .in("unit_id", scope.unitIds)
    .order("lease_end", { ascending: true });

  if (error || !data) return [];

  return data.map((tenant) => {
    const tenantObj = tenant as unknown as {
      id?: unknown;
      full_name?: unknown;
      email?: unknown;
      lease_start?: unknown;
      lease_end?: unknown;
      units?: unknown;
    };
    const unit = Array.isArray(tenantObj.units) ? tenantObj.units[0] : tenantObj.units;
    const unitObj = unit as { unit_number?: unknown; rent_amount?: unknown; properties?: unknown } | null;
    const property = unitObj?.properties && Array.isArray(unitObj.properties) ? unitObj.properties[0] : unitObj?.properties;
    const propertyObj = property as { name?: unknown } | null;

    return {
      id: String(tenantObj.id ?? ""),
      name: String(tenantObj.full_name ?? "Unknown"),
      email: String(tenantObj.email ?? ""),
      property: String(propertyObj?.name ?? "Unknown"),
      unit: String(unitObj?.unit_number ?? "-"),
      rentAmount: Number(unitObj?.rent_amount ?? 0),
      leaseStart: (tenantObj.lease_start as string | undefined) ?? "-",
      leaseEnd: (tenantObj.lease_end as string | undefined) ?? "-",
      status: tenantStatusFromLeaseEnd(tenantObj.lease_end),
    };
  });
}
