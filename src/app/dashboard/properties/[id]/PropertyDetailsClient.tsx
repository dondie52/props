"use client";

import Link from "next/link";
import { Pencil, X } from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";
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

  const [newUnit, setNewUnit] = useState({ unitNumber: "", rentAmount: "" });
  const [tenantForm, setTenantForm] = useState({
    fullName: "",
    email: "",
    leaseStart: today(),
    leaseEnd: "",
    rentAmount: "",
  });

  const summary = useMemo(() => {
    const total = initialUnits.length;
    const occupied = initialUnits.filter((unit) => unit.status !== "vacant").length;
    const revenue = initialUnits.filter((unit) => unit.status !== "vacant").reduce((sum, unit) => sum + unit.rentAmount, 0);
    return { total, occupied, vacant: total - occupied, revenue };
  }, [initialUnits]);

  const openUnit = (unit: UnitRow) => {
    setError("");
    if (unit.status === "vacant") {
      setAssigningUnit(unit);
      setTenantForm({ fullName: "", email: "", leaseStart: today(), leaseEnd: "", rentAmount: String(unit.rentAmount || "") });
      return;
    }
    setSelectedUnit(unit);
  };

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

  const onAssignTenant = (event: FormEvent) => {
    event.preventDefault();
    if (!assigningUnit) return;
    setError("");
    startTransition(async () => {
      try {
        await assignTenantToUnitAction({
          unitId: assigningUnit.id,
          fullName: tenantForm.fullName,
          email: tenantForm.email,
          leaseStart: tenantForm.leaseStart,
          leaseEnd: tenantForm.leaseEnd,
          rentAmount: tenantForm.rentAmount ? Number(tenantForm.rentAmount) : null,
        });
        setAssigningUnit(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to assign tenant.");
      }
    });
  };

  return (
    <DashboardShell title="Property Details">
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/dashboard/properties" className="hover:text-primary transition-colors">
            Properties
          </Link>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-text-main">{property.name}</span>
        </nav>

        <Card className="overflow-hidden border-none shadow-md ring-1 ring-border-ghost">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-main">{property.name}</h1>
                <span className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {property.type}
                </span>
              </div>
              <p className="mt-1 text-text-muted">{property.address}</p>
            </div>
            <div className="flex w-full gap-3 md:w-auto">
              <button type="button" className="btn-outline flex-1 md:flex-none">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Property
              </button>
              <button type="button" onClick={() => setIsAddingUnit(true)} className="btn-accent flex-1 md:flex-none">
                Add Unit
              </button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border-ghost bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Units</p>
            <p className="mt-2 text-2xl font-bold text-text-main">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-border-ghost bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Occupancy</p>
            <p className="mt-2 text-2xl font-bold text-success">{summary.occupied}</p>
          </div>
          <div className="rounded-xl border border-border-ghost bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Vacant</p>
            <p className="mt-2 text-2xl font-bold text-error">{summary.vacant}</p>
          </div>
          <div className="rounded-xl border border-border-ghost bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Est. Revenue</p>
            <p className="mt-2 text-2xl font-bold text-text-main">{formatMoney(summary.revenue)}</p>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-border-ghost px-6 py-4">
            <h2 className="text-lg font-bold text-text-main">Units & Tenants</h2>
          </div>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-page/50 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4">Unit No</th>
                    <th className="px-6 py-4">Tenant</th>
                    <th className="px-6 py-4">Rent</th>
                    <th className="px-6 py-4">Lease End</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-ghost">
                  {initialUnits.map((unit) => (
                    <tr
                      key={unit.id}
                      className="group cursor-pointer transition-colors hover:bg-bg-page/50"
                      onClick={() => openUnit(unit)}
                    >
                      <td className="px-6 py-4 font-bold text-text-main">{unit.number}</td>
                      <td className="px-6 py-4">
                        {unit.tenant !== "Vacant" ? (
                          <div>
                            <p className="font-medium text-text-main">{unit.tenant}</p>
                            <p className="text-xs text-text-muted">{unit.tenantEmail}</p>
                          </div>
                        ) : (
                          <span className="text-text-muted italic">No tenant assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-text-main">{unit.rent}</td>
                      <td className="px-6 py-4 text-text-sub">{unit.leaseEnd || "-"}</td>
                      <td className="px-6 py-4">
                        <StatusChip status={unit.status} />
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {unit.status === "vacant" ? (
                            <button
                              type="button"
                              onClick={() => openUnit(unit)}
                              className="btn-primary h-8 px-3 text-xs"
                            >
                              Assign
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openUnit(unit)}
                              className="btn-outline h-8 px-3 text-xs"
                            >
                              View
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
                className="rounded-xl border border-border-ghost bg-bg-page/30 p-4 transition-all active:bg-bg-page"
                onClick={() => openUnit(unit)}
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
        <aside className="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-border-ghost bg-bg-card shadow-2xl transition-all md:w-[400px]">
          <div className="flex items-center justify-between border-b border-border-ghost px-6 py-5">
            <h3 className="text-lg font-bold text-text-main">Unit Details</h3>
            <button
              type="button"
              aria-label="Close details panel"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-page hover:text-text-main"
              onClick={() => setSelectedUnit(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-inner">
                {selectedUnit.tenant.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}
              </div>
              <div>
                <p className="text-xl font-bold text-text-main">{selectedUnit.tenant}</p>
                <p className="text-sm font-medium text-text-muted">Unit {selectedUnit.number}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-bg-page/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Rent Amount</p>
                  <p className="mt-1 font-bold text-text-main">{selectedUnit.rent}</p>
                </div>
                <div className="rounded-xl bg-bg-page/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Status</p>
                  <div className="mt-1">
                    <StatusChip status={selectedUnit.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text-main">Lease Information</h4>
                <div className="rounded-xl border border-border-ghost divide-y divide-border-ghost overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-text-muted">Lease Start</span>
                    <span className="font-medium text-text-main">{selectedUnit.leaseStart}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-text-muted">Lease End</span>
                    <span className="font-medium text-text-main">{selectedUnit.leaseEnd}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-main">Recent Activity</h4>
                  <Link href="/dashboard/payments" className="text-xs font-medium text-primary hover:underline">View History</Link>
                </div>
                <div className="space-y-3">
                  {selectedUnit.payments.length ? (
                    selectedUnit.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-xl border border-border-ghost bg-white p-3 shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-text-main">{formatMoney(payment.amount)}</p>
                          <p className="text-[10px] text-text-muted">Due: {payment.dueDate}</p>
                        </div>
                        <StatusChip status={payment.status} />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-border-ghost bg-bg-page/50 p-6 text-center">
                      <p className="text-xs text-text-muted">No payments recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border-ghost bg-bg-page/30 p-6">
            <button className="btn-primary w-full py-3 shadow-lg shadow-primary/10">
              Manage Lease
            </button>
          </div>
        </aside>
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

      <Modal isOpen={Boolean(assigningUnit)} onClose={() => setAssigningUnit(null)} title={`Assign Tenant to ${assigningUnit?.number}`}>
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
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAssigningUnit(null)} className="btn-outline flex-1 h-11">
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
