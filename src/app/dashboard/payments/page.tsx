import PaymentsClient, { type PaymentRow, type PaymentTenantOption } from "@/app/dashboard/payments/PaymentsClient";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function normalizePaymentStatus(value: unknown): PaymentRow["status"] {
  return value === "paid" || value === "pending" || value === "overdue" ? value : "pending";
}

export default async function Page() {
  const supabase = createSupabaseServerComponentClient();
  const { scope } = await getDashboardAuthScope(supabase);
  let rows: PaymentRow[] = [];
  let tenantOptions: PaymentTenantOption[] = [];

  if (scope.landlordId && scope.tenantIds.length > 0) {
    const [{ data }, { data: tenantData }] = await Promise.all([
      supabase
        .from("payments")
        .select("amount,due_date,payment_date,method,status,tenants(full_name,units(unit_number,properties(name)))")
        .in("tenant_id", scope.tenantIds)
        .order("due_date", { ascending: false }),
      supabase
        .from("tenants")
        .select("id,full_name,units(unit_number,properties(name))")
        .in("id", scope.tenantIds)
        .order("full_name", { ascending: true }),
    ]);

    rows = (data ?? []).map((row) => {
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
        due: (rowObj.due_date as string | undefined) ?? "-",
        paid: status === "paid" ? ((rowObj.payment_date as string | undefined) ?? "-") : "-",
        method: String(rowObj.method ?? ""),
        status,
      };
    });

    tenantOptions = (tenantData ?? []).map((tenant) => {
      const tenantObj = tenant as unknown as {
        id?: unknown;
        full_name?: unknown;
        units?: unknown;
      };
      const unit = Array.isArray(tenantObj.units) ? tenantObj.units[0] : tenantObj.units;
      const unitObj = unit as { unit_number?: unknown; properties?: unknown } | null;
      const property = unitObj?.properties && Array.isArray(unitObj.properties) ? unitObj.properties[0] : unitObj?.properties;
      const propertyObj = property as { name?: unknown } | null;

      return {
        id: String(tenantObj.id ?? ""),
        name: String(tenantObj.full_name ?? "Unknown"),
        property: String(propertyObj?.name ?? "Unknown"),
        unit: String(unitObj?.unit_number ?? "-"),
      };
    });
  }

  return <PaymentsClient initialRows={rows} tenantOptions={tenantOptions} />;
}
