"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, CreditCard, Users, Wrench } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";

type Props = {
  stats: { totalProperties: number; occupiedText: string; rentDueText: string; openMaintenance: number };
  paymentRows: Array<{ tenant: string; property: string; unit: string; amount: string; date: string; status: "paid" | "pending" | "overdue" }>;
  maintenanceRows: Array<{ category: string; unit: string; urgency: "high" | "medium" | "low" }>;
  occupancyData: Array<{ name: string; occupied: number }>;
};

export default function DashboardView({ stats, paymentRows, maintenanceRows, occupancyData }: Props) {
  const getOccupancyLabel = (value: unknown, index?: number) => {
    const label = String(value ?? "").trim();
    if (label) return label;
    if (index === 0) return "CBD";
    if (index === 1) return "West Gate";
    return `Property ${Number(index ?? 0) + 1}`;
  };

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        {stats.totalProperties === 0 ? (
          <section className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-900 to-primary-800 p-[1px] shadow-xl">
            <div className="flex flex-col items-center justify-between gap-6 rounded-[15px] bg-white p-8 md:flex-row">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-primary-900">Welcome to PropManage BW</h2>
                <p className="mt-2 text-text-sub max-w-md">Your property management journey starts here. Add your first property to unlock powerful insights and automated workflows.</p>
              </div>
              <Link href="/dashboard/onboarding" className="btn-accent px-10 py-3 shadow-lg shadow-accent/20">
                Add Your First Property
              </Link>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Properties" value={String(stats.totalProperties)} icon={<Building2 className="h-5 w-5" />} />
          <StatCard title="Occupied Units" value={stats.occupiedText} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Rent Due" value={stats.rentDueText} icon={<CreditCard className="h-5 w-5" />} />
          <StatCard title="Open Maintenance" value={String(stats.openMaintenance)} icon={<Wrench className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-border-ghost bg-bg-card p-6 shadow-card lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-main tracking-tight">Recent Payments</h2>
                <p className="text-xs text-text-muted">Track the latest income from your tenants</p>
              </div>
              <Link href="/dashboard/payments" className="btn-outline px-4 py-1.5 text-xs">
                View All Payments
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-ghost text-[11px] font-bold uppercase tracking-widest text-text-muted/80">
                      <th className="pb-4 pr-4">Tenant</th>
                      <th className="pb-4 pr-4">Property / Unit</th>
                      <th className="pb-4 pr-4 text-right">Amount</th>
                      <th className="pb-4 pr-4">Date</th>
                      <th className="pb-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-ghost/50">
                    {paymentRows.map((row) => (
                      <tr key={`${row.tenant}-${row.unit}`} className="group transition-all hover:bg-bg-page/80">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary ring-1 ring-primary/10">
                              {row.tenant.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-semibold text-text-main">{row.tenant}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-text-main/90">{row.property}</span>
                            <span className="text-[11px] text-text-muted">Unit {row.unit}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-right font-bold text-text-main">{row.amount}</td>
                        <td className="py-4 pr-4 text-text-sub">{row.date}</td>
                        <td className="py-4 text-right">
                          <StatusChip status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {paymentRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-ghost bg-bg-page/50 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                  <CreditCard className="h-8 w-8 text-text-muted" />
                </div>
                <p className="text-base font-semibold text-text-main">No payment records found</p>
                <p className="mt-1 text-sm text-text-muted max-w-[240px]">Once you record tenant payments, they will appear here.</p>
              </div>
            ) : null}
            <div className="space-y-4 md:hidden">
              {paymentRows.map((row) => (
                <article key={`${row.tenant}-${row.unit}`} className="rounded-xl border border-border-ghost bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary ring-1 ring-primary/10">
                        {row.tenant.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="font-bold text-text-main leading-tight">{row.tenant}</p>
                    </div>
                    <StatusChip status={row.status} />
                  </div>
                  <div className="flex items-end justify-between border-t border-border-ghost pt-3 mt-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{row.property}</span>
                      <span className="text-xs text-text-sub">Unit {row.unit} • {row.date}</span>
                    </div>
                    <p className="text-base font-black text-primary">{row.amount}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border-ghost bg-bg-card p-6 shadow-card flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-main tracking-tight">Maintenance</h2>
                <p className="text-xs text-text-muted">Active service requests</p>
              </div>
              <Link href="/dashboard/maintenance" className="btn-outline px-4 py-1.5 text-xs">
                Manage
              </Link>
            </div>
            <div className="space-y-4 flex-1">
              {maintenanceRows.map((row) => (
                <div key={`${row.category}-${row.unit}`} className="group flex items-center justify-between rounded-xl border border-border-ghost bg-white p-4 transition-all hover:border-primary/20 hover:shadow-card-hover">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${row.urgency === 'high' ? 'bg-error animate-pulse' : row.urgency === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                    <div>
                      <p className="text-sm font-bold text-text-main leading-none">{row.category}</p>
                      <p className="mt-1.5 text-[11px] font-medium text-text-muted">UNIT {row.unit}</p>
                    </div>
                  </div>
                  <StatusChip status={row.urgency} />
                </div>
              ))}
              {maintenanceRows.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-ghost bg-bg-page/50 p-8 text-center min-h-[200px]">
                  <Wrench className="mb-3 h-10 w-10 text-text-muted/60" />
                  <p className="text-sm font-semibold text-text-main">Clean slate!</p>
                  <p className="mt-1 text-xs text-text-muted">No pending maintenance tasks.</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-border-ghost bg-bg-card p-6 shadow-card">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-main tracking-tight">Occupancy Overview</h2>
              <p className="text-xs text-text-muted">Portfolio performance by property</p>
            </div>
            <Link href="/dashboard/properties" className="btn-outline px-4 py-1.5 text-xs">
              Portfolio Details
            </Link>
          </div>
          <div className="h-80">
            {occupancyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "#94a3b8" }}
                    tickFormatter={(value, index) => getOccupancyLabel(value, index)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 56, 87, 0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="occupied" fill="#003857" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-ghost bg-bg-page/50 text-center">
                <Building2 className="mb-3 h-10 w-10 text-text-muted" />
                <p className="text-sm font-medium text-text-sub">No occupancy data available</p>
                <p className="mt-1 text-xs text-text-muted">Occupancy data will appear after you add properties and units.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
