"use client";

import Link from "next/link";
import { Eye, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";

export type TenantRow = {
  id: string;
  name: string;
  email: string;
  property: string;
  unit: string;
  rent: string;
  leaseEnd: string;
  status: "active" | "expiring" | "overdue";
};

export default function TenantsClient({ initialTenants }: { initialTenants: TenantRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const tenants = initialTenants;

  const filtered = useMemo(
    () =>
      tenants.filter((tenant) => {
        const query = search.toLowerCase();
        const matchesSearch =
          tenant.name.toLowerCase().includes(query) ||
          tenant.email.toLowerCase().includes(query) ||
          tenant.property.toLowerCase().includes(query);
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
          <p className="text-sm text-text-muted">
            {tenants.length} active tenants. Add tenants by assigning their email to a vacant unit.
          </p>
        </div>
        <Link href="/dashboard/properties" className="inline-flex h-11 items-center justify-center rounded-base bg-accent px-6 text-white md:self-start">
          Assign Tenant to Unit
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
      <Card className="p-0 sm:p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="pb-3">Name</th>
                <th className="pb-3">Property</th>
                <th className="pb-3">Unit</th>
                <th className="pb-3">Rent</th>
                <th className="pb-3">Lease End</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant, index) => (
                <tr key={tenant.id} className={`${index % 2 === 0 ? "bg-white" : "bg-bg-page"} border-t border-border-ghost`}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-mid text-xs font-medium text-white">
                        {tenant.name
                          .split(" ")
                          .slice(0, 2)
                          .map((namePart) => namePart[0])
                          .join("") || "T"}
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{tenant.name}</p>
                        <p className="text-xs text-text-muted">{tenant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{tenant.property}</td>
                  <td>{tenant.unit}</td>
                  <td>{tenant.rent}</td>
                  <td>{tenant.leaseEnd}</td>
                  <td>
                    <StatusChip status={tenant.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-text-muted">
                      <button type="button" aria-label="View tenant" className="hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Email tenant" className="hover:text-primary">
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 sm:p-6 md:hidden">
          {filtered.map((tenant) => (
            <article key={tenant.id} className="rounded-base border border-border-ghost bg-bg-page p-3">
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
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-ghost p-4 sm:p-6">
          <button type="button" className="h-9 rounded-base border border-border-ghost px-3 text-sm text-text-sub">
            Prev
          </button>
          <p className="text-sm text-text-muted">Page 1 of 1</p>
          <button type="button" className="h-9 rounded-base border border-border-ghost px-3 text-sm text-text-sub">
            Next
          </button>
        </div>
      </Card>
    </DashboardShell>
  );
}
