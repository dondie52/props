"use client";

import Link from "next/link";
import { Eye, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import { supabase } from "@/lib/supabase";

type TenantRow = {
  name: string;
  email: string;
  property: string;
  unit: string;
  rent: string;
  leaseEnd: string;
  status: "active" | "expiring" | "overdue";
};

export default function Page() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [tenants, setTenants] = useState<TenantRow[]>([]);

  useEffect(() => {
    const loadTenants = async () => {
      const { data } = await supabase
        .from("tenants")
        .select("full_name,email,lease_end,units(unit_number,rent_amount,properties(name))");

      const now = new Date();
      const mapped: TenantRow[] = (data ?? []).map((tenant) => {
        const tenantObj = tenant as unknown as { full_name?: unknown; email?: unknown; lease_end?: unknown; units?: unknown };
        const unit = Array.isArray(tenantObj.units) ? tenantObj.units[0] : tenantObj.units;
        const property = unit && Array.isArray(unit.properties) ? unit.properties[0] : unit?.properties;
        const leaseEndDate = tenantObj.lease_end ? new Date(String(tenantObj.lease_end)) : null;
        const daysToEnd = leaseEndDate ? Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        let normalizedStatus: "active" | "expiring" | "overdue" = "active";
        if (daysToEnd < 0) normalizedStatus = "overdue";
        else if (daysToEnd <= 60) normalizedStatus = "expiring";

        const rentAmount = Number(unit?.rent_amount ?? 0);
        const rentText = new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
          .format(rentAmount)
          .replace("BWP", "P")
          .trim();

        return {
          name: (tenantObj.full_name as string | undefined) ?? "Unknown",
          email: (tenantObj.email as string | undefined) ?? "",
          property: property?.name ?? "Unknown",
          unit: unit?.unit_number ?? "-",
          rent: rentText,
          leaseEnd: (tenantObj.lease_end as string | undefined) ?? "-",
          status: normalizedStatus,
        };
      });

      setTenants(mapped);
    };
    void loadTenants();
  }, []);
  const filtered = useMemo(
    () =>
      tenants.filter((tenant) => {
        const matchesSearch = tenant.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "all" || tenant.status === status;
        return matchesSearch && matchesStatus;
      }),
    [search, status, tenants],
  );

  return (
    <DashboardShell title="Tenants">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Tenants</h1>
            <p className="text-sm text-text-muted mt-1">Directory of all residents across your properties</p>
          </div>
          <Link href="/dashboard/properties" className="btn-accent px-6">
            Assign New Tenant
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-10"
              placeholder="Search by name or email..."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-sub">Filter:</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-md ring-1 ring-border-ghost">
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-page/50 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4">Tenant</th>
                    <th className="px-6 py-4">Property & Unit</th>
                    <th className="px-6 py-4">Rent</th>
                    <th className="px-6 py-4">Lease End</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-ghost">
                  {filtered.map((tenant) => (
                    <tr key={tenant.name} className="group transition-colors hover:bg-bg-page/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-sm font-bold text-primary ring-1 ring-inset ring-primary/10">
                            {tenant.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-text-main">{tenant.name}</p>
                            <p className="truncate text-xs text-text-muted">{tenant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-main">{tenant.property}</p>
                        <p className="text-xs text-text-muted">Unit {tenant.unit}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-text-main">{tenant.rent}</td>
                      <td className="px-6 py-4 text-text-sub">{tenant.leaseEnd}</td>
                      <td className="px-6 py-4">
                        <StatusChip status={tenant.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            aria-label="View tenant"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-page hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Email tenant"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-page hover:text-primary"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {filtered.map((tenant) => (
              <article key={tenant.name} className="rounded-xl border border-border-ghost bg-bg-page/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-xs font-bold text-primary">
                      {tenant.name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-bold text-text-main leading-tight">{tenant.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{tenant.email}</p>
                    </div>
                  </div>
                  <StatusChip status={tenant.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2 border border-border-ghost">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Property</p>
                    <p className="mt-0.5 font-medium text-text-main truncate">{tenant.property}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-border-ghost">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Rent</p>
                    <p className="mt-0.5 font-medium text-text-main">{tenant.rent}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-border-ghost bg-bg-page/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-muted">
                Showing <span className="text-text-main font-bold">{filtered.length}</span> of <span className="text-text-main font-bold">{tenants.length}</span> tenants
              </p>
              <div className="flex gap-2">
                <button type="button" className="btn-outline h-8 px-3 text-xs">
                  Previous
                </button>
                <button type="button" className="btn-outline h-8 px-3 text-xs">
                  Next
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
