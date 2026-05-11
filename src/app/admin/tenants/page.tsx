import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import { getAdminTenants } from "@/lib/admin-data";

export default async function AdminTenantsPage() {
  const supabase = createSupabaseServerComponentClient();
  const tenants = await getAdminTenants(supabase);

  return (
    <DashboardShell title="Tenants" variant="admin">
      <Card className="p-0 sm:p-0">
        <div className="mb-4 flex items-center justify-between p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-primary">All Tenants</h2>
          <p className="text-sm text-text-muted">{tenants.length} total</p>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Property</th>
                <th className="pb-3">Unit</th>
                <th className="pb-3">Lease End</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.profileId} className="border-t border-border-ghost">
                  <td className="py-3">{tenant.name}</td>
                  <td>{tenant.email}</td>
                  <td>{tenant.propertyName ?? "Unassigned"}</td>
                  <td>{tenant.unitNumber ?? "-"}</td>
                  <td>{tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 sm:p-6 md:hidden">
          {tenants.map((tenant) => (
            <article key={tenant.profileId} className="rounded-base border border-border-ghost bg-bg-page p-3">
              <p className="font-medium text-text-main">{tenant.name}</p>
              <p className="text-xs text-text-muted">{tenant.email}</p>
              <p className="mt-1 text-xs text-text-sub">
                {tenant.propertyName ?? "Unassigned"} · {tenant.unitNumber ?? "-"} ·{" "}
                {tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : "No lease"}
              </p>
            </article>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
