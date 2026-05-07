"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { getLandlordScope } from "@/lib/dashboard-scope";

type PaymentRow = {
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  due: string;
  paid: string;
  method: string;
  status: "paid" | "pending" | "overdue";
};

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      const scope = await getLandlordScope(supabase);
      if (!scope.landlordId || scope.tenantIds.length === 0) {
        setRows([]);
        return;
      }

      const { data } = await supabase
        .from("payments")
        .select("amount,due_date,payment_date,method,status,tenants(full_name,units(unit_number,properties(name)))")
        .in("tenant_id", scope.tenantIds)
        .order("due_date", { ascending: false });

      const mapped: PaymentRow[] = (data ?? []).map((row) => {
        const rowObj = row as unknown as {
          tenants?: unknown;
          amount?: unknown;
          due_date?: unknown;
          payment_date?: unknown;
          method?: unknown;
          status?: unknown;
        };
        const tenant = Array.isArray(rowObj.tenants) ? rowObj.tenants[0] : rowObj.tenants;
        const unit = tenant && Array.isArray(tenant.units) ? tenant.units[0] : tenant?.units;
        const property = unit && Array.isArray(unit.properties) ? unit.properties[0] : unit?.properties;
        const rawStatus =
          rowObj.status === "paid" || rowObj.status === "pending" || rowObj.status === "overdue" ? rowObj.status : "pending";

        return {
          tenant: tenant?.full_name ?? "Unknown",
          property: property?.name ?? "Unknown",
          unit: unit?.unit_number ?? "-",
          amount: Number(rowObj.amount ?? 0),
          due: (rowObj.due_date as string | undefined) ?? "-",
          paid: rowObj.status === "paid" ? ((rowObj.payment_date as string | undefined) ?? "-") : "-",
          method: String(rowObj.method ?? ""),
          status: rawStatus,
        };
      });

      setRows(mapped);
    };
    void loadPayments();
  }, []);

  const stats = useMemo(() => {
    const collected = rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0);
    const pending = rows.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0);
    const overdue = rows.filter((row) => row.status === "overdue").reduce((sum, row) => sum + row.amount, 0);
    const rate = rows.length ? Math.round((rows.filter((row) => row.status === "paid").length / rows.length) * 100) : 0;
    return { collected, pending, overdue, rate };
  }, [rows]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
      .format(value)
      .replace("BWP", "P")
      .trim();

  return (
    <DashboardShell title="Payments">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Payments</h1>
            <p className="text-sm text-text-muted mt-1">Monitor rent collection and financial health</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="btn-accent px-6"
          >
            Record Payment
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Collected" value={formatMoney(stats.collected)} icon={<span className="font-bold">P</span>} />
          <StatCard title="Pending" value={formatMoney(stats.pending)} icon={<span className="font-bold text-warning">P</span>} />
          <StatCard title="Overdue" value={formatMoney(stats.overdue)} icon={<span className="font-bold text-error">P</span>} />
          <StatCard title="Collection Rate" value={`${stats.rate}%`} icon={<span className="font-bold text-success">%</span>} />
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-md ring-1 ring-border-ghost">
          <div className="flex flex-col gap-4 border-b border-border-ghost px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-text-main">Rent Ledger</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select className="input-field pr-10 appearance-none min-w-[140px]">
                  <option>May 2026</option>
                  <option>Apr 2026</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button className="btn-outline px-4 gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-page/50 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4">Tenant</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-ghost">
                  {rows.map((row) => (
                    <tr key={`${row.tenant}-${row.unit}-${row.due}`} className="group transition-colors hover:bg-bg-page/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-main">{row.tenant}</p>
                        <p className="text-xs text-text-muted">{row.property}</p>
                      </td>
                      <td className="px-6 py-4 text-text-sub font-medium">{row.unit}</td>
                      <td className="px-6 py-4 text-right font-bold text-text-main">{formatMoney(row.amount)}</td>
                      <td className="px-6 py-4">
                        <p className="text-text-main font-medium">{row.due}</p>
                        {row.status === "paid" && (
                          <p className="text-[10px] text-success font-medium">Paid: {row.paid}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {row.method === "system" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-bold text-primary ring-1 ring-inset ring-primary/10">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Auto Rent
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                            {row.method || "Manual"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          aria-label="Download receipt"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-page hover:text-primary"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {rows.map((row) => (
              <article key={`${row.tenant}-${row.unit}-${row.due}`} className="rounded-xl border border-border-ghost bg-bg-page/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-text-main">{row.tenant}</p>
                    <p className="text-xs text-text-muted">{row.property} · Unit {row.unit}</p>
                  </div>
                  <StatusChip status={row.status} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-main">{formatMoney(row.amount)}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Due {row.due}</p>
                  </div>
                  {row.method === "system" ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Auto
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-text-muted">{row.method || "Manual"}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Record New Payment">
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Tenant</label>
              <select className="input-field">
                <option>Select tenant</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Unit</label>
              <select className="input-field">
                <option>Select unit</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-main">Amount (BWP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-muted">P</span>
                  <input className="input-field pl-8" placeholder="0.00" type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-main">Date Paid</label>
                <input type="date" className="input-field" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Payment Method</label>
              <select className="input-field">
                <option>Select method</option>
                <option>Bank transfer</option>
                <option>Cash</option>
                <option>Check</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Internal Notes</label>
              <textarea
                className="w-full rounded-xl border border-border-muted bg-white px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                rows={3}
                placeholder="Reference numbers, special conditions, etc."
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-outline flex-1 h-11">
              Cancel
            </button>
            <button type="button" className="btn-primary flex-1 h-11">
              Record Payment
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
