import DashboardShell from "@/components/layout/DashboardShell";
import StatCard from "@/components/ui/StatCard";
import { Building2, CreditCard, Users } from "lucide-react";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import { getAdminOverviewStats } from "@/lib/admin-data";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(value)
    .replace("BWP", "P")
    .trim();

export default async function AdminPage() {
  const supabase = createSupabaseServerComponentClient();
  const stats = await getAdminOverviewStats(supabase);

  return (
    <DashboardShell title="Admin Overview" variant="admin">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Landlords"
          value={String(stats.landlords)}
          icon={<Users className="h-5 w-5" />}
          href="/admin/landlords"
        />
        <StatCard
          title="Properties"
          value={String(stats.properties)}
          icon={<Building2 className="h-5 w-5" />}
          href="/admin/properties"
        />
        <StatCard
          title="Tenants"
          value={String(stats.tenants)}
          icon={<Users className="h-5 w-5" />}
          href="/admin/tenants"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatCard
          title="Occupied Units"
          value={`${stats.unitsOccupied}/${stats.unitsTotal}`}
          icon={<Building2 className="h-5 w-5" />}
          href="/admin/properties"
        />
        <StatCard title="Collected This Month" value={formatMoney(stats.collectedThisMonth)} icon={<CreditCard className="h-5 w-5" />} />
      </div>
    </DashboardShell>
  );
}
