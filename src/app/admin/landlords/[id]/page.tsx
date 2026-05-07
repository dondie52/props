import { notFound } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";
import { getAdminLandlordDetail } from "@/lib/admin-data";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(value)
    .replace("BWP", "P")
    .trim();

export default async function AdminLandlordDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerComponentClient();
  const detail = await getAdminLandlordDetail(supabase, params.id);
  if (!detail) notFound();

  return (
    <DashboardShell title="Landlord Detail" variant="admin">
      <Card>
        <h1 className="text-2xl font-semibold text-primary">{detail.landlord.name}</h1>
        <p className="text-sm text-text-muted">{detail.landlord.email}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-base bg-bg-page p-3 text-sm">Properties: {detail.landlord.propertyCount}</div>
          <div className="rounded-base bg-bg-page p-3 text-sm">Tenants: {detail.landlord.tenantCount}</div>
          <div className="rounded-base bg-bg-page p-3 text-sm">Paid: {formatMoney(detail.paymentsTotal)}</div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-primary">Properties</h2>
          <div className="space-y-3">
            {detail.properties.map((property) => (
              <article key={property.id} className="rounded-base border border-border-ghost bg-bg-page p-3">
                <p className="font-medium text-text-main">{property.name}</p>
                <p className="text-xs text-text-muted">
                  {property.address}, {property.city}
                </p>
                <p className="mt-1 text-xs text-text-sub">
                  {property.type} · {property.occupiedUnits}/{property.totalUnits} occupied
                </p>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-primary">Tenants</h2>
          <div className="space-y-3">
            {detail.tenants.map((tenant) => (
              <article key={tenant.id} className="rounded-base border border-border-ghost bg-bg-page p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-text-main">{tenant.name}</p>
                  <StatusChip status="active" />
                </div>
                <p className="text-xs text-text-muted">{tenant.email}</p>
                <p className="text-xs text-text-sub">
                  {tenant.propertyName} · Unit {tenant.unitNumber}
                </p>
                <p className="text-xs text-text-muted">Lease ends: {tenant.leaseEnd}</p>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
