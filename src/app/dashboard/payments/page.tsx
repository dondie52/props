"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Search, Filter, ArrowUpRight, TrendingUp, CreditCard, Clock, AlertCircle, RefreshCw, FileText } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-8 rounded-2xl border border-border-ghost shadow-sm">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-main">Financial Ledger</h1>
            <p className="text-sm font-medium text-text-muted mt-1">Real-time monitoring of your rental income and collections</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="btn-accent h-12 px-8 flex items-center gap-2 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95"
          >
            <CreditCard className="h-4 w-4" />
            Record Payment
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Collected</p>
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
             </div>
             <p className="text-2xl font-black text-text-main tracking-tight">{formatMoney(stats.collected)}</p>
             <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                <ArrowUpRight className="h-3 w-3" />
                On Track
             </div>
          </div>
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Pending</p>
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
             </div>
             <p className="text-2xl font-black text-text-main tracking-tight">{formatMoney(stats.pending)}</p>
             <p className="mt-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Awaiting Verification</p>
          </div>
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Overdue</p>
                <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                </div>
             </div>
             <p className="text-2xl font-black text-rose-600 tracking-tight">{formatMoney(stats.overdue)}</p>
             <p className="mt-2 text-[10px] font-bold text-rose-500/80 uppercase tracking-wider">Requires Attention</p>
          </div>
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Collection Rate</p>
                <div className="h-8 w-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <RefreshCw className="h-4 w-4" />
                </div>
             </div>
             <p className="text-2xl font-black text-text-main tracking-tight">{stats.rate}%</p>
             <div className="mt-3 h-1.5 w-full bg-bg-page rounded-full overflow-hidden border border-border-ghost/50">
                <div className="h-full bg-primary-900 rounded-full" style={{ width: `${stats.rate}%` }} />
             </div>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-xl ring-1 ring-border-ghost">
          <div className="flex flex-col gap-6 border-b border-border-ghost bg-white px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black tracking-tight text-text-main">Rent Ledger</h2>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-bg-page rounded-lg border border-border-ghost/50">
                 <div className="h-2 w-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Live View</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input placeholder="Search ledger..." className="input-field pl-10 h-10 text-xs w-full sm:w-64 bg-bg-page/50" />
              </div>
              <button className="btn-outline h-10 px-4 gap-2 text-xs font-bold uppercase tracking-wider">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
              <button className="btn-outline h-10 px-4 gap-2 text-xs font-bold uppercase tracking-wider">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-page/40 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                    <th className="px-8 py-5">Tenant / Property</th>
                    <th className="px-8 py-5">Unit</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                    <th className="px-8 py-5">Due Date</th>
                    <th className="px-8 py-5">Method</th>
                    <th className="px-8 py-5 text-right">Status</th>
                    <th className="px-8 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-ghost/60">
                  {rows.map((row) => (
                    <tr key={`${row.tenant}-${row.unit}-${row.due}`} className="group transition-all hover:bg-bg-page/50">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-600 border border-slate-200 group-hover:bg-primary-900 group-hover:text-white group-hover:border-primary-900 transition-all">
                              {row.tenant.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                              <p className="font-bold text-text-main leading-none group-hover:text-primary transition-colors">{row.tenant}</p>
                              <p className="mt-1.5 text-[11px] font-medium text-text-muted uppercase tracking-tight">{row.property}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-text-sub bg-bg-page px-2 py-1 rounded border border-border-ghost/50">{row.unit}</span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-text-main tracking-tight">{formatMoney(row.amount)}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-text-main">{row.due}</span>
                           {row.status === "paid" && (
                             <span className="mt-0.5 text-[10px] font-bold text-emerald-600 uppercase">Settled: {row.paid}</span>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {row.method === "system" ? (
                          <div className="inline-flex items-center gap-2 rounded-lg bg-primary-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                            <RefreshCw className="h-3 w-3" />
                            Auto
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                            <CreditCard className="h-3 w-3" />
                            {row.method || "Manual"}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <StatusChip status={row.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                           <button
                             type="button"
                             className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-primary-50 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                             title="View Receipt"
                           >
                             <FileText className="h-4 w-4" />
                           </button>
                           <button
                             type="button"
                             className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
                             title="Download PDF"
                           >
                             <Download className="h-4 w-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 p-6 md:hidden">
            {rows.map((row) => (
              <article key={`${row.tenant}-${row.unit}-${row.due}`} className="rounded-2xl border border-border-ghost bg-white p-5 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600 border border-slate-200">
                        {row.tenant.split(' ').map(n => n[0]).join('')}
                     </div>
                     <div>
                       <p className="font-black text-text-main leading-tight">{row.tenant}</p>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight mt-0.5">{row.property} · {row.unit}</p>
                     </div>
                  </div>
                  <StatusChip status={row.status} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-ghost/50">
                  <div>
                    <p className="text-lg font-black text-primary tracking-tight">{formatMoney(row.amount)}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5">DUE: {row.due}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {row.method === "system" ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary-900 text-[9px] font-black text-white uppercase tracking-widest">
                        <RefreshCw className="h-2.5 w-2.5" />
                        Auto
                      </div>
                    ) : (
                      <div className="px-2 py-1 rounded bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest border border-slate-200">
                        {row.method || "Manual"}
                      </div>
                    )}
                    <button className="text-[10px] font-black text-primary uppercase underline tracking-wider">Receipt</button>
                  </div>
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
