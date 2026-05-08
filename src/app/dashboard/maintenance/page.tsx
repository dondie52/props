import MaintenanceClient, { type Ticket } from "@/app/dashboard/maintenance/MaintenanceClient";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function normalizeUrgency(value: unknown): Ticket["urgency"] {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}

function normalizeStatus(value: unknown): Ticket["status"] {
  return value === "open" || value === "in-progress" || value === "resolved" ? value : "open";
}

export default async function Page() {
  const supabase = createSupabaseServerComponentClient();
  const { scope } = await getDashboardAuthScope(supabase);
  let tickets: Ticket[] = [];

  if (scope.landlordId && scope.unitIds.length > 0) {
    const { data } = await supabase
      .from("maintenance_requests")
      .select("id,category,description,urgency,status,created_at,units(unit_number,properties(name))")
      .in("unit_id", scope.unitIds)
      .order("created_at", { ascending: false });

    tickets = (data ?? []).map((row) => {
      const rowObj = row as unknown as {
        id?: unknown;
        category?: unknown;
        description?: unknown;
        urgency?: unknown;
        status?: unknown;
        created_at?: unknown;
        units?: unknown;
      };
      const unit = Array.isArray(rowObj.units) ? rowObj.units[0] : rowObj.units;
      const unitObj = unit as { unit_number?: unknown; properties?: unknown } | null;
      const property = unitObj?.properties && Array.isArray(unitObj.properties) ? unitObj.properties[0] : unitObj?.properties;
      const propertyObj = property as { name?: unknown } | null;

      return {
        id: String(rowObj.id ?? ""),
        title: (rowObj.description as string | undefined) ?? (rowObj.category as string | undefined) ?? "Maintenance issue",
        property: String(propertyObj?.name ?? "Unknown property"),
        unit: String(unitObj?.unit_number ?? "-"),
        category: String(rowObj.category ?? "General"),
        createdAt: String(rowObj.created_at ?? "").slice(0, 10) || "-",
        urgency: normalizeUrgency(rowObj.urgency),
        status: normalizeStatus(rowObj.status),
      };
    });
  }

  return <MaintenanceClient initialTickets={tickets} />;
}
