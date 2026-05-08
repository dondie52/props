import TenantsClient, { type TenantRow } from "@/app/dashboard/tenants/TenantsClient";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-BW", {
  style: "currency",
  currency: "BWP",
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return currency.format(value).replace("BWP", "P").trim();
}

function statusFromLeaseEnd(leaseEnd: unknown): TenantRow["status"] {
  const leaseEndDate = leaseEnd ? new Date(String(leaseEnd)) : null;
  if (!leaseEndDate) return "active";
  const daysToEnd = Math.ceil((leaseEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToEnd < 0) return "overdue";
  if (daysToEnd <= 60) return "expiring";
  return "active";
}

export default async function Page() {
  const supabase = createSupabaseServerComponentClient();
  const { scope } = await getDashboardAuthScope(supabase);
  let tenants: TenantRow[] = [];

  if (scope.landlordId && scope.unitIds.length > 0) {
    const { data } = await supabase
      .from("tenants")
      .select("id,full_name,email,lease_end,units(unit_number,rent_amount,properties(name))")
      .in("unit_id", scope.unitIds)
      .order("lease_end", { ascending: true });

    tenants = (data ?? []).map((tenant) => {
      const tenantObj = tenant as unknown as {
        id?: unknown;
        full_name?: unknown;
        email?: unknown;
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
        rent: formatMoney(Number(unitObj?.rent_amount ?? 0)),
        leaseEnd: (tenantObj.lease_end as string | undefined) ?? "-",
        status: statusFromLeaseEnd(tenantObj.lease_end),
      };
    });
  }

  return <TenantsClient initialTenants={tenants} />;
}
