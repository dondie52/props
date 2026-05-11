"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";

export type PaymentRow = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  due: string;
  paid: string;
  method: string;
  status: "paid" | "pending" | "overdue";
};

export type PaymentTenantOption = {
  id: string;
  name: string;
  property: string;
  unit: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(value)
    .replace("BWP", "P")
    .trim();

export default function PaymentsClient({
  initialRows,
  tenantOptions,
}: {
  initialRows: PaymentRow[];
  tenantOptions: PaymentTenantOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const rows = initialRows;
  const selectedTenant = tenantOptions.find((tenant) => tenant.id === selectedTenantId) ?? null;

  const stats = useMemo(() => {
    const collected = rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0);
    const pending = rows.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0);
    const overdue = rows.filter((row) => row.status === "overdue").reduce((sum, row) => sum + row.amount, 0);
    const rate = rows.length ? Math.round((rows.filter((row) => row.status === "paid").length / rows.length) * 100) : 0;
    return { collected, pending, overdue, rate };
  }, [rows]);

  return (
    <DashboardShell title="Payments">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Collected" value={formatMoney(stats.collected)} icon={<span className="text-base">P</span>} />
        <StatCard title="Pending" value={formatMoney(stats.pending)} icon={<span className="text-base">P</span>} />
        <StatCard title="Overdue" value={formatMoney(stats.overdue)} icon={<span className="text-base">P</span>} />
        <StatCard title="Rate" value={`${stats.rate}%`} icon={<span className="text-base">%</span>} />
      </div>
      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-primary">Rent Ledger</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select className="h-11 rounded-base border border-border-ghost px-3 text-sm sm:min-w-[140px]">
              <option>May 2026</option>
              <option>Apr 2026</option>
            </select>
            <button type="button" onClick={() => setIsOpen(true)} className="inline-flex h-11 items-center justify-center rounded-base bg-accent px-4 text-white">
              Record Payment
            </button>
          </div>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Property</th>
                <th className="pb-3">Unit</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Paid Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id || `${row.tenant}-${row.unit}-${row.due}`} className="border-t border-border-ghost hover:bg-bg-page">
                  <td className="py-3">{row.tenant}</td>
                  <td>{row.property}</td>
                  <td>{row.unit}</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.due}</td>
                  <td>{row.paid}</td>
                  <td>
                    <span className="rounded-pill bg-bg-page px-2 py-1 text-xs text-text-muted">
                      {row.method === "system" ? "Auto rent" : row.method || "Manual"}
                    </span>
                  </td>
                  <td>
                    <StatusChip status={row.status} />
                  </td>
                  <td>
                    {row.status === "paid" && row.id ? (
                      <Link
                        href={`/api/receipts/${row.id}`}
                        download
                        aria-label="Download receipt"
                        className="inline-flex text-primary-mid hover:underline"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="text-text-muted" title="Receipt available when payment is marked paid">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {rows.map((row) => (
            <article key={row.id || `${row.tenant}-${row.unit}-${row.due}`} className="rounded-base border border-border-ghost bg-bg-page p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-main">{row.tenant}</p>
                <StatusChip status={row.status} />
              </div>
              <p className="text-xs text-text-muted">
                {row.property} - Unit {row.unit}
              </p>
              <p className="mt-1 text-sm text-text-main">{formatMoney(row.amount)}</p>
              <p className="text-xs text-text-muted">
                Due {row.due} - {row.method === "system" ? "Auto rent" : row.method || "Manual"}
              </p>
              {row.status === "paid" && row.id ? (
                <Link href={`/api/receipts/${row.id}`} download className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-mid">
                  <Download className="h-3.5 w-3.5" />
                  Download receipt
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Record Payment">
        <div className="space-y-3">
          <select
            value={selectedTenantId}
            onChange={(event) => setSelectedTenantId(event.target.value)}
            className="h-11 w-full rounded-base border border-border-ghost px-3"
          >
            <option value="">Select tenant</option>
            {tenantOptions.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <select
            value={selectedTenant?.id ?? ""}
            onChange={(event) => setSelectedTenantId(event.target.value)}
            className="h-11 w-full rounded-base border border-border-ghost px-3"
            disabled={!selectedTenant}
          >
            <option value="">{selectedTenant ? `${selectedTenant.property} - Unit ${selectedTenant.unit}` : "Select tenant first"}</option>
          </select>
          <div className="flex h-11 items-center rounded-base border border-border-ghost px-3">
            <span className="text-text-muted">P</span>
            <input className="ml-2 w-full bg-transparent outline-none" placeholder="Amount" />
          </div>
          <input type="date" className="h-11 w-full rounded-base border border-border-ghost px-3" />
          <select className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Method</option>
            <option>Bank transfer</option>
            <option>Cash</option>
          </select>
          <textarea className="w-full rounded-base border border-border-ghost px-3 py-2" rows={3} placeholder="Notes" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="h-11 flex-1 rounded-base border border-primary text-primary">
              Cancel
            </button>
            <button type="button" className="h-11 flex-1 rounded-base bg-primary text-white">
              Record Payment
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
