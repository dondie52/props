"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

export type PropertyCardRow = {
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

export default function PropertiesClient({ initialProperties }: { initialProperties: PropertyCardRow[] }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(
    () => initialProperties.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [initialProperties, search],
  );

  return (
    <DashboardShell title="Properties">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-primary">My Properties</h1>
        <Link href="/dashboard/onboarding" className="inline-flex h-11 items-center rounded-base bg-accent px-6 text-sm font-medium text-white">
          Add Property
        </Link>
      </div>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search properties"
        className="h-11 w-full max-w-sm rounded-base border border-border-ghost px-3"
      />
      {initialProperties.length === 0 ? (
        <section className="rounded-large border border-border-ghost bg-bg-card p-8 shadow-card">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-primary">No properties yet</h2>
              <p className="mt-2 text-sm text-text-sub">Start with a minimal setup. Add units in bulk and refine details later.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/dashboard/onboarding" className="inline-flex h-11 items-center rounded-base bg-accent px-6 text-sm font-semibold text-white">
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
              <Image src="/illustrations/empty-properties.svg" alt="Empty properties" width={1200} height={800} className="h-auto w-full" />
            </div>
          </div>
        </section>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        {filtered.map((property) => (
          <Card key={property.id} className="p-6">
            <h3 className="text-lg font-semibold text-text-main">{property.name}</h3>
            <p className="text-sm text-text-muted">{property.address}</p>
            <p className="mt-3 inline-flex rounded-pill border border-border-ghost px-3 py-1 text-xs text-text-sub">{property.type}</p>
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
            {property.totalHouses > 0 ? <p className="mt-2 text-xs text-text-muted">Bedrooms across houses: {property.totalBedrooms}</p> : null}
            <div className="mb-1 mt-4 h-2 rounded-full bg-bg-page">
              <div className="h-2 rounded-full bg-primary-mid" style={{ width: `${property.occupancy}%` }} />
            </div>
            <p className="text-right text-xs text-text-muted">{property.occupancy}% occupied</p>
            <div className="flex gap-2">
              <Link href={`/dashboard/properties/${property.id}`} className="h-9 rounded-base border border-primary px-4 text-sm leading-9 text-primary">
                View Details
              </Link>
              <Link href={`/dashboard/properties/${property.id}`} className="h-9 rounded-base bg-accent px-4 text-sm leading-9 text-white">
                Add Unit
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Property">
        <div className="space-y-3">
          <p className="text-sm text-text-sub">Use quick setup to create a property with units in one flow.</p>
          <Link href="/dashboard/onboarding" className="flex h-11 items-center justify-center rounded-base bg-primary text-white">
            Open quick setup
          </Link>
        </div>
      </Modal>
    </DashboardShell>
  );
}
