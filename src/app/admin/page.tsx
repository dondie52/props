import DashboardShell from "@/components/layout/DashboardShell";
import StatCard from "@/components/ui/StatCard";
import { Building2, Link2, Unlink, Users } from "lucide-react";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import { getAdminOverviewStats } from "@/lib/admin-data";

export default async function AdminPage() {
  const supabase = createSupabaseServerComponentClient();
  const stats = await getAdminOverviewStats(supabase);

  return (
    <DashboardShell title="Admin Overview" variant="admin">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={String(stats.users)} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Landlords" value={String(stats.landlords)} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Properties" value={String(stats.properties)} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Tenants" value={String(stats.tenants)} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatCard title="Linked Profiles" value={String(stats.profilesLinked)} icon={<Link2 className="h-5 w-5" />} />
        <StatCard title="Unlinked Profiles" value={String(stats.profilesUnlinked)} icon={<Unlink className="h-5 w-5" />} />
      </div>
    </DashboardShell>
  );
}
