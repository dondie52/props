"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { getLandlordScope } from "@/lib/dashboard-scope";

type PropertyCardRow = {
  id: string;
  name: string;
  address: string;
  type: string;
  totalHouses: number;
  totalBedrooms: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancy: number;
};

export default function Page() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyCardRow[]>([]);

  useEffect(() => {
    const loadProperties = async () => {
      const scope = await getLandlordScope(supabase);
      if (!scope.landlordId || scope.propertyIds.length === 0) {
        setProperties([]);
        return;
      }

      const [{ data: propertyData }, { data: unitData }, { data: houseData }] = await Promise.all([
        supabase.from("properties").select("id,name,address,city,type").in("id", scope.propertyIds),
        supabase.from("units").select("id,property_id,status").in("property_id", scope.propertyIds),
        supabase.from("houses").select("property_id,bedroom_count").in("property_id", scope.propertyIds),
      ]);

      const unitTotals = new Map<string, { total: number; occupied: number }>();
      for (const unit of unitData ?? []) {
        const current = unitTotals.get(unit.property_id) ?? { total: 0, occupied: 0 };
        current.total += 1;
        if (unit.status === "occupied") current.occupied += 1;
        unitTotals.set(unit.property_id, current);
      }

      const houseTotals = new Map<string, { houses: number; bedrooms: number }>();
      for (const house of houseData ?? []) {
        const current = houseTotals.get(house.property_id) ?? { houses: 0, bedrooms: 0 };
        current.houses += 1;
        current.bedrooms += Number(house.bedroom_count ?? 0);
        houseTotals.set(house.property_id, current);
      }

      const rows: PropertyCardRow[] = (propertyData ?? []).map((property) => {
        const unitCounts = unitTotals.get(property.id) ?? { total: 0, occupied: 0 };
        const houseCounts = houseTotals.get(property.id) ?? { houses: 0, bedrooms: 0 };
        const occupancy = unitCounts.total ? Math.round((unitCounts.occupied / unitCounts.total) * 100) : 0;
        return {
          id: property.id,
          name: property.name,
          address: `${property.address}, ${property.city}`,
          type: property.type,
          totalHouses: houseCounts.houses,
          totalBedrooms: houseCounts.bedrooms,
          totalUnits: unitCounts.total,
          occupiedUnits: unitCounts.occupied,
          occupancy,
        };
      });

      setProperties(rows);
    };
    void loadProperties();
  }, []);

  const filtered = useMemo(
    () => properties.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [properties, search],
  );

  return (
    <div className="flex min-h-screen bg-bg-page">
      <aside className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      <div className="ml-60 flex-1">
        <div className="fixed left-60 right-0 top-0 z-20">
          <Topbar title="Properties" />
        </div>
        <main className="space-y-6 p-8 pt-24">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-primary">My Properties</h1>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="h-11 rounded-base bg-accent px-6 text-sm font-medium text-white"
            >
              Add Property
            </button>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search properties"
            className="h-11 w-full max-w-sm rounded-base border border-border-ghost px-3"
          />
          {properties.length === 0 ? (
            <section className="rounded-large border border-border-ghost bg-bg-card p-8 shadow-card">
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-primary">No properties yet</h2>
                  <p className="mt-2 text-sm text-text-sub">
                    Start with a minimal setup. Add units in bulk and refine details later.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard/onboarding"
                      className="inline-flex h-11 items-center rounded-base bg-accent px-6 text-sm font-semibold text-white"
                    >
                      Get started
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsOpen(true)}
                      className="inline-flex h-11 items-center rounded-base border border-border-ghost bg-white px-6 text-sm font-semibold text-primary"
                    >
                      Add manually
                    </button>
                  </div>
                </div>
                <div className="rounded-large border border-border-ghost bg-bg-page p-4">
                  <Image
                    src="/illustrations/empty-properties.svg"
                    alt="Empty properties"
                    width={1200}
                    height={800}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </section>
          ) : null}
          <div className="grid gap-6 lg:grid-cols-3">
            {filtered.map((property) => (
              <Card key={property.id} className="p-6">
                <h3 className="text-lg font-semibold text-text-main">{property.name}</h3>
                <p className="text-sm text-text-muted">{property.address}</p>
                <p className="mt-3 inline-flex rounded-pill border border-border-ghost px-3 py-1 text-xs text-text-sub">
                  {property.type}
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="rounded-base bg-bg-page p-2 text-center text-xs">
                    <p className="text-text-muted">Houses</p>
                    <p className="font-semibold text-text-main">{property.totalHouses}</p>
                  </div>
                  <div className="rounded-base bg-bg-page p-2 text-center text-xs">
                    <p className="text-text-muted">Total</p>
                    <p className="font-semibold text-text-main">{property.totalUnits}</p>
                  </div>
                  <div className="rounded-base bg-bg-page p-2 text-center text-xs">
                    <p className="text-text-muted">Occupied</p>
                    <p className="font-semibold text-text-main">{property.occupiedUnits}</p>
                  </div>
                  <div className="rounded-base bg-bg-page p-2 text-center text-xs">
                    <p className="text-text-muted">Vacant</p>
                    <p className="font-semibold text-text-main">{property.totalUnits - property.occupiedUnits}</p>
                  </div>
                </div>
                {property.totalHouses > 0 ? (
                  <p className="mt-2 text-xs text-text-muted">Bedrooms across houses: {property.totalBedrooms}</p>
                ) : null}
                <div className="mt-4 mb-1 h-2 rounded-full bg-bg-page">
                  <div className="h-2 rounded-full bg-primary-mid" style={{ width: `${property.occupancy}%` }} />
                </div>
                <p className="text-right text-xs text-text-muted">{property.occupancy}% occupied</p>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="h-9 rounded-base border border-primary px-4 text-sm leading-9 text-primary"
                  >
                    View Details
                  </Link>
                  <button type="button" className="h-9 rounded-base bg-accent px-4 text-sm text-white">
                    Add Unit
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Property">
        <div className="space-y-3">
          <input className="h-11 w-full rounded-base border border-border-ghost px-3" placeholder="Property Name" />
          <input className="h-11 w-full rounded-base border border-border-ghost px-3" placeholder="Address" />
          <input className="h-11 w-full rounded-base border border-border-ghost px-3" placeholder="City" />
          <input className="h-11 w-full rounded-base border border-border-ghost px-3" type="number" placeholder="Units" />
          <select className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Apartment</option>
            <option>Complex</option>
            <option>House</option>
          </select>
          <div className="flex gap-2">
            <button type="button" className="h-11 flex-1 rounded-base border border-primary text-primary">Cancel</button>
            <button type="button" className="h-11 flex-1 rounded-base bg-primary text-white">Save Property</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
