"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Wrench, Filter, Plus, ChevronRight, Clock, CheckCircle2, LayoutGrid, Search, MoreHorizontal } from "lucide-react";
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-8 rounded-2xl border border-border-ghost shadow-sm">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-primary-900 flex items-center justify-center text-white shadow-lg">
                <Wrench className="h-7 w-7" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tight text-text-main">Maintenance Board</h1>
                <p className="text-sm font-medium text-text-muted mt-1">Track and resolve service requests across your portfolio</p>
             </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="btn-accent h-12 px-8 flex items-center gap-2 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
             <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <select className="input-field pl-9 h-10 text-xs font-bold uppercase tracking-wider pr-10 appearance-none bg-white min-w-[160px]">
                  <option>All Properties</option>
                </select>
             </div>
             <select className="input-field h-10 text-xs font-bold uppercase tracking-wider appearance-none bg-white min-w-[140px]">
               <option>Any Category</option>
             </select>
           </div>
           <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input placeholder="Search tickets..." className="input-field pl-9 h-10 text-xs w-full sm:w-48 bg-white" />
              </div>
              <button className="p-2 text-text-muted hover:text-primary transition-colors">
                 <LayoutGrid className="h-5 w-5" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-8 min-w-[1000px]">
            {columns.map((column) => (
              <div key={column} className="flex-1 flex flex-col min-w-[320px]">
                <div className="mb-5 flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${column === 'open' ? 'bg-rose-500' : column === 'in-progress' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main">{column.replace("-", " ")}</h2>
                    <span className="flex h-5 min-w-[24px] items-center justify-center rounded-lg bg-bg-page border border-border-ghost/60 px-1.5 text-[10px] font-black text-text-muted">
                      {tickets.filter((ticket) => ticket.status === column).length}
                    </span>
                  </div>
                  <button className="text-text-muted hover:text-primary transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-4 rounded-3xl bg-bg-page/40 p-4 border border-dashed border-border-ghost/60 min-h-[600px]">
                  {tickets.filter((ticket) => ticket.status === column).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group relative rounded-2xl border border-border-ghost bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:ring-1 hover:ring-primary/10"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Ticket #{ticket.id.slice(0, 4)}</span>
                           <StatusChip status={ticket.urgency} />
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-primary transition-all">
                           <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-black text-text-main leading-tight line-clamp-2 group-hover:text-primary transition-colors">{ticket.title}</h3>
                        <div className="flex items-center gap-1.5">
                           <div className="h-1 w-1 rounded-full bg-slate-300" />
                           <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight">{ticket.property} · Unit {ticket.id.slice(0, 4)}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border-ghost/50 pt-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                           <Clock className="h-3 w-3 opacity-40" />
                           <span>06 MAY</span>
                        </div>
                        {column !== "resolved" ? (
                          <button
                            type="button"
                            onClick={() => move(ticket.id)}
                            className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-wider hover:gap-2 transition-all"
                          >
                            Move Forward
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            Resolved
                          </div>
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
