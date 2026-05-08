"use client";

import { useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

export type Ticket = {
  id: string;
  title: string;
  property: string;
  unit: string;
  category: string;
  createdAt: string;
  urgency: "low" | "medium" | "high";
  status: "open" | "in-progress" | "resolved";
};

export default function MaintenanceClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [isOpen, setIsOpen] = useState(false);

  const move = async (id: string) => {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket) return;
    const nextStatus = ticket.status === "open" ? "in-progress" : "resolved";
    await supabase.from("maintenance_requests").update({ status: nextStatus }).eq("id", id);
    setTickets((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
  };

  const columns = ["open", "in-progress", "resolved"] as const;

  return (
    <DashboardShell title="Maintenance">
      <div className="mb-6 flex flex-col gap-3 rounded-base border border-border-ghost bg-bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <select className="h-11 rounded-base border border-border-ghost px-3 text-sm">
            <option>Property</option>
          </select>
          <select className="h-11 rounded-base border border-border-ghost px-3 text-sm">
            <option>Category</option>
          </select>
          <select className="h-11 rounded-base border border-border-ghost px-3 text-sm">
            <option>Urgency</option>
          </select>
          <select className="h-11 rounded-base border border-border-ghost px-3 text-sm">
            <option>Status</option>
          </select>
        </div>
        <button type="button" onClick={() => setIsOpen(true)} className="inline-flex h-11 items-center justify-center rounded-base bg-accent px-4 text-white">
          New Request
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <Card key={column} className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize text-primary">{column.replace("-", " ")}</h2>
              <span className="rounded-pill bg-bg-page px-2 py-1 text-xs text-text-muted">
                {tickets.filter((ticket) => ticket.status === column).length}
              </span>
            </div>
            <div className="space-y-3">
              {tickets
                .filter((ticket) => ticket.status === column)
                .map((ticket) => (
                  <div key={ticket.id} className="rounded-base border border-border-ghost bg-white p-4 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs text-text-muted">{ticket.category}</p>
                      <StatusChip status={ticket.urgency} />
                    </div>
                    <p className="font-medium text-text-main">{ticket.property}</p>
                    <p className="text-sm text-text-muted">Unit {ticket.unit}</p>
                    <p className="mt-1 text-sm text-text-sub">{ticket.title}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-text-muted">{ticket.createdAt}</p>
                      {column !== "resolved" ? (
                        <button type="button" onClick={() => move(ticket.id)} className="text-sm text-primary-mid">
                          Move Forward
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Request">
        <div className="space-y-3">
          <select className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Category</option>
          </select>
          <textarea className="w-full rounded-base border border-border-ghost px-3 py-2" rows={4} placeholder="Description" />
          <div className="flex gap-2">
            <button type="button" className="h-10 rounded-pill border border-border-ghost px-4 text-sm">
              Low
            </button>
            <button type="button" className="h-10 rounded-pill bg-primary px-4 text-sm text-white">
              Medium
            </button>
            <button type="button" className="h-10 rounded-pill border border-border-ghost px-4 text-sm">
              High
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
