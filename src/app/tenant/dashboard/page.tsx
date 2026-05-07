"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Wrench } from "lucide-react";
import TenantNavbar from "@/components/layout/TenantNavbar";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [tenantName, setTenantName] = useState("Tenant");
  const [unitName, setUnitName] = useState("-");
  const [propertyName, setPropertyName] = useState("-");
  const [rentAmount, setRentAmount] = useState(0);
  const [leaseStart, setLeaseStart] = useState("-");
  const [leaseEnd, setLeaseEnd] = useState("-");
  const [payments, setPayments] = useState<Array<{ id: string; date: string; amount: number; status: "paid" | "pending" | "overdue" }>>([]);
  const [requests, setRequests] = useState<Array<{ id: string; title: string; status: "open" | "in-progress" | "resolved" }>>([]);

  useEffect(() => {
    const loadTenantDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email?.toLowerCase();
      if (!email) return;

      const { data: tenant } = await supabase
        .from("tenants")
        .select("id,full_name,lease_start,lease_end,units(id,unit_number,rent_amount,properties(name))")
        .eq("email", email)
        .maybeSingle();

      const tenantObj = tenant as unknown as { id?: unknown; full_name?: unknown; lease_start?: unknown; lease_end?: unknown; units?: unknown };
      const unit = tenantObj?.units && Array.isArray(tenantObj.units) ? tenantObj.units[0] : tenantObj?.units;
      const property = unit?.properties && Array.isArray(unit.properties) ? unit.properties[0] : unit?.properties;
      const tenantId = tenantObj?.id ? String(tenantObj.id) : null;
      const unitId = unit?.id;

      if (tenantObj) {
        setTenantName((tenantObj.full_name as string | undefined) ?? "Tenant");
        setLeaseStart((tenantObj.lease_start as string | undefined) ?? "-");
        setLeaseEnd((tenantObj.lease_end as string | undefined) ?? "-");
      }
      setUnitName(unit?.unit_number ?? "-");
      setPropertyName(property?.name ?? "-");
      setRentAmount(Number(unit?.rent_amount ?? 0));

      if (tenantId) {
        const { data: paymentData } = await supabase
          .from("payments")
          .select("id,payment_date,due_date,amount,status")
          .eq("tenant_id", tenantId)
          .order("due_date", { ascending: false });

        const normalizedPayments = (paymentData ?? []).map((payment) => ({
          id: payment.id,
          date: payment.payment_date ?? payment.due_date ?? "-",
          amount: Number(payment.amount ?? 0),
          status: payment.status === "paid" || payment.status === "pending" || payment.status === "overdue" ? payment.status : "pending",
        }));
        setPayments(normalizedPayments);
      }

      if (unitId) {
        const { data: requestData } = await supabase
          .from("maintenance_requests")
          .select("id,category,description,status")
          .eq("unit_id", unitId)
          .order("created_at", { ascending: false });

        const normalizedRequests = (requestData ?? []).map((request) => ({
          id: request.id,
          title: request.description || request.category || "Maintenance issue",
          status:
            request.status === "open" || request.status === "in-progress" || request.status === "resolved"
              ? request.status
              : "open",
        }));
        setRequests(normalizedRequests);
      }
    };

    void loadTenantDashboard();
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
      .format(value)
      .replace("BWP", "P")
      .trim();

  const nextPayment = useMemo(
    () => payments.find((payment) => payment.status === "pending" || payment.status === "overdue"),
    [payments],
  );

  return (
    <div className="min-h-screen bg-bg-page">
      <TenantNavbar />
      <main className="mx-auto max-w-7xl space-y-6 p-4 pt-20 md:p-8">
        <Card className="rounded-large">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Welcome back, {tenantName}</h1>
              <p className="text-sm text-text-muted">Unit {unitName} · {propertyName}</p>
            </div>
            <div className="rounded-base bg-accent px-5 py-4 text-center text-white">
              <p className="text-xs">Next Payment</p>
              <p className="text-2xl font-bold">{formatMoney(nextPayment?.amount ?? rentAmount)}</p>
              <p className="text-xs">{nextPayment ? `Due ${nextPayment.date}` : "No pending payment"}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">My Lease</h2>
            <StatusChip status="active" />
          </div>
          <div className="grid grid-cols-1 gap-3 rounded-base bg-bg-page p-3 md:grid-cols-4">
            <div>
              <p className="text-xs text-text-muted">Lease Start</p>
              <p className="text-sm font-medium text-text-main">{leaseStart}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Lease End</p>
              <p className="text-sm font-medium text-text-main">{leaseEnd}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Monthly Rent</p>
              <p className="text-sm font-medium text-text-main">{formatMoney(rentAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Deposit</p>
              <p className="text-sm font-medium text-text-main">{formatMoney(rentAmount)}</p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-bg-page">
            <div className="h-2 w-[60%] rounded-full bg-primary-mid" />
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-primary">Payment History</h2>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border-ghost hover:bg-bg-page">
                    <td className="py-3">{payment.date}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>
                      <StatusChip status={payment.status} />
                    </td>
                    <td>
                      <Download className="h-4 w-4 text-primary-mid" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {payments.map((payment) => (
              <article key={payment.id} className="rounded-base border border-border-ghost bg-bg-page p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-text-main">{formatMoney(payment.amount)}</p>
                  <StatusChip status={payment.status} />
                </div>
                <p className="text-xs text-text-muted">{payment.date}</p>
              </article>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">My Requests</h2>
            <button type="button" onClick={() => setIsOpen(true)} className="h-9 rounded-base bg-accent px-3 text-sm text-white">
              New Request
            </button>
          </div>
          <div className="space-y-3 text-sm">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between border-b border-border-ghost pb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary-mid" />
                  <div>
                    <p className="text-text-main">{request.title}</p>
                    <p className="text-xs text-text-muted">{request.id}</p>
                  </div>
                </div>
                <StatusChip status={request.status} />
              </div>
            ))}
          </div>
        </Card>
      </main>
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
    </div>
  );
}
