"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Home, MapPin, Search, Plus, ArrowRight, LayoutGrid } from "lucide-react";
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-border-ghost shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">Property Portfolio</h1>
            <p className="text-sm text-text-muted mt-1">Manage {initialProperties.length} properties across your collection</p>
          </div>
          <Link href="/dashboard/onboarding" className="btn-accent px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20">
            <Plus className="h-4 w-4" />
            Add New Property
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search properties by name or location..."
              className="input-field pl-10 h-11 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <LayoutGrid className="h-4 w-4" />
            Grid View
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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <Card key={property.id} className="flex flex-col overflow-hidden p-0 group border-none ring-1 ring-border-ghost hover:ring-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-2 bg-primary/10 group-hover:bg-primary/30 transition-colors" />
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary shadow-sm ring-1 ring-primary/10">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {property.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-text-main group-hover:text-primary transition-colors">{property.name}</h3>
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-sm line-clamp-1">{property.address}</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-bg-page/40 p-4 border border-border-ghost/50">
                    <div className="flex items-center gap-2 mb-1.5 text-text-muted">
                      <Home className="h-3.5 w-3.5" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Units</p>
                    </div>
                    <p className="text-2xl font-black text-text-main leading-none">{property.totalUnits}</p>
                  </div>
                  <div className="rounded-2xl bg-bg-page/40 p-4 border border-border-ghost/50">
                    <div className="flex items-center gap-2 mb-1.5 text-text-muted">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Active</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 leading-none">{property.occupiedUnits}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Occupancy</span>
                    <span className="text-xs font-black text-text-main">{property.occupancy}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-page border border-border-ghost/30">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${
                        property.occupancy > 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : property.occupancy > 40 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      }`}
                      style={{ width: `${property.occupancy}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-bg-page/50 p-6 border-t border-border-ghost/50">
                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="flex-1 btn-outline py-2.5 text-xs font-bold"
                >
                  Details
                </Link>
                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  Units
                  <ArrowRight className="h-3.5 w-3.5" />
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
