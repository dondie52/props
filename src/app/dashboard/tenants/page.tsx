"use client";

import Link from "next/link";
import { Eye, Mail, Users, Search, Filter, UserPlus, MapPin } from "lucide-react";
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-8 rounded-2xl border border-border-ghost shadow-sm">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-primary-900 flex items-center justify-center text-white shadow-lg">
                <Users className="h-7 w-7" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tight text-text-main">Tenant Directory</h1>
                <p className="text-sm font-medium text-text-muted mt-1">Manage and communicate with all property residents</p>
             </div>
          </div>
          <Link href="/dashboard/properties" className="btn-accent h-12 px-8 flex items-center gap-2 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95">
            <UserPlus className="h-4 w-4" />
            Assign Tenant
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-10 h-11 bg-white shadow-sm"
              placeholder="Search by name, email, or property..."
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="input-field pl-9 h-11 min-w-[160px] text-xs font-bold uppercase tracking-wider appearance-none bg-white pr-10 shadow-sm"
              >
                <option value="all">All Residents</option>
                <option value="active">Active Leases</option>
                <option value="expiring">Expiring Soon</option>
                <option value="overdue">Lease Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-xl ring-1 ring-border-ghost">
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-page/40 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                    <th className="px-8 py-5">Tenant Information</th>
                    <th className="px-8 py-5">Assigned Property</th>
                    <th className="px-8 py-5">Monthly Rent</th>
                    <th className="px-8 py-5">Lease End</th>
                    <th className="px-8 py-5 text-right">Status</th>
                    <th className="px-8 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-ghost/60">
                  {filtered.map((tenant) => (
                    <tr key={tenant.name} className="group transition-all hover:bg-bg-page/50">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[11px] font-black text-slate-600 border border-slate-200 group-hover:bg-primary-900 group-hover:text-white group-hover:border-primary-900 transition-all shadow-sm">
                            {tenant.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-black text-text-main group-hover:text-primary transition-colors leading-tight">{tenant.name}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                               <Mail className="h-3 w-3 opacity-40" />
                               {tenant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <p className="font-bold text-text-main leading-tight">{tenant.property}</p>
                           <p className="mt-1 text-[10px] font-black text-text-muted uppercase bg-bg-page inline-block px-1.5 py-0.5 rounded border border-border-ghost/50 self-start">Unit {tenant.unit}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-text-main tracking-tight">{tenant.rent}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-text-sub">{tenant.leaseEnd}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <StatusChip status={tenant.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-primary-50 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                            title="View Tenant Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
                            title="Email Resident"
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

          <div className="space-y-4 p-6 md:hidden">
            {filtered.map((tenant) => (
              <article key={tenant.name} className="rounded-2xl border border-border-ghost bg-white p-5 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[10px] font-black text-slate-600 border border-slate-200">
                      {tenant.name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-black text-text-main leading-tight">{tenant.name}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight mt-0.5">{tenant.email}</p>
                    </div>
                  </div>
                  <StatusChip status={tenant.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-ghost/50">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-text-muted">
                       <MapPin className="h-3 w-3" />
                       <span className="text-[9px] font-black uppercase tracking-wider">Residence</span>
                    </div>
                    <p className="text-xs font-bold text-text-main truncate">{tenant.property} · {tenant.unit}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-1.5 text-text-muted">
                       <span className="text-[9px] font-black uppercase tracking-wider">Lease End</span>
                    </div>
                    <p className="text-xs font-black text-text-sub uppercase">{tenant.leaseEnd}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-4 border-t border-border-ghost/50">
                   <p className="text-lg font-black text-primary tracking-tight">{tenant.rent}</p>
                   <div className="flex gap-2">
                      <button className="h-8 px-3 rounded-lg bg-bg-page border border-border-ghost text-[10px] font-black uppercase tracking-wider text-text-muted hover:text-primary transition-colors">Profile</button>
                      <button className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><Mail className="h-3.5 w-3.5" /></button>
                   </div>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-border-ghost bg-bg-page/30 px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-[0.1em]">
                Showing <span className="text-primary">{filtered.length}</span> of <span className="text-text-main">{tenants.length}</span> registered residents
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button type="button" className="flex-1 sm:flex-none btn-outline h-9 px-5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30" disabled>
                  Previous
                </button>
                <button type="button" className="flex-1 sm:flex-none btn-outline h-9 px-5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30" disabled>
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
