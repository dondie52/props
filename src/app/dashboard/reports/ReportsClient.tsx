"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import ReportsExportPanel from "@/components/reports/ReportsExportPanel";

export default function ReportsClient() {
  return (
    <DashboardShell title="Reports">
      <ReportsExportPanel
        description="Download Excel (.xlsx) exports of your portfolio data. Files include only records you are allowed to see (same scope as Payments and Tenants)."
        items={[
          { href: "/api/reports/payments", label: "Download payments (Excel)" },
          { href: "/api/reports/tenants", label: "Download tenants (Excel)" },
        ]}
      />
    </DashboardShell>
  );
}
