import PropertiesClient, { type PropertyCardRow } from "@/app/dashboard/properties/PropertiesClient";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";

export default async function Page() {
  const supabase = createSupabaseServerComponentClient();
  const { scope } = await getDashboardAuthScope(supabase);

  let rows: PropertyCardRow[] = [];
  if (scope.landlordId && scope.propertyIds.length > 0) {
    const [{ data: propertyData }, { data: unitData }] = await Promise.all([
      supabase.from("properties").select("id,name,address,city,type").in("id", scope.propertyIds).order("created_at", { ascending: false }),
      supabase.from("units").select("id,property_id,status").in("property_id", scope.propertyIds),
    ]);

    const unitTotals = new Map<string, { total: number; occupied: number }>();
    for (const unit of unitData ?? []) {
      const current = unitTotals.get(unit.property_id) ?? { total: 0, occupied: 0 };
      current.total += 1;
      if (unit.status === "occupied") current.occupied += 1;
      unitTotals.set(unit.property_id, current);
    }

    rows = (propertyData ?? []).map((property) => {
      const unitCounts = unitTotals.get(property.id) ?? { total: 0, occupied: 0 };
      return {
        id: property.id,
        name: property.name,
        address: `${property.address}, ${property.city}`,
        type: property.type,
        totalHouses: 0,
        totalBedrooms: 0,
        totalUnits: unitCounts.total,
        occupiedUnits: unitCounts.occupied,
        occupancy: unitCounts.total ? Math.round((unitCounts.occupied / unitCounts.total) * 100) : 0,
      };
    });
  }

  return <PropertiesClient initialProperties={rows} />;
}
