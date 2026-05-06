"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, CreditCard, Users, Wrench } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";

type Props = {
  stats: { totalProperties: number; occupiedText: string; rentDueText: string; openMaintenance: number };
  paymentRows: Array<{ tenant: string; property: string; unit: string; amount: string; date: string; status: "paid" | "pending" | "overdue" }>;
  maintenanceRows: Array<{ category: string; unit: string; urgency: "high" | "medium" | "low" }>;
  occupancyData: Array<{ name: string; occupied: number }>;
};

export default function DashboardView({ stats, paymentRows, maintenanceRows, occupancyData }: Props) {
  return (
    <div className="flex min-h-screen bg-bg-page">
      <aside className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      <div className="ml-60 flex-1">
        <div className="fixed left-60 right-0 top-0 z-20">
          <Topbar title="Dashboard" />
        </div>
        <main className="min-h-screen bg-bg-page p-8 pt-24">
          {stats.totalProperties === 0 ? (
            <section className="mb-6 rounded-large border border-border-ghost bg-bg-card p-6 shadow-card">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-primary">Set up your first property</h2>
                  <p className="mt-1 text-sm text-text-sub">Get to your first dashboard insights in under 3 minutes.</p>
                </div>
                <Link
                  href="/dashboard/onboarding"
                  className="inline-flex h-11 items-center rounded-base bg-accent px-6 text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <StatCard title="Total Properties" value={String(stats.totalProperties)} icon={<Building2 className="h-5 w-5" />} />
            <StatCard title="Occupied Units" value={stats.occupiedText} icon={<Users className="h-5 w-5" />} />
            <StatCard title="Rent Due" value={stats.rentDueText} icon={<CreditCard className="h-5 w-5" />} />
            <StatCard title="Open Maintenance" value={String(stats.openMaintenance)} icon={<Wrench className="h-5 w-5" />} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-base border border-border-ghost bg-bg-card p-6 shadow-card lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Recent Payments</h2>
                <Link href="/dashboard/payments" className="text-sm text-primary-mid">
                  View all
                </Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="pb-3">Tenant</th>
                    <th className="pb-3">Property</th>
                    <th className="pb-3">Unit</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((row) => (
                    <tr key={`${row.tenant}-${row.unit}`} className="border-b border-border-ghost hover:bg-bg-page">
                      <td className="py-3">{row.tenant}</td>
                      <td>{row.property}</td>
                      <td>{row.unit}</td>
                      <td>{row.amount}</td>
                      <td>{row.date}</td>
                      <td>
                        <StatusChip status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-base border border-border-ghost bg-bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Maintenance</h2>
                <Link href="/dashboard/maintenance" className="text-sm text-primary-mid">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {maintenanceRows.map((row) => (
                  <div key={`${row.category}-${row.unit}`} className="rounded-base border border-border-ghost bg-bg-page p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-main">{row.category}</p>
                      <StatusChip status={row.urgency} />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">Unit {row.unit}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-base border border-border-ghost bg-bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Occupancy</h2>
              <Link href="/dashboard/properties" className="text-sm text-primary-mid">
                View properties
              </Link>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e8e8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="occupied" fill="#1b4f72" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

