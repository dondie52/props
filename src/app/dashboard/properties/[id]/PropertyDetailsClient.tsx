"use client";

import Link from "next/link";
import { Pencil, X, ChevronRight, Building2, Users, LayoutGrid, Coins, Plus, MoreHorizontal, Mail, Calendar, MapPin, Search } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { addUnitAction, assignTenantToUnitAction } from "@/app/dashboard/properties/actions";

export type PaymentPreviewRow = {
  id: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
};

export type UnitRow = {
  id: string;
  number: string;
  tenantId: string | null;
  tenant: string;
  tenantEmail: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  rent: string;
  status: "occupied" | "vacant" | "active" | "expiring";
  payments: PaymentPreviewRow[];
};

type PropertySummary = {
  id: string;
  name: string;
  address: string;
  type: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(value)
    .replace("BWP", "P")
    .trim();

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function PropertyDetailsClient({ property, initialUnits }: { property: PropertySummary; initialUnits: UnitRow[] }) {
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = useState<UnitRow | null>(null);
  const [assigningUnit, setAssigningUnit] = useState<UnitRow | null>(null);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [inviteWarning, setInviteWarning] = useState("");

  const [newUnit, setNewUnit] = useState({ unitNumber: "", rentAmount: "" });
  const [tenantForm, setTenantForm] = useState({
    fullName: "",
    email: "",
    leaseStart: today(),
    leaseEnd: "",
    rentAmount: "",
  });
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const summary = useMemo(() => {
    const total = initialUnits.length;
    const occupied = initialUnits.filter((unit) => unit.status !== "vacant").length;
    const revenue = initialUnits.filter((unit) => unit.status !== "vacant").reduce((sum, unit) => sum + unit.rentAmount, 0);
    return { total, occupied, vacant: total - occupied, revenue };
  }, [initialUnits]);

  const openUnit = (unit: UnitRow) => {
    setError("");
    setInviteWarning("");
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (unit.status === "vacant") {
      setAssigningUnit(unit);
      setTenantForm({ fullName: "", email: "", leaseStart: today(), leaseEnd: "", rentAmount: String(unit.rentAmount || "") });
      return;
    }
    setSelectedUnit(unit);
  };

  const closeUnitDetails = () => {
    setSelectedUnit(null);
    previousFocusRef.current?.focus();
  };

  const onUnitCardKeyDown = (event: KeyboardEvent<HTMLElement>, unit: UnitRow) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openUnit(unit);
  };

  useEffect(() => {
    if (!selectedUnit) return;

    detailsPanelRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeUnitDetails();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedUnit]);

  const onAddUnit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await addUnitAction({
          propertyId: property.id,
          unitNumber: newUnit.unitNumber,
          rentAmount: Number(newUnit.rentAmount || 0),
        });
        setNewUnit({ unitNumber: "", rentAmount: "" });
        setIsAddingUnit(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add unit.");
      }
    });
  };

  const submitTenantAssignment = (createInvite: boolean) => {
    if (!assigningUnit) return;
    setError("");
    setInviteWarning("");
    startTransition(async () => {
      try {
        const result = await assignTenantToUnitAction({
          unitId: assigningUnit.id,
          fullName: tenantForm.fullName,
          email: tenantForm.email,
          leaseStart: tenantForm.leaseStart,
          leaseEnd: tenantForm.leaseEnd,
          rentAmount: tenantForm.rentAmount ? Number(tenantForm.rentAmount) : null,
          createInvite,
        });
        if (result.needsInvite) {
          setInviteWarning(result.message ?? "No tenant account exists for this email yet.");
          return;
        }
        setAssigningUnit(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to assign tenant.");
      }
    });
  };

  const onAssignTenant = (event: FormEvent) => {
    event.preventDefault();
    submitTenantAssignment(false);
  };

  return (
    <DashboardShell title="Property Details">
      <div className="space-y-8">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
          <Link href="/dashboard/properties" className="hover:text-primary transition-colors flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Properties
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">{property.name}</span>
        </nav>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white p-8 rounded-2xl border border-border-ghost shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900 text-white shadow-lg">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-text-main">{property.name}</h1>
                <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {property.type}
                </span>
              </div>
              <p className="mt-1.5 font-medium text-text-muted flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {property.address}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-outline h-11 px-5 font-bold">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Property
            </button>
            <button type="button" onClick={() => setIsAddingUnit(true)} className="btn-accent h-11 px-6 font-bold shadow-lg shadow-accent/20">
              <Plus className="mr-2 h-4 w-4" />
              Add New Unit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted">Total Units</p>
              <LayoutGrid className="h-4 w-4 text-primary/40 group-hover:text-primary/60" />
            </div>
            <p className="text-3xl font-black text-text-main">{summary.total}</p>
          </div>
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted">Occupancy</p>
              <Users className="h-4 w-4 text-emerald-400 group-hover:text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-600">{summary.occupied}</p>
          </div>
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted">Vacant</p>
              <div className="h-2 w-2 rounded-full bg-rose-400 group-hover:animate-pulse" />
            </div>
            <p className="text-3xl font-black text-rose-500">{summary.vacant}</p>
          </div>
          <div className="group rounded-2xl border border-border-ghost bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted">Est. Revenue</p>
              <Coins className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-text-main">{formatMoney(summary.revenue)}</p>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-none ring-1 ring-border-ghost shadow-lg">
          <div className="flex items-center justify-between border-b border-border-ghost bg-white px-8 py-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-text-main">Units & Tenants</h2>
              <p className="text-xs font-medium text-text-muted mt-1">Manage individual units and lease agreements</p>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 text-text-muted hover:text-primary transition-colors">
                 <Search className="h-5 w-5" />
               </button>
               <button className="p-2 text-text-muted hover:text-primary transition-colors">
                 <MoreHorizontal className="h-5 w-5" />
               </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-page/40 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                    <th className="px-8 py-5">Unit No.</th>
                    <th className="px-8 py-5">Tenant Information</th>
                    <th className="px-8 py-5">Rent Amount</th>
                    <th className="px-8 py-5">Lease End</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-ghost/60">
                  {initialUnits.map((unit) => (
                    <tr
                      key={unit.id}
                      className="group cursor-pointer transition-all hover:bg-bg-page/50"
                      onClick={() => openUnit(unit)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-sm font-black text-primary ring-1 ring-primary/10">
                            {unit.number}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {unit.tenant !== "Vacant" ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                              {unit.tenant.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-text-main leading-tight">{unit.tenant}</p>
                              <p className="text-xs font-medium text-text-muted">{unit.tenantEmail}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-text-muted italic">
                             <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                             <span className="text-xs font-medium uppercase tracking-wider">Unassigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-text-main tracking-tight">{unit.rent}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
                          <Calendar className="h-3.5 w-3.5 opacity-40" />
                          {unit.leaseEnd || "N/A"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusChip status={unit.status} />
                      </td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {unit.status === "vacant" ? (
                            <button
                              type="button"
                              onClick={() => openUnit(unit)}
                              className="btn-primary h-9 px-4 text-[11px] font-bold"
                            >
                              ASSIGN TENANT
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openUnit(unit)}
                              className="btn-outline h-9 px-4 text-[11px] font-bold"
                            >
                              VIEW DETAILS
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-4 p-4 md:hidden">
            {initialUnits.map((unit) => (
              <article
                key={unit.id}
                role="button"
                tabIndex={0}
                className="rounded-xl border border-border-ghost bg-bg-page/30 p-4 transition-all active:bg-bg-page"
                onClick={() => openUnit(unit)}
                onKeyDown={(event) => onUnitCardKeyDown(event, unit)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-text-main">Unit {unit.number}</p>
                  <StatusChip status={unit.status} />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-text-sub">{unit.tenant}</p>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{unit.rent}</span>
                    {unit.leaseEnd && <span>Lease ends: {unit.leaseEnd}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      {selectedUnit ? (
        <>
          <button
            type="button"
            aria-label="Close details panel"
            className="fixed inset-0 z-40 cursor-default bg-slate-900/30 backdrop-blur-[1px]"
            onClick={closeUnitDetails}
          />
        <aside
          ref={detailsPanelRef}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border-ghost bg-white shadow-2xl transition-all md:w-[480px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unit-details-title"
          tabIndex={-1}
        >
          <div className="flex items-center justify-between bg-bg-page/30 border-b border-border-ghost px-8 py-6">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-xl bg-primary-900 flex items-center justify-center text-white">
                 <LayoutGrid className="h-4 w-4" />
               </div>
               <h3 id="unit-details-title" className="text-xl font-black tracking-tight text-text-main">Unit {selectedUnit.number}</h3>
            </div>
            <button
              type="button"
              aria-label="Close details panel"
              className="rounded-xl p-2.5 text-text-muted transition-all hover:bg-white hover:text-error hover:shadow-sm"
              onClick={closeUnitDetails}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Tenant Hero */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-50 text-2xl font-black text-primary shadow-inner ring-4 ring-white">
                {selectedUnit.tenant.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}
              </div>
              <h4 className="mt-6 text-2xl font-black text-text-main">{selectedUnit.tenant}</h4>
              <div className="mt-2 flex items-center gap-4 text-sm font-bold text-text-muted">
                 <div className="flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                   <Mail className="h-3 w-3" />
                   {selectedUnit.tenantEmail}
                 </div>
              </div>
              <div className="mt-6">
                 <StatusChip status={selectedUnit.status} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-bg-page/40 rounded-2xl p-5 border border-border-ghost/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Rent</p>
                  </div>
                  <p className="text-xl font-black text-text-main">{selectedUnit.rent}</p>
               </div>
               <div className="bg-bg-page/40 rounded-2xl p-5 border border-border-ghost/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Expiring</p>
                  </div>
                  <p className="text-xl font-black text-text-main leading-none">{selectedUnit.leaseEnd.split('-')[0] || "N/A"}</p>
                  <p className="text-[10px] font-bold text-text-muted mt-1 uppercase">{selectedUnit.leaseEnd || "No date"}</p>
               </div>
            </div>

            {/* Lease Details */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted border-b border-border-ghost pb-3">Lease Information</h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-border-ghost/50">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-text-sub">Started On</span>
                   </div>
                   <span className="text-sm font-black text-text-main tracking-tight">{selectedUnit.leaseStart}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-border-ghost/50">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-text-sub">Ending On</span>
                   </div>
                   <span className="text-sm font-black text-text-main tracking-tight">{selectedUnit.leaseEnd}</span>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-ghost pb-3">
                <h5 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Recent Activity</h5>
                <Link href="/dashboard/payments" className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">Full Ledger</Link>
              </div>
              <div className="space-y-3">
                {selectedUnit.payments.length ? (
                  selectedUnit.payments.map((payment) => (
                    <div key={payment.id} className="group flex items-center justify-between rounded-2xl border border-border-ghost bg-white p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          P
                        </div>
                        <div>
                          <p className="text-base font-black text-text-main leading-tight">{formatMoney(payment.amount)}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase mt-1">DUE: {payment.dueDate}</p>
                        </div>
                      </div>
                      <StatusChip status={payment.status} />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-border-ghost bg-bg-page/40 p-8 text-center">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No transaction history</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-bg-page/40 p-8 border-t border-border-ghost">
            <button className="btn-primary w-full py-4 text-sm font-black uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-transform">
              Edit Lease Agreement
            </button>
          </div>
        </aside>
        </>
      ) : null}

      <Modal isOpen={isAddingUnit} onClose={() => setIsAddingUnit(false)} title="Add New Unit">
        <form onSubmit={onAddUnit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Unit Identification</label>
            <input
              value={newUnit.unitNumber}
              onChange={(event) => setNewUnit((current) => ({ ...current, unitNumber: event.target.value }))}
              className="input-field"
              placeholder="e.g. Unit 101 or Room A"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Base Rent (BWP)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-muted">P</span>
              <input
                value={newUnit.rentAmount}
                onChange={(event) => setNewUnit((current) => ({ ...current, rentAmount: event.target.value }))}
                className="input-field pl-8"
                type="number"
                min={0}
                placeholder="0.00"
              />
            </div>
          </div>
          {error ? (
            <div className="rounded-lg bg-error/5 p-3 text-xs font-medium text-error">
              {error}
            </div>
          ) : null}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsAddingUnit(false)} className="btn-outline flex-1 h-11">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary flex-1 h-11">
              {pending ? "Adding..." : "Create Unit"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(assigningUnit)}
        onClose={() => {
          setAssigningUnit(null);
          setInviteWarning("");
        }}
        title={`Assign Tenant to ${assigningUnit?.number}`}
      >
        <form onSubmit={onAssignTenant} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Full Name</label>
              <input
                value={tenantForm.fullName}
                onChange={(event) => setTenantForm((current) => ({ ...current, fullName: event.target.value }))}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Email Address</label>
              <input
                value={tenantForm.email}
                onChange={(event) => setTenantForm((current) => ({ ...current, email: event.target.value }))}
                className="input-field"
                placeholder="john@example.com"
                type="email"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-main">Lease Start</label>
                <input
                  value={tenantForm.leaseStart}
                  onChange={(event) => setTenantForm((current) => ({ ...current, leaseStart: event.target.value }))}
                  className="input-field"
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-main">Lease End</label>
                <input
                  value={tenantForm.leaseEnd}
                  onChange={(event) => setTenantForm((current) => ({ ...current, leaseEnd: event.target.value }))}
                  className="input-field"
                  type="date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Monthly Rent (BWP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-muted">P</span>
                <input
                  value={tenantForm.rentAmount}
                  onChange={(event) => setTenantForm((current) => ({ ...current, rentAmount: event.target.value }))}
                  className="input-field pl-8"
                  type="number"
                  min={0}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          {error ? (
            <div className="rounded-lg bg-error/5 p-3 text-xs font-medium text-error">
              {error}
            </div>
          ) : null}
          {inviteWarning ? (
            <div className="rounded-lg bg-warning/10 p-3 text-xs font-medium text-warning">
              <p>{inviteWarning}</p>
              <button
                type="button"
                onClick={() => submitTenantAssignment(true)}
                disabled={pending}
                className="mt-3 h-9 rounded-base bg-primary px-3 text-xs font-bold text-white disabled:opacity-50"
              >
                Create Pending Tenant Profile
              </button>
            </div>
          ) : null}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setAssigningUnit(null);
                setInviteWarning("");
              }}
              className="btn-outline flex-1 h-11"
            >
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary flex-1 h-11">
              {pending ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
