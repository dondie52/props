"use client";

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
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Properties</h1>
            <p className="text-sm text-text-muted mt-1">Manage and track your property portfolio</p>
          </div>
          <Link href="/dashboard/onboarding" className="btn-accent px-6">
            Add New Property
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-sm">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search properties by name..."
              className="input-field pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {initialProperties.length === 0 ? (
          <section className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-ghost bg-white p-12 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary mb-6">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-main">No properties found</h2>
            <p className="mt-2 max-w-sm text-text-muted">Start by adding your first property. You can add units in bulk or individually later.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/onboarding" className="btn-accent px-8">
                Quick Setup
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn-outline px-8"
              >
                Add Manually
              </button>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <Card key={property.id} className="flex flex-col overflow-hidden p-0">
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">{property.name}</h3>
                    <p className="mt-1 text-sm text-text-muted line-clamp-1">{property.address}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {property.type}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-bg-page/50 p-3 ring-1 ring-inset ring-border-ghost">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Units</p>
                    <p className="mt-1 text-lg font-bold text-text-main">{property.totalUnits}</p>
                  </div>
                  <div className="rounded-xl bg-bg-page/50 p-3 ring-1 ring-inset ring-border-ghost">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Occupied</p>
                    <p className="mt-1 text-lg font-bold text-success">{property.occupiedUnits}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-sub">Occupancy Rate</span>
                    <span className="font-bold text-text-main">{property.occupancy}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-page ring-1 ring-inset ring-border-ghost">
                    <div
                      className={`h-full transition-all duration-500 ${
                        property.occupancy > 80 ? 'bg-success' : property.occupancy > 40 ? 'bg-accent' : 'bg-error'
                      }`}
                      style={{ width: `${property.occupancy}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border-ghost bg-bg-page/30 p-4">
                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="flex-1 btn-outline h-9 text-xs"
                >
                  View Details
                </Link>
                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="flex-1 btn-primary h-9 text-xs"
                >
                  Add Unit
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Property">
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 p-4 text-center">
              <p className="text-sm font-medium text-primary">Recommendation</p>
              <p className="mt-1 text-xs text-text-sub">Use quick setup to create a property with units in one seamless flow.</p>
            </div>
            <Link href="/dashboard/onboarding" className="btn-primary w-full h-11">
              Open Quick Setup
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border-ghost" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bg-card px-2 text-text-muted font-medium">Or continue manually</span>
              </div>
            </div>
            <div className="space-y-3">
              <input className="input-field" placeholder="Property Name" />
              <input className="input-field" placeholder="Address" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 btn-outline h-11">
                  Cancel
                </button>
                <button type="button" className="flex-1 btn-primary h-11">
                  Save Property
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
