import TenantNavbar from "@/components/layout/TenantNavbar";
import ReportsExportPanel from "@/components/reports/ReportsExportPanel";

export const dynamic = "force-dynamic";

export default function TenantReportsPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-main">
      <TenantNavbar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6 md:px-6">
        <h1 className="text-2xl font-bold text-primary">Reports</h1>
        <p className="mt-1 text-sm text-text-muted">Exports for your payments and maintenance history.</p>
        <div className="mt-8">
          <ReportsExportPanel
            description="These files include only data linked to your tenant account and unit."
            items={[
              { href: "/api/reports/tenant/payments", label: "Download my payments (Excel)" },
              { href: "/api/reports/tenant/maintenance", label: "Download my maintenance requests (Excel)" },
            ]}
          />
        </div>
      </main>
    </div>
  );
}
