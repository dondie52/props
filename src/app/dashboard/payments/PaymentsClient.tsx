"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { recordPaymentAction } from "@/app/dashboard/payments/actions";

export type PaymentRow = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  due: string;
  paid: string;
  method: string;
  status: "paid" | "pending" | "overdue";
};

export type PaymentTenantOption = {
  id: string;
  name: string;
  property: string;
  unit: string;
};

type OpenPaymentOption = {
  id: string;
  due_date: string;
  amount: number;
  status: string;
  method: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(value)
    .replace("BWP", "P")
    .trim();

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatMonthLabel(yyyymm: string) {
  const [y, mo] = yyyymm.split("-").map(Number);
  if (!y || !mo) return yyyymm;
  return new Intl.DateTimeFormat("en-BW", { month: "short", year: "numeric" }).format(new Date(y, mo - 1, 1));
}

function formatPaymentType(method: string) {
  if (method === "system") return "Auto rent";
  if (method === "bank_transfer") return "Bank transfer";
  if (method === "cash") return "Cash";
  const t = method.trim();
  return t ? t.replace(/_/g, " ") : "Manual";
}

/** Select value for "show every month" — never use "" (empty string) so we can tell it apart from "not picked yet". */
const LEDGER_ALL = "__all__";

export default function PaymentsClient({
  initialRows,
  tenantOptions,
  loadError = null,
}: {
  initialRows: PaymentRow[];
  tenantOptions: PaymentTenantOption[];
  loadError?: string | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [openPaymentRows, setOpenPaymentRows] = useState<OpenPaymentOption[]>([]);
  const [loadingOpenPayments, setLoadingOpenPayments] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayIsoDate);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<PaymentRow[]>(initialRows);
  const [ledgerMonth, setLedgerMonth] = useState<string | null>(null);
  const skipMonthDefault = useRef(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const r of rows) {
      if (r.due && r.due.length >= 7) months.add(r.due.slice(0, 7));
    }
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [rows]);

  useEffect(() => {
    if (skipMonthDefault.current) return;
    if (ledgerMonth !== null) return;
    if (monthOptions.length === 0) return;
    setLedgerMonth(monthOptions[0]);
  }, [ledgerMonth, monthOptions]);

  useEffect(() => {
    if (ledgerMonth === null || ledgerMonth === LEDGER_ALL) return;
    if (monthOptions.length > 0 && !monthOptions.includes(ledgerMonth)) {
      setLedgerMonth(monthOptions[0]);
    }
  }, [ledgerMonth, monthOptions]);

  const filteredRows = useMemo(() => {
    if (ledgerMonth === null || ledgerMonth === LEDGER_ALL) return rows;
    return rows.filter((r) => r.due && r.due.slice(0, 7) === ledgerMonth);
  }, [rows, ledgerMonth]);

  const selectedTenant = tenantOptions.find((tenant) => tenant.id === selectedTenantId) ?? null;

  const stats = useMemo(() => {
    const collected = filteredRows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0);
    const pending = filteredRows.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0);
    const overdue = filteredRows.filter((row) => row.status === "overdue").reduce((sum, row) => sum + row.amount, 0);
    const rate = filteredRows.length
      ? Math.round((filteredRows.filter((row) => row.status === "paid").length / filteredRows.length) * 100)
      : 0;
    return { collected, pending, overdue, rate };
  }, [filteredRows]);

  useEffect(() => {
    if (!selectedTenantId) {
      setOpenPaymentRows([]);
      setSelectedPaymentId("");
      setAmountStr("");
      return;
    }

    let cancelled = false;
    setLoadingOpenPayments(true);
    setFormError(null);

    void (async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id,due_date,amount,status,method")
        .eq("tenant_id", selectedTenantId)
        .order("due_date", { ascending: false });

      if (cancelled) return;
      setLoadingOpenPayments(false);

      if (error) {
        setFormError(error.message);
        setOpenPaymentRows([]);
        setSelectedPaymentId("");
        setAmountStr("");
        return;
      }

      const list = (data ?? []).filter((row) => {
        const st = String((row as { status?: string }).status ?? "")
          .trim()
          .toLowerCase();
        return st !== "paid";
      }) as OpenPaymentOption[];
      setOpenPaymentRows(list);
      if (list[0]) {
        setSelectedPaymentId(list[0].id);
        setAmountStr(String(list[0].amount));
      } else {
        setSelectedPaymentId("");
        setAmountStr("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTenantId]);

  const resetModal = () => {
    setFormError(null);
    setSubmitting(false);
    setSelectedTenantId("");
    setOpenPaymentRows([]);
    setSelectedPaymentId("");
    setAmountStr("");
    setPaymentDate(getTodayIsoDate());
    setPaymentMethod("bank_transfer");
  };

  const openModal = () => {
    resetModal();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetModal();
  };

  const handlePickOpenPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    const row = openPaymentRows.find((p) => p.id === paymentId);
    if (row) setAmountStr(String(row.amount));
  };

  const submitRecord = async () => {
    if (!selectedPaymentId) {
      setFormError(selectedTenantId ? "No unpaid rent to record for this tenant." : "Select a tenant first.");
      return;
    }
    const amountNum = Number(String(amountStr).replace(/,/g, ""));
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }
    if (!paymentDate) {
      setFormError("Choose the date you received this payment.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await recordPaymentAction({
        paymentId: selectedPaymentId,
        paymentDate,
        amount: amountNum,
        paymentMethod: paymentMethod,
      });
      const picked = openPaymentRows.find((p) => p.id === selectedPaymentId);
      const newMethod = picked?.method === "system" ? "system" : paymentMethod;
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedPaymentId
            ? { ...r, status: "paid", paid: paymentDate, method: newMethod, amount: amountNum }
            : r,
        ),
      );
      closeModal();
      router.refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Payments">
      {loadError ? (
        <div className="mb-4 rounded-base border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          Could not load payments: {loadError}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Collected" value={formatMoney(stats.collected)} icon={<span className="text-base">P</span>} />
        <StatCard title="Pending" value={formatMoney(stats.pending)} icon={<span className="text-base">P</span>} />
        <StatCard title="Overdue" value={formatMoney(stats.overdue)} icon={<span className="text-base">P</span>} />
        <StatCard title="Rate" value={`${stats.rate}%`} icon={<span className="text-base">%</span>} />
      </div>
      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-primary">Rent Ledger</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={ledgerMonth ?? LEDGER_ALL}
              onChange={(event) => {
                const v = event.target.value;
                if (v === LEDGER_ALL) {
                  skipMonthDefault.current = true;
                  setLedgerMonth(LEDGER_ALL);
                } else {
                  setLedgerMonth(v);
                }
              }}
              className="h-11 rounded-base border border-border-ghost px-3 text-sm sm:min-w-[160px]"
            >
              <option value={LEDGER_ALL}>All months</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-11 items-center justify-center rounded-base bg-accent px-4 text-white"
            >
              Record Payment
            </button>
          </div>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Property</th>
                <th className="pb-3">Unit</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Paid Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id || `${row.tenant}-${row.unit}-${row.due}`} className="border-t border-border-ghost hover:bg-bg-page">
                  <td className="py-3">{row.tenant}</td>
                  <td>{row.property}</td>
                  <td>{row.unit}</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.due}</td>
                  <td>{row.paid}</td>
                  <td>
                    <span className="rounded-pill bg-bg-page px-2 py-1 text-xs text-text-muted">
                      {formatPaymentType(row.method)}
                    </span>
                  </td>
                  <td>
                    <StatusChip status={row.status} />
                  </td>
                  <td>
                    <button type="button" aria-label="Download receipt" className="text-primary-mid">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {filteredRows.map((row) => (
            <article key={row.id || `${row.tenant}-${row.unit}-${row.due}`} className="rounded-base border border-border-ghost bg-bg-page p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-main">{row.tenant}</p>
                <StatusChip status={row.status} />
              </div>
              <p className="text-xs text-text-muted">
                {row.property} - Unit {row.unit}
              </p>
              <p className="mt-1 text-sm text-text-main">{formatMoney(row.amount)}</p>
              <p className="text-xs text-text-muted">
                Due {row.due} - {formatPaymentType(row.method)}
              </p>
            </article>
          ))}
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={closeModal} title="Record Payment">
        <div className="space-y-3">
          {formError ? <p className="text-sm text-error">{formError}</p> : null}

          <label className="block text-sm font-medium text-text-main">
            Tenant
            <select
              value={selectedTenantId}
              onChange={(event) => setSelectedTenantId(event.target.value)}
              className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3"
            >
              <option value="">Select tenant</option>
              {tenantOptions.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} — {tenant.property}, Unit {tenant.unit}
                </option>
              ))}
            </select>
          </label>

          {selectedTenant ? (
            <p className="text-xs text-text-muted">
              Recording for <span className="font-medium text-text-main">{selectedTenant.name}</span>
            </p>
          ) : null}

          <label className="block text-sm font-medium text-text-main">
            Unpaid rent
            {loadingOpenPayments ? (
              <div className="mt-1 flex h-11 items-center gap-2 rounded-base border border-border-ghost px-3 text-sm text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <select
                value={selectedPaymentId}
                onChange={(event) => handlePickOpenPayment(event.target.value)}
                disabled={!selectedTenantId || openPaymentRows.length === 0}
                className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3 disabled:cursor-not-allowed disabled:bg-bg-page"
              >
                {openPaymentRows.length === 0 ? (
                  <option value="">No pending or overdue rows</option>
                ) : (
                  openPaymentRows.map((p) => (
                    <option key={p.id} value={p.id}>
                      Due {p.due_date} · {formatMoney(p.amount)} ({p.status})
                    </option>
                  ))
                )}
              </select>
            )}
          </label>

          <label className="block text-sm font-medium text-text-main">
            Amount received (P)
            <div className="mt-1 flex h-11 items-center rounded-base border border-border-ghost px-3">
              <span className="text-text-muted">P</span>
              <input
                value={amountStr}
                onChange={(event) => setAmountStr(event.target.value)}
                className="ml-2 w-full bg-transparent outline-none"
                placeholder="Amount"
                inputMode="decimal"
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-text-main">
            Date received
            <input
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3"
            />
          </label>

          {openPaymentRows.find((p) => p.id === selectedPaymentId)?.method !== "system" ? (
            <label className="block text-sm font-medium text-text-main">
              How they paid
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3"
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
              </select>
            </label>
          ) : null}
          <p className="text-[11px] leading-relaxed text-text-muted">
            {openPaymentRows.find((p) => p.id === selectedPaymentId)?.method === "system"
              ? "This is an auto-generated rent line. We will mark it paid and store the amount and the date you received it."
              : "We will save how they paid on this rent line."}
          </p>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={closeModal} className="h-11 flex-1 rounded-base border border-primary text-primary">
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || !selectedPaymentId}
              onClick={() => void submitRecord()}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-base bg-primary text-white disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Record Payment
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
