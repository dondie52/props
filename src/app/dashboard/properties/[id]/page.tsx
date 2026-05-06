"use client";

import Link from "next/link";
import { Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import { supabase } from "@/lib/supabase";

type UnitRow = {
  number: string;
  tenant: string;
  rent: string;
  leaseEnd: string;
  status: "occupied" | "vacant" | "active" | "expiring";
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const propertyId = params?.id;
  const [selectedUnit, setSelectedUnit] = useState<UnitRow | null>(null);
  const [property, setProperty] = useState({ name: "Property", address: "", type: "" });
  const [units, setUnits] = useState<UnitRow[]>([]);

  useEffect(() => {
    if (!propertyId) return;

    const loadProperty = async () => {
      const [{ data: propertyData }, { data: unitData }] = await Promise.all([
        supabase.from("properties").select("name,address,city,type").eq("id", propertyId).single(),
        supabase
          .from("units")
          .select("unit_number,rent_amount,status,tenants(full_name,lease_end)")
          .eq("property_id", propertyId)
          .order("unit_number", { ascending: true }),
      ]);

      if (propertyData) {
        setProperty({
          name: propertyData.name,
          address: `${propertyData.address}, ${propertyData.city}`,
          type: propertyData.type,
        });
      }

      const mappedUnits: UnitRow[] = (unitData ?? []).map((unit) => {
        const tenant = Array.isArray(unit.tenants) ? unit.tenants[0] : unit.tenants;
        const leaseEnd = tenant?.lease_end ?? "-";
        const mappedStatus: UnitRow["status"] =
          unit.status === "vacant"
            ? "vacant"
            : leaseEnd !== "-" && new Date(leaseEnd).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 60
              ? "expiring"
              : "occupied";

        const rent = new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
          .format(Number(unit.rent_amount ?? 0))
          .replace("BWP", "P")
          .trim();

        return {
          number: unit.unit_number ?? "-",
          tenant: tenant?.full_name ?? "-",
          rent,
          leaseEnd,
          status: mappedStatus,
        };
      });

      setUnits(mappedUnits);
    };

    void loadProperty();
  }, [propertyId]);

  const summary = useMemo(() => {
    const total = units.length;
    const occupied = units.filter((unit) => unit.status !== "vacant").length;
    const revenue = units.filter((unit) => unit.status !== "vacant").reduce((sum, unit) => {
      const numeric = Number(unit.rent.replace(/[^\d.-]/g, ""));
      return sum + (Number.isNaN(numeric) ? 0 : numeric);
    }, 0);
    return { total, occupied, vacant: total - occupied, revenue };
  }, [units]);

  return (
    <div className="flex min-h-screen bg-bg-page">
      <aside className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      <div className="ml-60 flex-1">
        <div className="fixed left-60 right-0 top-0 z-20">
          <Topbar title="Property Details" />
        </div>
        <main className="space-y-6 p-8 pt-24">
          <p className="text-sm text-text-muted">
            <Link href="/dashboard/properties" className="text-primary-mid">
              Properties
            </Link>{" "}
            / {property.name}
          </p>
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">{property.name}</h1>
                <p className="text-text-muted">{property.address}</p>
                <p className="mt-2 inline-flex rounded-pill border border-border-ghost px-3 py-1 text-xs text-text-sub">
                  {property.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="h-11 rounded-base border border-primary px-4 text-sm text-primary">
                  Edit
                </button>
                <button type="button" className="h-11 rounded-base bg-accent px-4 text-sm text-white">
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
              <p className="mt-1 text-xl font-semibold text-text-main">P{summary.revenue.toLocaleString()}</p>
            </div>
          </div>
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-primary">Units</h2>
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
                {units.map((unit) => (
                  <tr
                    key={unit.number}
                    className="cursor-pointer border-b border-border-ghost hover:bg-bg-page"
                    onClick={() => setSelectedUnit(unit)}
                  >
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
                          View
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
          </Card>
        </main>
      </div>
      {selectedUnit ? (
        <aside className="fixed inset-y-0 right-0 z-40 w-[320px] border-l border-border-ghost bg-bg-card p-6 shadow-modal">
          <button type="button" aria-label="Close details panel" className="ml-auto block text-text-muted" onClick={() => setSelectedUnit(null)}>
            <X className="h-5 w-5" />
          </button>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary-mid text-sm font-medium text-white">
              {selectedUnit.tenant
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <p className="font-medium text-text-main">{selectedUnit.tenant}</p>
              <p className="text-xs text-text-muted">Unit {selectedUnit.number}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-text-sub">
            <p>Lease Start: -</p>
            <p>Lease End: {selectedUnit.leaseEnd}</p>
            <p>Rent Amount: {selectedUnit.rent}</p>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-text-main">Last 3 Payments</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-base border border-border-ghost bg-bg-page p-2">
                <span className="text-xs text-text-sub">Apr 2026 · P2,400</span>
                <StatusChip status="paid" />
              </div>
              <div className="flex items-center justify-between rounded-base border border-border-ghost bg-bg-page p-2">
                <span className="text-xs text-text-sub">Mar 2026 · P2,400</span>
                <StatusChip status="paid" />
              </div>
              <div className="flex items-center justify-between rounded-base border border-border-ghost bg-bg-page p-2">
                <span className="text-xs text-text-sub">Feb 2026 · P2,400</span>
                <StatusChip status="pending" />
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
