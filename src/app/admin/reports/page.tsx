import DashboardShell from "@/components/layout/DashboardShell";
import ReportsExportPanel from "@/components/reports/ReportsExportPanel";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <DashboardShell title="Reports" variant="admin">
      <ReportsExportPanel
        description="Download Excel (.xlsx) exports across the platform. Row visibility follows your admin permissions in Supabase (RLS)."
        items={[
          { href: "/api/reports/admin/payments", label: "Download all payments (Excel)" },
          { href: "/api/reports/admin/tenants", label: "Download all tenants (Excel)" },
        ]}
      />
    </DashboardShell>
  );
}
