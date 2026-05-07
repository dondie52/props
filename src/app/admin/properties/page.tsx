import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export default async function AdminPropertiesPage() {
  const supabase = createSupabaseServerComponentClient();
  const { data: properties } = await supabase.from("properties").select("id,name,address,city,type").order("name");

  return (
    <DashboardShell title="Properties" variant="admin">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-primary">System Properties</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(properties ?? []).map((property) => (
            <article key={property.id} className="rounded-base border border-border-ghost bg-bg-page p-3">
              <p className="font-medium text-text-main">{property.name}</p>
              <p className="text-xs text-text-muted">
                {property.address}, {property.city}
              </p>
              <p className="mt-1 text-xs text-text-sub">{property.type}</p>
            </article>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
