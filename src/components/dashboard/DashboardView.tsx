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
          <section className="overflow-hidden rounded-large border border-border-ghost bg-white shadow-card">
            <div className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-primary">Set up your first property</h2>
                <p className="mt-2 text-text-sub">Get to your first dashboard insights in under 3 minutes.</p>
              </div>
              <Link href="/dashboard/onboarding" className="btn-accent px-8">
                Get started
              </Link>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Properties" value={String(stats.totalProperties)} icon={<Building2 className="h-5 w-5" />} />
          <StatCard title="Occupied Units" value={stats.occupiedText} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Rent Due" value={stats.rentDueText} icon={<CreditCard className="h-5 w-5" />} />
          <StatCard title="Open Maintenance" value={String(stats.openMaintenance)} icon={<Wrench className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-large border border-border-ghost bg-bg-card p-6 shadow-card lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-main">Recent Payments</h2>
              <Link href="/dashboard/payments" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-ghost text-xs font-semibold uppercase tracking-wider text-text-muted">
                      <th className="pb-4 pr-4">Tenant</th>
                      <th className="pb-4 pr-4">Property</th>
                      <th className="pb-4 pr-4">Unit</th>
                      <th className="pb-4 pr-4">Amount</th>
                      <th className="pb-4 pr-4">Date</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-ghost">
                    {paymentRows.map((row) => (
                      <tr key={`${row.tenant}-${row.unit}`} className="group transition-colors hover:bg-bg-page/50">
                        <td className="py-4 pr-4 font-medium text-text-main">{row.tenant}</td>
                        <td className="py-4 pr-4 text-text-sub">{row.property}</td>
                        <td className="py-4 pr-4 text-text-sub">{row.unit}</td>
                        <td className="py-4 pr-4 font-semibold text-text-main">{row.amount}</td>
                        <td className="py-4 pr-4 text-text-sub">{row.date}</td>
                        <td className="py-4">
                          <StatusChip status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {paymentRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-ghost bg-bg-page/50 p-8 text-center">
                <CreditCard className="mb-3 h-10 w-10 text-text-muted" />
                <p className="text-sm font-medium text-text-sub">No payments yet</p>
                <p className="mt-1 text-xs text-text-muted">Add a tenant and record your first payment to populate this section.</p>
              </div>
            ) : null}
            <div className="space-y-4 md:hidden">
              {paymentRows.map((row) => (
                <article key={`${row.tenant}-${row.unit}`} className="rounded-xl border border-border-ghost bg-bg-page/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-text-main">{row.tenant}</p>
                    <StatusChip status={row.status} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                    <span>{row.property} · Unit {row.unit}</span>
                    <span>{row.date}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-text-main">{row.amount}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-large border border-border-ghost bg-bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-main">Maintenance</h2>
              <Link href="/dashboard/maintenance" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {maintenanceRows.map((row) => (
                <div key={`${row.category}-${row.unit}`} className="group flex items-center justify-between rounded-xl border border-border-ghost bg-bg-page/50 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-text-main">{row.category}</p>
                    <p className="mt-1 text-xs text-text-muted">Unit {row.unit}</p>
                  </div>
                  <StatusChip status={row.urgency} />
                </div>
              ))}
              {maintenanceRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-ghost bg-bg-page/50 p-8 text-center">
                  <Wrench className="mb-3 h-10 w-10 text-text-muted" />
                  <p className="text-sm font-medium text-text-sub">No maintenance requests yet</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="rounded-large border border-border-ghost bg-bg-card p-6 shadow-card">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main">Occupancy Overview</h2>
            <Link href="/dashboard/properties" className="text-sm font-medium text-primary hover:underline">
              View properties
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
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(value, index) => getOccupancyLabel(value, index)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="occupied" fill="#003857" radius={[4, 4, 0, 0]} barSize={40} />
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
