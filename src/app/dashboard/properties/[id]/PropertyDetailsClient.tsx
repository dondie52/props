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
      <p className="text-sm text-text-muted">
        <Link href="/dashboard/properties" className="text-primary-mid">
          Properties
        </Link>{" "}
        / {property.name}
      </p>
      <Card>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">{property.name}</h1>
            <p className="text-text-muted">{property.address}</p>
            <p className="mt-2 inline-flex rounded-pill border border-border-ghost px-3 py-1 text-xs text-text-sub">{property.type}</p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <button type="button" className="h-11 rounded-base border border-primary px-4 text-sm text-primary">
              Edit
            </button>
            <button type="button" onClick={() => setIsAddingUnit(true)} className="h-11 rounded-base bg-accent px-4 text-sm text-white">
              Add Unit
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-base border border-border-ghost bg-bg-page p-4">
          <p className="text-xs text-text-muted">Total Units</p>
          <p className="mt-1 text-xl font-semibold text-text-main">{summary.total}</p>
        </div>
        <div className="rounded-base border border-border-ghost bg-bg-page p-4">
          <p className="text-xs text-text-muted">Occupied</p>
          <p className="mt-1 text-xl font-semibold text-text-main">{summary.occupied}</p>
        </div>
        <div className="rounded-base border border-border-ghost bg-bg-page p-4">
          <p className="text-xs text-text-muted">Vacant</p>
          <p className="mt-1 text-xl font-semibold text-text-main">{summary.vacant}</p>
        </div>
        <div className="rounded-base border border-border-ghost bg-bg-page p-4">
          <p className="text-xs text-text-muted">Monthly Revenue</p>
          <p className="mt-1 text-xl font-semibold text-text-main">{formatMoney(summary.revenue)}</p>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-primary">Units</h2>
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="pb-3">Unit No</th>
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Rent</th>
                <th className="pb-3">Lease End</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialUnits.map((unit) => (
                <tr key={unit.id} className="cursor-pointer border-b border-border-ghost hover:bg-bg-page" onClick={() => openUnit(unit)}>
                  <td className="py-3">{unit.number}</td>
                  <td>{unit.tenant}</td>
                  <td>{unit.rent}</td>
                  <td>{unit.leaseEnd}</td>
                  <td>
                    <StatusChip status={unit.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-sm">
                      <button type="button" className="text-primary-mid">
                        {unit.status === "vacant" ? "Assign tenant" : "View"}
                      </button>
                      <button type="button" aria-label="Edit unit" className="text-text-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {initialUnits.map((unit) => (
            <article key={unit.id} className="rounded-base border border-border-ghost bg-bg-page p-3" onClick={() => openUnit(unit)}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-main">Unit {unit.number}</p>
                <StatusChip status={unit.status} />
              </div>
              <p className="text-sm text-text-sub">{unit.tenant}</p>
              <p className="text-xs text-text-muted">{unit.rent}</p>
              <p className="text-xs text-text-muted">Lease end: {unit.leaseEnd}</p>
            </article>
          ))}
        </div>
      </Card>

      {selectedUnit ? (
        <aside className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-large border border-border-ghost bg-bg-card p-6 shadow-modal md:inset-y-0 md:left-auto md:right-0 md:w-[340px] md:rounded-none md:border-l">
          <button type="button" aria-label="Close details panel" className="ml-auto block text-text-muted" onClick={() => setSelectedUnit(null)}>
            <X className="h-5 w-5" />
          </button>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary-mid text-sm font-medium text-white">
              {selectedUnit.tenant.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}
            </div>
            <div>
              <p className="font-medium text-text-main">{selectedUnit.tenant}</p>
              <p className="text-xs text-text-muted">Unit {selectedUnit.number}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-text-sub">
            <p>Lease Start: {selectedUnit.leaseStart}</p>
            <p>Lease End: {selectedUnit.leaseEnd}</p>
            <p>Rent Amount: {selectedUnit.rent}</p>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-text-main">Last 3 Payments</p>
            <div className="space-y-2">
              {selectedUnit.payments.length ? (
                selectedUnit.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-base border border-border-ghost bg-bg-page p-2">
                    <span className="text-xs text-text-sub">
                      {payment.paymentDate} · {formatMoney(payment.amount)}
                    </span>
                    <StatusChip status={payment.status} />
                  </div>
                ))
              ) : (
                <p className="rounded-base border border-border-ghost bg-bg-page p-3 text-sm text-text-muted">No payments recorded yet.</p>
              )}
            </div>
          </div>
        </aside>
      ) : null}

      <Modal isOpen={isAddingUnit} onClose={() => setIsAddingUnit(false)} title="Add Unit">
        <form onSubmit={onAddUnit} className="space-y-3">
          <input
            value={newUnit.unitNumber}
            onChange={(event) => setNewUnit((current) => ({ ...current, unitNumber: event.target.value }))}
            className="h-11 w-full rounded-base border border-border-ghost px-3"
            placeholder="Unit number, e.g. A7"
          />
          <div className="flex h-11 items-center rounded-base border border-border-ghost px-3">
            <span className="text-text-muted">P</span>
            <input
              value={newUnit.rentAmount}
              onChange={(event) => setNewUnit((current) => ({ ...current, rentAmount: event.target.value }))}
              className="ml-2 w-full bg-transparent outline-none"
              type="number"
              min={0}
              placeholder="Rent amount"
            />
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsAddingUnit(false)} className="h-11 flex-1 rounded-base border border-primary text-primary">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="h-11 flex-1 rounded-base bg-primary text-white disabled:opacity-70">
              Add Unit
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(assigningUnit)} onClose={() => setAssigningUnit(null)} title={`Assign tenant${assigningUnit ? ` to ${assigningUnit.number}` : ""}`}>
        <form onSubmit={onAssignTenant} className="space-y-3">
          <input
            value={tenantForm.fullName}
            onChange={(event) => setTenantForm((current) => ({ ...current, fullName: event.target.value }))}
            className="h-11 w-full rounded-base border border-border-ghost px-3"
            placeholder="Tenant full name"
          />
          <input
            value={tenantForm.email}
            onChange={(event) => setTenantForm((current) => ({ ...current, email: event.target.value }))}
            className="h-11 w-full rounded-base border border-border-ghost px-3"
            placeholder="Tenant email"
            type="email"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-text-main">
              Lease start
              <input
                value={tenantForm.leaseStart}
                onChange={(event) => setTenantForm((current) => ({ ...current, leaseStart: event.target.value }))}
                className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3 font-normal"
                type="date"
              />
            </label>
            <label className="text-sm font-semibold text-text-main">
              Lease end
              <input
                value={tenantForm.leaseEnd}
                onChange={(event) => setTenantForm((current) => ({ ...current, leaseEnd: event.target.value }))}
                className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3 font-normal"
                type="date"
              />
            </label>
          </div>
          <div className="flex h-11 items-center rounded-base border border-border-ghost px-3">
            <span className="text-text-muted">P</span>
            <input
              value={tenantForm.rentAmount}
              onChange={(event) => setTenantForm((current) => ({ ...current, rentAmount: event.target.value }))}
              className="ml-2 w-full bg-transparent outline-none"
              type="number"
              min={0}
              placeholder="Rent amount"
            />
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setAssigningUnit(null)} className="h-11 flex-1 rounded-base border border-primary text-primary">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="h-11 flex-1 rounded-base bg-primary text-white disabled:opacity-70">
              Assign Tenant
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
