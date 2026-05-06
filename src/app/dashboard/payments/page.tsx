"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

type PaymentRow = {
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  due: string;
  paid: string;
  status: "paid" | "pending" | "overdue";
};

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      const { data } = await supabase
        .from("payments")
        .select("amount,due_date,payment_date,status,tenants(full_name,units(unit_number,properties(name)))")
        .order("due_date", { ascending: false });

      const mapped: PaymentRow[] = (data ?? []).map((row) => {
        const rowObj = row as unknown as { tenants?: unknown; amount?: unknown; due_date?: unknown; payment_date?: unknown; status?: unknown };
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
    <div className="flex min-h-screen bg-bg-page">
      <aside className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      <div className="ml-60 flex-1">
        <div className="fixed left-60 right-0 top-0 z-20">
          <Topbar title="Payments" />
        </div>
        <main className="space-y-6 p-8 pt-24">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <StatCard title="Collected" value={formatMoney(stats.collected)} icon={<span className="text-base">P</span>} />
            <StatCard title="Pending" value={formatMoney(stats.pending)} icon={<span className="text-base">P</span>} />
            <StatCard title="Overdue" value={formatMoney(stats.overdue)} icon={<span className="text-base">P</span>} />
            <StatCard title="Rate" value={`${stats.rate}%`} icon={<span className="text-base">%</span>} />
          </div>
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Payment History</h2>
              <div className="flex items-center gap-3">
                <select className="h-11 rounded-base border border-border-ghost px-3 text-sm">
                  <option>May 2026</option>
                  <option>Apr 2026</option>
                </select>
                <button type="button" onClick={() => setIsOpen(true)} className="h-11 rounded-base bg-accent px-4 text-white">
                  Record Payment
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="pb-3">Tenant</th><th className="pb-3">Property</th><th className="pb-3">Unit</th><th className="pb-3">Amount</th><th className="pb-3">Due Date</th><th className="pb-3">Paid Date</th><th className="pb-3">Status</th><th className="pb-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.tenant}-${row.unit}`} className="border-t border-border-ghost hover:bg-bg-page">
                    <td className="py-3">{row.tenant}</td><td>{row.property}</td><td>{row.unit}</td><td>{formatMoney(row.amount)}</td><td>{row.due}</td><td>{row.paid}</td><td><StatusChip status={row.status} /></td>
                    <td>
                      <button type="button" aria-label="Download receipt" className="text-primary-mid">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Record Payment">
        <div className="space-y-3">
          <select className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Select tenant</option>
          </select>
          <select className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Select unit</option>
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
    </div>
  );
}
