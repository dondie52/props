import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import { getAdminLandlords } from "@/lib/admin-data";

export default async function AdminLandlordsPage() {
  const supabase = createSupabaseServerComponentClient();
  const landlords = await getAdminLandlords(supabase);

  return (
    <DashboardShell title="Landlords" variant="admin">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">All Landlords</h2>
          <p className="text-sm text-text-muted">{landlords.length} total</p>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Properties</th>
                <th className="pb-3">Tenants</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {landlords.map((landlord) => (
                <tr key={landlord.id} className="border-t border-border-ghost">
                  <td className="py-3">{landlord.name}</td>
                  <td>{landlord.email}</td>
                  <td>{landlord.propertyCount}</td>
                  <td>{landlord.tenantCount}</td>
                  <td>{new Date(landlord.joinedAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/landlords/${landlord.id}`} className="text-primary-mid">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {landlords.map((landlord) => (
            <article key={landlord.id} className="rounded-base border border-border-ghost bg-bg-page p-3">
              <p className="font-medium text-text-main">{landlord.name}</p>
              <p className="text-xs text-text-muted">{landlord.email}</p>
              <p className="mt-1 text-xs text-text-sub">
                Properties: {landlord.propertyCount} · Tenants: {landlord.tenantCount}
              </p>
              <Link href={`/admin/landlords/${landlord.id}`} className="mt-2 inline-block text-sm text-primary-mid">
                View details
              </Link>
            </article>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
