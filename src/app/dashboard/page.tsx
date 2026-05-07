import {
  getDashboardStats,
  getMaintenanceSummary,
  getOccupancyData,
  getRecentPayments,
} from "@/lib/dashboard-data";
import { getLandlordScope } from "@/lib/dashboard-scope";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import DashboardView from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function Page() {
  let stats = { totalProperties: 0, occupiedText: "0/0", rentDueText: "P0", openMaintenance: 0 };
  let paymentRows: Awaited<ReturnType<typeof getRecentPayments>> = [];
  let maintenanceRows: Awaited<ReturnType<typeof getMaintenanceSummary>> = [];
  let occupancyData: Awaited<ReturnType<typeof getOccupancyData>> = [];

  try {
    const supabase = createSupabaseServerComponentClient();
    const scope = await getLandlordScope(supabase);
    [stats, paymentRows, maintenanceRows, occupancyData] = await Promise.all([
      getDashboardStats(supabase, scope),
      getRecentPayments(supabase, scope),
      getMaintenanceSummary(supabase, scope),
      getOccupancyData(supabase, scope),
    ]);
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }

  return <DashboardView stats={stats} paymentRows={paymentRows} maintenanceRows={maintenanceRows} occupancyData={occupancyData} />;
}
