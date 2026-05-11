"use client";

import { FileDown } from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";

export default function ReportsClient() {
  return (
    <DashboardShell title="Reports">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm text-text-sub">
          Download Excel (.xlsx) exports of your portfolio data. Files include only records you are allowed to see (same scope as
          Payments and Tenants).
        </p>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary">Exports</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/api/reports/payments"
                className="inline-flex items-center gap-2 rounded-md border border-border-ghost bg-white px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-bg-page"
                download
              >
                <FileDown className="h-4 w-4 shrink-0" />
                Download payments (Excel)
              </Link>
            </li>
            <li>
              <Link
                href="/api/reports/tenants"
                className="inline-flex items-center gap-2 rounded-md border border-border-ghost bg-white px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-bg-page"
                download
              >
                <FileDown className="h-4 w-4 shrink-0" />
                Download tenants (Excel)
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardShell>
  );
}
