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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary">All Tenants</h1>
              <p className="text-sm text-text-muted">{tenants.length} active tenants</p>
            </div>
            <Link href="/dashboard/properties" className="inline-flex h-11 items-center rounded-base bg-accent px-6 text-white">
              Assign Tenant
            </Link>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full max-w-sm rounded-base border border-border-ghost px-3"
              placeholder="Search tenant"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-base border border-border-ghost px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <Card>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="pb-3">Name</th><th className="pb-3">Property</th><th className="pb-3">Unit</th><th className="pb-3">Rent</th><th className="pb-3">Lease End</th><th className="pb-3">Status</th><th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tenant, index) => (
                    <tr key={tenant.name} className={`${index % 2 === 0 ? "bg-white" : "bg-bg-page"} border-t border-border-ghost`}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-mid text-xs font-medium text-white">
                            {tenant.name
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-text-main">{tenant.name}</p>
                            <p className="text-xs text-text-muted">{tenant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{tenant.property}</td><td>{tenant.unit}</td><td>{tenant.rent}</td><td>{tenant.leaseEnd}</td><td><StatusChip status={tenant.status} /></td>
                      <td>
                        <div className="flex items-center gap-2 text-text-muted">
                          <button type="button" aria-label="View tenant" className="hover:text-primary"><Eye className="h-4 w-4" /></button>
                          <button type="button" aria-label="Email tenant" className="hover:text-primary"><Mail className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {filtered.map((tenant) => (
                <article key={tenant.name} className="rounded-base border border-border-ghost bg-bg-page p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-text-main">{tenant.name}</p>
                    <StatusChip status={tenant.status} />
                  </div>
                  <p className="text-xs text-text-muted">{tenant.email}</p>
                  <p className="mt-1 text-sm text-text-sub">
                    {tenant.property} - Unit {tenant.unit}
                  </p>
                  <p className="text-xs text-text-muted">
                    Rent {tenant.rent} - Lease End {tenant.leaseEnd}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" className="h-9 rounded-base border border-border-ghost px-3 text-sm text-text-sub">
                Prev
              </button>
              <p className="text-sm text-text-muted">Page 1 of 3</p>
              <button type="button" className="h-9 rounded-base border border-border-ghost px-3 text-sm text-text-sub">
                Next
              </button>
            </div>
          </Card>
    </DashboardShell>
  );
}
