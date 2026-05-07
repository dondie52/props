"use client";

import { useState } from "react";
import { useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

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
      const { data } = await supabase
        .from("maintenance_requests")
        .select("id,category,description,urgency,status,units(unit_number,properties(name))")
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
          <div className="mb-6 flex flex-col gap-3 rounded-base border border-border-ghost bg-bg-card p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <select className="h-11 rounded-base border border-border-ghost px-3 text-sm"><option>Property</option></select>
              <select className="h-11 rounded-base border border-border-ghost px-3 text-sm"><option>Category</option></select>
              <select className="h-11 rounded-base border border-border-ghost px-3 text-sm"><option>Urgency</option></select>
              <select className="h-11 rounded-base border border-border-ghost px-3 text-sm"><option>Status</option></select>
            </div>
            <button type="button" onClick={() => setIsOpen(true)} className="h-11 rounded-base bg-accent px-4 text-white">
              New Request
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[720px] gap-6 md:min-w-0 md:grid-cols-3">
          {columns.map((column) => (
            <Card key={column}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize text-primary">{column.replace("-", " ")}</h2>
                <span className="rounded-pill bg-bg-page px-2 py-1 text-xs text-text-muted">
                  {tickets.filter((ticket) => ticket.status === column).length}
                </span>
              </div>
              <div className="space-y-3">
                {tickets.filter((ticket) => ticket.status === column).map((ticket) => (
                  <div key={ticket.id} className="rounded-base border border-border-ghost bg-white p-4 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs text-text-muted">General</p>
                      <StatusChip status={ticket.urgency} />
                    </div>
                    <p className="font-medium text-text-main">{ticket.property}</p>
                    <p className="text-sm text-text-muted">Unit {ticket.id}B</p>
                    <p className="mt-1 text-sm text-text-sub">{ticket.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-text-muted">06 May 2026</p>
                    {column !== "resolved" ? (
                      <button type="button" onClick={() => move(ticket.id)} className="text-sm text-primary-mid">
                        Move Forward →
                      </button>
                    ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
            </div>
          </div>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Request">
        <div className="space-y-3">
          <select className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Category</option>
          </select>
          <textarea className="w-full rounded-base border border-border-ghost px-3 py-2" rows={4} placeholder="Description" />
          <div className="flex gap-2">
            <button type="button" className="h-10 rounded-pill border border-border-ghost px-4 text-sm">Low</button>
            <button type="button" className="h-10 rounded-pill bg-primary px-4 text-sm text-white">Medium</button>
            <button type="button" className="h-10 rounded-pill border border-border-ghost px-4 text-sm">High</button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
