"use client";

import { useState } from "react";
import { useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import StatusChip from "@/components/ui/StatusChip";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { getLandlordScope } from "@/lib/dashboard-scope";

type Ticket = {
  id: string;
  title: string;
  property: string;
  urgency: "low" | "medium" | "high";
  status: "open" | "in-progress" | "resolved";
};

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const move = async (id: string) => {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket) return;
    const nextStatus = ticket.status === "open" ? "in-progress" : "resolved";
    await supabase.from("maintenance_requests").update({ status: nextStatus }).eq("id", id);
    setTickets((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
  };

  useEffect(() => {
    const loadTickets = async () => {
      const scope = await getLandlordScope(supabase);
      if (!scope.landlordId || scope.unitIds.length === 0) {
        setTickets([]);
        return;
      }

      const { data } = await supabase
        .from("maintenance_requests")
        .select("id,category,description,urgency,status,units(unit_number,properties(name))")
        .in("unit_id", scope.unitIds)
        .order("created_at", { ascending: false });

      const mapped: Ticket[] = (data ?? []).map((row) => {
        const rowObj = row as unknown as { id?: unknown; category?: unknown; description?: unknown; urgency?: unknown; status?: unknown; units?: unknown };
        const unit = Array.isArray(rowObj.units) ? rowObj.units[0] : rowObj.units;
        const property = unit && Array.isArray(unit.properties) ? unit.properties[0] : unit?.properties;
        const urgency =
          rowObj.urgency === "high" || rowObj.urgency === "medium" || rowObj.urgency === "low" ? rowObj.urgency : "low";
        const status =
          rowObj.status === "open" || rowObj.status === "in-progress" || rowObj.status === "resolved" ? rowObj.status : "open";
        return {
          id: String(rowObj.id ?? ""),
          title: (rowObj.description as string | undefined) ?? (rowObj.category as string | undefined) ?? "Maintenance issue",
          property: property?.name ?? "Unknown property",
          urgency,
          status,
        };
      });
      setTickets(mapped);
    };
    void loadTickets();
  }, []);

  const columns = ["open", "in-progress", "resolved"] as const;
  return (
    <DashboardShell title="Maintenance">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Maintenance Board</h1>
            <p className="text-sm text-text-muted mt-1">Track and manage property maintenance requests</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="btn-accent px-6"
          >
            New Request
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select className="input-field max-w-[160px]"><option>All Properties</option></select>
          <select className="input-field max-w-[160px]"><option>All Categories</option></select>
          <select className="input-field max-w-[160px]"><option>Any Urgency</option></select>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="flex gap-6 min-w-[900px] lg:min-w-0">
            {columns.map((column) => (
              <div key={column} className="flex-1 flex flex-col min-w-[300px]">
                <div className="mb-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-sub">{column.replace("-", " ")}</h2>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-600">
                      {tickets.filter((ticket) => ticket.status === column).length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 rounded-2xl bg-slate-100/50 p-3 ring-1 ring-inset ring-slate-200/50 min-h-[500px]">
                  {tickets.filter((ticket) => ticket.status === column).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group relative rounded-xl border border-border-ghost bg-white p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded">General</span>
                        <StatusChip status={ticket.urgency} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-text-main leading-tight">{ticket.property}</p>
                        <p className="text-xs text-text-muted mt-1">Unit {ticket.id.slice(0, 4)}</p>
                      </div>

                      <p className="mt-3 text-sm text-text-sub line-clamp-2">{ticket.title}</p>

                      <div className="mt-4 flex items-center justify-between border-t border-border-ghost pt-3">
                        <span className="text-[10px] text-text-muted font-medium">06 May 2026</span>
                        {column !== "resolved" ? (
                          <button
                            type="button"
                            onClick={() => move(ticket.id)}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            Next Stage →
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-success flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {tickets.filter((ticket) => ticket.status === column).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                      <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-300 mb-3" />
                      <p className="text-xs font-medium text-slate-400">Empty column</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Maintenance Request">
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Property & Unit</label>
              <select className="input-field">
                <option>Select property...</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Category</label>
              <select className="input-field">
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>General Repair</option>
                <option>Appliance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Description</label>
              <textarea
                className="w-full rounded-xl border border-border-muted bg-white px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                rows={4}
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Urgency Level</label>
              <div className="flex gap-3">
                {["Low", "Medium", "High"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`flex-1 h-10 rounded-lg border text-xs font-bold transition-all ${
                      level === "Medium"
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "border-border-muted text-text-sub hover:bg-bg-page"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-outline flex-1 h-11">
              Cancel
            </button>
            <button type="button" className="btn-primary flex-1 h-11">
              Create Request
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
