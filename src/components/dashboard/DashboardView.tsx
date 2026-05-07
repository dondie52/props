"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
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
  const onboardingRef = useRef<HTMLElement | null>(null);
  const statsGridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onboardingRect = onboardingRef.current?.getBoundingClientRect();
    const statsRect = statsGridRef.current?.getBoundingClientRect();
    // #region agent log
    fetch("http://127.0.0.1:7851/ingest/cfa3b922-9c8a-4c92-bfaf-18b672b0b00c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "927419" },
      body: JSON.stringify({
        sessionId: "927419",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "DashboardView.tsx:layoutEffect",
        message: "Dashboard content placement metrics",
        data: {
          totalProperties: stats.totalProperties,
          showsOnboarding: stats.totalProperties === 0,
          onboardingHeight: onboardingRect?.height ?? 0,
          onboardingTop: onboardingRect?.top ?? null,
          statsTop: statsRect?.top ?? null,
          statsBottom: statsRect?.bottom ?? null,
          viewportHeight: window.innerHeight,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [stats.totalProperties]);

  const getOccupancyLabel = (value: unknown, index?: number) => {
    const label = String(value ?? "").trim();
    if (label) return label;
    if (index === 0) return "CBD";
    if (index === 1) return "West Gate";
    return `Property ${Number(index ?? 0) + 1}`;
  };

  return (
    <DashboardShell title="Dashboard">
          {stats.totalProperties === 0 ? (
            <section ref={onboardingRef} className="mb-6 rounded-large border border-border-ghost bg-bg-card p-6 shadow-card">
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

          <div ref={statsGridRef} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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
              <div className="hidden md:block">
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
              </div>
              {paymentRows.length === 0 ? (
                <div className="rounded-base border border-dashed border-border-ghost bg-bg-page p-4 text-sm text-text-muted">
                  No payments yet. Add a tenant and record your first payment to populate this section.
                </div>
              ) : null}
              <div className="space-y-3 md:hidden">
                {paymentRows.map((row) => (
                  <article key={`${row.tenant}-${row.unit}`} className="rounded-base border border-border-ghost bg-bg-page p-3">
                    <p className="font-medium text-text-main">{row.tenant}</p>
                    <p className="text-xs text-text-muted">
                      {row.property} - Unit {row.unit}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-text-main">{row.amount}</p>
                      <StatusChip status={row.status} />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{row.date}</p>
                  </article>
                ))}
              </div>
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
                {maintenanceRows.length === 0 ? (
                  <div className="rounded-base border border-dashed border-border-ghost bg-bg-page p-4 text-sm text-text-muted">
                    No maintenance requests yet.
                  </div>
                ) : null}
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
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e8e8" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickFormatter={(value, index) => getOccupancyLabel(value, index)} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip labelFormatter={(label: ReactNode) => getOccupancyLabel(label)} />
                    <Bar dataKey="occupied" fill="#1b4f72" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-base border border-dashed border-border-ghost bg-bg-page text-sm text-text-muted">
                  Occupancy data will appear after you add properties and units.
                </div>
              )}
            </div>
          </section>
    </DashboardShell>
  );
}
