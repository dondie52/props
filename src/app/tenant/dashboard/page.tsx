"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Download, Loader2, MessageSquare, Send, ShieldCheck, UserPlus, Wrench } from "lucide-react";
import TenantNavbar from "@/components/layout/TenantNavbar";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

type PaymentStatus = "paid" | "pending" | "overdue";
type RequestStatus = "open" | "in-progress" | "resolved";
type Urgency = "low" | "medium" | "high";

type TenantContext = {
  tenantId: string;
  tenantProfileId: string;
  landlordProfileId: string;
  unitId: string;
};

type Payment = {
  id: string;
  dueDate: string;
  paidDate: string | null;
  amount: number;
  status: PaymentStatus;
  method: string;
};

type MaintenanceRequest = {
  id: string;
  category: string;
  description: string;
  status: RequestStatus;
  urgency: Urgency;
  createdAt: string;
};

type Message = {
  id: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

function normalizePaymentStatus(value: unknown): PaymentStatus {
  return value === "paid" || value === "pending" || value === "overdue" ? value : "pending";
}

function normalizeRequestStatus(value: unknown): RequestStatus {
  return value === "open" || value === "in-progress" || value === "resolved" ? value : "open";
}

function normalizeUrgency(value: unknown): Urgency {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-BW", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function daysBetween(start: string, end: string) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 0;
  return Math.ceil((endTime - startTime) / 86_400_000);
}

export default function Page() {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [tenantName, setTenantName] = useState("Tenant");
  const [unitName, setUnitName] = useState("-");
  const [propertyName, setPropertyName] = useState("-");
  const [landlordName, setLandlordName] = useState("Property manager");
  const [rentAmount, setRentAmount] = useState(0);
  const [leaseStart, setLeaseStart] = useState("-");
  const [leaseEnd, setLeaseEnd] = useState("-");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [context, setContext] = useState<TenantContext | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [requestCategory, setRequestCategory] = useState("Plumbing");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestUrgency, setRequestUrgency] = useState<Urgency>("medium");
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRequest, setIsSavingRequest] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [conversationBootstrapError, setConversationBootstrapError] = useState("");

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
      .format(value)
      .replace("BWP", "P")
      .trim();

  useEffect(() => {
    const loadTenantDashboard = async () => {
      setIsLoading(true);
      setError("");
      setConversationBootstrapError("");
      setConversationId(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email?.toLowerCase();
      if (!email) {
        setIsLoading(false);
        return;
      }
      setLoggedInEmail(email);

      const [{ data: tenant }, { data: profile }] = await Promise.all([
        supabase
          .from("tenants")
          .select("id,unit_id,full_name,lease_start,lease_end")
          .eq("email", email)
          .maybeSingle(),
        supabase.from("profiles").select("id,full_name").eq("email", email).maybeSingle(),
      ]);

      const tenantObj = tenant as unknown as {
        id?: string;
        unit_id?: string;
        full_name?: string;
        lease_start?: string;
        lease_end?: string;
      } | null;
      const tenantId = tenantObj?.id ?? "";
      const unitId = tenantObj?.unit_id ?? "";
      const tenantProfileId = (profile as { id?: string } | null)?.id ?? "";

      if (!tenantId || !unitId) {
        setContext(null);
        setTenantName(profile && "full_name" in profile ? String(profile.full_name ?? "Tenant") : "Tenant");
        setPayments([]);
        setRequests([]);
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const { data: unitData } = await supabase
        .from("units")
        .select("id,unit_number,rent_amount,properties(name,landlords(id,full_name,profile_id))")
        .eq("id", unitId)
        .maybeSingle();
      const unitObj = unitData as unknown as { id?: string; unit_number?: string; rent_amount?: number; properties?: unknown } | null;
      const property = unitObj?.properties && Array.isArray(unitObj.properties) ? unitObj.properties[0] : unitObj?.properties;
      const propertyObj = property as { name?: string; landlords?: unknown } | null;
      const landlord = propertyObj?.landlords && Array.isArray(propertyObj.landlords) ? propertyObj.landlords[0] : propertyObj?.landlords;
      const landlordObj = landlord as { id?: string; full_name?: string; profile_id?: string | null } | null;
      let landlordProfileId = String(landlordObj?.profile_id ?? "").trim();
      const landlordRowId = landlordObj?.id ?? "";

      if (!landlordProfileId && landlordRowId) {
        const { data: landlordRow } = await supabase.from("landlords").select("profile_id").eq("id", landlordRowId).maybeSingle();
        const lr = landlordRow as { profile_id?: string | null } | null;
        landlordProfileId = String(lr?.profile_id ?? "").trim();
      }

      setTenantName(tenantObj?.full_name ?? "Tenant");
      setLeaseStart(tenantObj?.lease_start ?? "-");
      setLeaseEnd(tenantObj?.lease_end ?? "-");
      setUnitName(unitObj?.unit_number ?? "-");
      setPropertyName(propertyObj?.name ?? "-");
      setLandlordName(landlordObj?.full_name ?? "Property manager");
      setRentAmount(Number(unitObj?.rent_amount ?? 0));
      setContext({ tenantId, tenantProfileId, landlordProfileId, unitId });

      const [{ data: paymentData }, { data: requestData }] = await Promise.all([
        supabase.from("payments").select("id,payment_date,due_date,amount,status,method").eq("tenant_id", tenantId).order("due_date", { ascending: false }),
        supabase.from("maintenance_requests").select("id,category,description,urgency,status,created_at").eq("unit_id", unitId).order("created_at", { ascending: false }),
      ]);

      setPayments(
        (paymentData ?? []).map((payment) => ({
          id: payment.id,
          dueDate: payment.due_date ?? "-",
          paidDate: payment.payment_date,
          amount: Number(payment.amount ?? 0),
          status: normalizePaymentStatus(payment.status),
          method: payment.method ?? "-",
        })),
      );
      setRequests(
        (requestData ?? []).map((request) => ({
          id: request.id,
          category: request.category ?? "General",
          description: request.description ?? "Maintenance issue",
          urgency: normalizeUrgency(request.urgency),
          status: normalizeRequestStatus(request.status),
          createdAt: request.created_at ?? "",
        })),
      );

      if (tenantProfileId && landlordProfileId) {
        const subject = `${propertyObj?.name ?? "Lease"} Unit ${unitObj?.unit_number ?? ""}`.trim();
        const { data: conversation, error: conversationUpsertError } = await supabase
          .from("conversations")
          .upsert(
            {
              tenant_id: tenantId,
              unit_id: unitId,
              tenant_profile_id: tenantProfileId,
              landlord_profile_id: landlordProfileId,
              subject,
            },
            { onConflict: "tenant_id,unit_id" },
          )
          .select("id")
          .single();

        if (conversationUpsertError) {
          setConversationBootstrapError(conversationUpsertError.message || "Could not start conversation.");
        }

        if (conversation?.id) {
          setConversationId(conversation.id);
          const { data: messageData } = await supabase
            .from("messages")
            .select("id,body,created_at,sender_profile_id")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true })
            .limit(20);

          setMessages(
            (messageData ?? []).map((message) => ({
              id: message.id,
              body: message.body,
              createdAt: message.created_at,
              isMine: message.sender_profile_id === tenantProfileId,
            })),
          );
        } else if (!conversationUpsertError) {
          setConversationBootstrapError("Conversation could not be created. Try again later.");
        }
      }

      setIsLoading(false);
    };

    void loadTenantDashboard();
  }, []);

  const nextPayment = useMemo(
    () => payments.find((payment) => payment.status === "overdue") ?? payments.find((payment) => payment.status === "pending"),
    [payments],
  );

  const paidTotal = payments.filter((payment) => payment.status === "paid").reduce((total, payment) => total + payment.amount, 0);
  const openRequests = requests.filter((request) => request.status !== "resolved").length;
  const leaseProgress = Math.min(100, Math.max(0, Math.round((daysBetween(leaseStart, new Date().toISOString()) / Math.max(daysBetween(leaseStart, leaseEnd), 1)) * 100)));
  const leaseDaysLeft = Math.max(0, daysBetween(new Date().toISOString(), leaseEnd));
  const hasLease = Boolean(context?.tenantId && context.unitId);
  const canSendMaintenance = hasLease;
  const canSendMessages = Boolean(context?.tenantId && context.unitId && context.tenantProfileId && context.landlordProfileId && conversationId);

  const handleCreateRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestError("");
    if (!canSendMaintenance || !context) {
      setRequestError("Your account needs to be linked to a lease before you can send a maintenance report.");
      return;
    }
    if (!requestDescription.trim()) return;
    setIsSavingRequest(true);

    const { data, error: insertError } = await supabase
      .from("maintenance_requests")
      .insert({
        unit_id: context.unitId,
        category: requestCategory,
        description: requestDescription.trim(),
        urgency: requestUrgency,
        status: "open",
      })
      .select("id,category,description,urgency,status,created_at")
      .single();

    setIsSavingRequest(false);
    if (insertError || !data) {
      setRequestError(insertError?.message ?? "Unable to create maintenance request.");
      return;
    }

    setRequests((prev) => [
      {
        id: data.id,
        category: data.category,
        description: data.description,
        urgency: normalizeUrgency(data.urgency),
        status: normalizeRequestStatus(data.status),
        createdAt: data.created_at,
      },
      ...prev,
    ]);
    setRequestDescription("");
    setRequestUrgency("medium");
    setIsRequestOpen(false);
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessageError("");
    if (!canSendMessages || !context?.tenantProfileId || !conversationId) {
      setMessageError("Messaging needs both tenant and landlord profiles connected. Maintenance reports are available now.");
      return;
    }
    if (!messageBody.trim()) return;
    setIsSendingMessage(true);

    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_profile_id: context.tenantProfileId,
        body: messageBody.trim(),
      })
      .select("id,body,created_at,sender_profile_id")
      .single();

    if (!insertError) {
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
    }

    setIsSendingMessage(false);
    if (insertError || !data) {
      setMessageError(insertError?.message ?? "Unable to send message.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: data.id, body: data.body, createdAt: data.created_at, isMine: data.sender_profile_id === context.tenantProfileId },
    ]);
    setMessageBody("");
  };

  return (
    <div className="min-h-screen scroll-smooth bg-bg-page">
      <TenantNavbar />
      <main className="mx-auto max-w-7xl space-y-5 p-4 pt-20 md:p-8">
        {error ? <div className="rounded-base border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">{error}</div> : null}

        {!isLoading && !hasLease ? (
          <Card className="rounded-base border-0">
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-base bg-amber-100 text-amber-700">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700">No lease linked yet</p>
                <h1 className="mt-2 text-2xl font-bold text-primary">Ask your landlord to assign this tenant email to a unit.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-sub">
                  You are signed in as <span className="font-semibold text-text-main">{loggedInEmail || "this account"}</span>. The tenant portal opens
                  after a landlord goes to Dashboard, Properties, chooses a property and vacant unit, then assigns that exact email as the tenant.
                  If your landlord already added you, ask them to check the email spelling.
                </p>
                <div className="mt-5 rounded-base border border-border-ghost bg-bg-page p-4 text-sm text-text-sub">
                  <p className="font-semibold text-text-main">Landlord path</p>
                  <p className="mt-1">Dashboard - Properties - choose property - Add Unit if needed - click vacant unit - Assign tenant.</p>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {hasLease ? <section id="lease" className="grid scroll-mt-24 gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <Card className="overflow-hidden rounded-base border-0 bg-primary p-0 text-white">
            <div className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:p-8">
              <div>
                <p className="text-sm text-white/70">Tenant portal</p>
                <h1 className="mt-2 text-3xl font-bold">Welcome back, {tenantName}</h1>
                <p className="mt-2 text-sm text-white/75">
                  {propertyName} · Unit {unitName} · Managed by {landlordName}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-base bg-white/10 p-3">
                    <p className="text-xs text-white/65">Monthly Rent</p>
                    <p className="text-xl font-semibold">{formatMoney(rentAmount)}</p>
                  </div>
                  <div className="rounded-base bg-white/10 p-3">
                    <p className="text-xs text-white/65">Requests Open</p>
                    <p className="text-xl font-semibold">{openRequests}</p>
                  </div>
                  <div className="rounded-base bg-white/10 p-3">
                    <p className="text-xs text-white/65">Paid This Year</p>
                    <p className="text-xl font-semibold">{formatMoney(paidTotal)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-base bg-accent p-5 text-center text-white md:min-w-[180px]">
                <CalendarDays className="mx-auto mb-2 h-6 w-6" />
                <p className="text-xs">Next Payment</p>
                <p className="text-3xl font-bold">{formatMoney(nextPayment?.amount ?? rentAmount)}</p>
                <p className="text-xs">{nextPayment ? `Due ${formatDate(nextPayment.dueDate)}` : "No pending payment"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">Lease Health</h2>
                <p className="mt-1 text-sm text-text-muted">{leaseDaysLeft} days remaining</p>
              </div>
              <StatusChip status={leaseDaysLeft <= 45 ? "expiring" : "active"} />
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-text-muted">Lease start</span>
                <span className="font-medium text-text-main">{formatDate(leaseStart)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-text-muted">Lease end</span>
                <span className="font-medium text-text-main">{formatDate(leaseEnd)}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-page">
                <div className="h-2 rounded-full bg-primary-mid" style={{ width: `${leaseProgress}%` }} />
              </div>
            </div>
          </Card>
        </section> : null}

        {hasLease ? <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <div id="payments" className="scroll-mt-24" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Payment History</h2>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-text-muted" /> : null}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="pb-3">Due</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border-ghost last:border-0 hover:bg-bg-page">
                      <td className="py-3">{formatDate(payment.dueDate)}</td>
                      <td>{formatMoney(payment.amount)}</td>
                      <td>
                        <StatusChip status={payment.status} />
                      </td>
                      <td className="capitalize text-text-muted">{payment.method}</td>
                      <td>
                        {payment.status === "paid" ? (
                          <Link
                            href={`/api/receipts/${payment.id}`}
                            download
                            aria-label="Download receipt"
                            className="inline-flex rounded-base p-2 text-primary-mid hover:bg-bg-page"
                          >
                            <Download className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="inline-flex p-2 text-text-muted" title="Receipt available when payment is paid">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!payments.length && !isLoading ? <p className="py-6 text-sm text-text-muted">No payments have been posted yet.</p> : null}
          </Card>

          <Card>
            <div id="maintenance" className="scroll-mt-24" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">Maintenance</h2>
                <p className="text-sm text-text-muted">Track requests and report issues from your unit.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRequestError("");
                  setIsRequestOpen(true);
                }}
                disabled={!canSendMaintenance}
                className="h-10 rounded-base bg-accent px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                New Request
              </button>
            </div>
            {!canSendMaintenance ? (
              <p className="mb-4 rounded-base border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Maintenance unlocks after this tenant account is linked to a lease.
              </p>
            ) : null}
            <div className="space-y-3">
              {requests.slice(0, 4).map((request) => (
                <article key={request.id} className="rounded-base border border-border-ghost bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-base bg-bg-page text-primary-mid">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{request.category}</p>
                        <p className="mt-1 text-sm text-text-sub">{request.description}</p>
                        <p className="mt-2 text-xs text-text-muted">{formatDate(request.createdAt)}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <StatusChip status={request.status} />
                      <StatusChip status={request.urgency} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!requests.length && !isLoading ? <p className="py-6 text-sm text-text-muted">No maintenance requests yet.</p> : null}
          </Card>
        </section> : null}

        {hasLease ? <section className="grid gap-5 lg:grid-cols-[0.65fr_1.35fr]">
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-base bg-green-100 text-green-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
                <p className="mt-1 text-sm text-text-muted">Keep lease support moving without a call.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setRequestError("");
                  setIsRequestOpen(true);
                }}
                disabled={!canSendMaintenance}
                className="flex h-11 items-center justify-center gap-2 rounded-base border border-border-ghost text-sm font-medium text-text-main hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wrench className="h-4 w-4" />
                Report maintenance
              </button>
              <a href="#messages" className="flex h-11 items-center justify-center gap-2 rounded-base border border-border-ghost text-sm font-medium text-text-main hover:bg-bg-page">
                <MessageSquare className="h-4 w-4" />
                Message manager
              </a>
            </div>
          </Card>

          <Card>
            <div id="messages" className="mb-4 flex scroll-mt-24 items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">Messages</h2>
                <p className="text-sm text-text-muted">Conversation with {landlordName}</p>
              </div>
              <MessageSquare className="h-5 w-5 text-primary-mid" />
            </div>
            <div className="max-h-[280px] space-y-3 overflow-y-auto rounded-base bg-bg-page p-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-base px-4 py-3 text-sm ${message.isMine ? "bg-primary text-white" : "bg-white text-text-main"}`}>
                    <p>{message.body}</p>
                    <p className={`mt-1 text-[11px] ${message.isMine ? "text-white/65" : "text-text-muted"}`}>{formatDate(message.createdAt)}</p>
                  </div>
                </div>
              ))}
              {!messages.length ? <p className="py-8 text-center text-sm text-text-muted">Start a conversation about your lease or unit.</p> : null}
            </div>
            <form onSubmit={(event) => void handleSendMessage(event)} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                className="h-11 flex-1 rounded-base border border-border-ghost px-3 text-sm outline-none focus:border-primary-mid"
                placeholder="Write a message"
              />
              <button type="submit" disabled={!canSendMessages || isSendingMessage || !messageBody.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-base bg-primary px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
                {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </button>
            </form>
            {!canSendMessages ? (
              <div className="mt-3 flex items-start gap-2 rounded-base border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-5 [text-wrap:pretty]">
                  {conversationBootstrapError
                    ? conversationBootstrapError
                    : !context?.tenantProfileId
                      ? "Your profile is not linked to this login yet. Complete registration or contact support."
                      : !context?.landlordProfileId
                        ? "Your property manager account is not fully linked yet. Ask them to finish signup so messaging works."
                        : !conversationId
                          ? "Messaging could not be started. Try refreshing the page."
                          : "Messaging will unlock after both tenant and landlord profiles are connected. You can still send maintenance reports."}
                </p>
              </div>
            ) : null}
            {messageError ? <p className="mt-3 rounded-base border border-red-200 bg-red-50 px-3 py-2 text-sm text-error">{messageError}</p> : null}
          </Card>
        </section> : null}
      </main>

      <Modal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} title="New Request">
        <form onSubmit={(event) => void handleCreateRequest(event)} className="space-y-3">
          <select value={requestCategory} onChange={(event) => setRequestCategory(event.target.value)} className="h-11 w-full rounded-base border border-border-ghost px-3">
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Appliance</option>
            <option>Security</option>
            <option>Cleaning</option>
            <option>General</option>
          </select>
          <textarea
            value={requestDescription}
            onChange={(event) => setRequestDescription(event.target.value)}
            className="w-full rounded-base border border-border-ghost px-3 py-2 outline-none focus:border-primary-mid"
            rows={4}
            placeholder="Describe the issue"
          />
          <div className="flex flex-wrap gap-2">
            {(["low", "medium", "high"] as const).map((urgency) => (
              <button
                key={urgency}
                type="button"
                onClick={() => setRequestUrgency(urgency)}
                className={`h-10 rounded-pill px-4 text-sm capitalize ${
                  requestUrgency === urgency ? "bg-primary text-white" : "border border-border-ghost text-text-sub"
                }`}
              >
                {urgency}
              </button>
            ))}
          </div>
          <button type="submit" disabled={isSavingRequest || !requestDescription.trim()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-base bg-accent px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isSavingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            Submit request
          </button>
          {requestError ? <p className="rounded-base border border-red-200 bg-red-50 px-3 py-2 text-sm text-error">{requestError}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
