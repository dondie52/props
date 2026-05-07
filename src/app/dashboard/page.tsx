import {
  getDashboardStats,
  getMaintenanceSummary,
  getOccupancyData,
  getRecentPayments,
} from "@/lib/dashboard-data";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import DashboardView from "@/components/dashboard/DashboardView";

export default async function Page() {
  let stats = { totalProperties: 0, occupiedText: "0/0", rentDueText: "P0", openMaintenance: 0 };
  let paymentRows: Awaited<ReturnType<typeof getRecentPayments>> = [];
  let maintenanceRows: Awaited<ReturnType<typeof getMaintenanceSummary>> = [];
  let occupancyData: Awaited<ReturnType<typeof getOccupancyData>> = [];

  try {
    const supabase = createSupabaseServerComponentClient();
    [stats, paymentRows, maintenanceRows, occupancyData] = await Promise.all([
      getDashboardStats(supabase),
      getRecentPayments(supabase),
      getMaintenanceSummary(supabase),
      getOccupancyData(supabase),
    ]);
  } catch {
    // Build-time / missing env / auth cookies: fall back to safe empty UI.
  }

  return <DashboardView stats={stats} paymentRows={paymentRows} maintenanceRows={maintenanceRows} occupancyData={occupancyData} />;
}
