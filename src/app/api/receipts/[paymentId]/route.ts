import { NextResponse } from "next/server";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { buildReceiptHtml, type ReceiptPayload } from "@/lib/receipt-html";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-route";

export const dynamic = "force-dynamic";

const money = (n: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(n)
    .replace("BWP", "P")
    .trim();

function formatDateLabel(value: string | null | undefined) {
  if (!value || value === "-") return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-BW", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export async function GET(_request: Request, context: { params: { paymentId: string } }) {
  const { paymentId } = context.params;
  if (!paymentId || !/^[0-9a-f-]{36}$/i.test(paymentId)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: paymentRaw, error: payError } = await supabase
    .from("payments")
    .select(
      "id,amount,due_date,payment_date,method,status,tenant_id,tenants(full_name,units(unit_number,properties(name)))",
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (payError || !paymentRaw) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const p = paymentRaw as unknown as {
    id: string;
    amount: number | null;
    due_date: string | null;
    payment_date: string | null;
    method: string | null;
    status: string | null;
    tenant_id: string;
    tenants?: unknown;
  };

  if (p.status !== "paid") {
    return new NextResponse("Receipt available for paid payments only.", { status: 403 });
  }

  const tenant = Array.isArray(p.tenants) ? p.tenants[0] : p.tenants;
  const tenantObj = tenant as { full_name?: unknown; units?: unknown } | null;
  const unit = tenantObj?.units && Array.isArray(tenantObj.units) ? tenantObj.units[0] : tenantObj?.units;
  const unitObj = unit as { unit_number?: unknown; properties?: unknown } | null;
  const property = unitObj?.properties && Array.isArray(unitObj.properties) ? unitObj.properties[0] : unitObj?.properties;
  const propertyObj = property as { name?: unknown } | null;

  const tenantName = String(tenantObj?.full_name ?? "Tenant");
  const propertyName = String(propertyObj?.name ?? "-");
  const unitLabel = String(unitObj?.unit_number ?? "-");

  const { profile, scope } = await getDashboardAuthScope(supabase);
  const email = user.email.trim().toLowerCase();

  let authorized = false;
  if (profile?.role === "landlord" && scope.landlordId && scope.tenantIds.includes(p.tenant_id)) {
    authorized = true;
  }
  if (!authorized) {
    const { data: tenantRow } = await supabase.from("tenants").select("id").eq("email", email).maybeSingle();
    if (tenantRow && String((tenantRow as { id: string }).id) === p.tenant_id) {
      authorized = true;
    }
  }

  if (!authorized) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload: ReceiptPayload = {
    tenantName,
    propertyName,
    unitLabel,
    amountFormatted: money(Number(p.amount ?? 0)),
    dueDate: formatDateLabel(p.due_date),
    paidDate: formatDateLabel(p.payment_date),
    method: String(p.method ?? "-"),
    status: String(p.status ?? "paid"),
    receiptNo: p.id.slice(0, 8).toUpperCase(),
  };

  const html = buildReceiptHtml(payload);
  const safeName = `receipt-${payload.receiptNo}.html`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
