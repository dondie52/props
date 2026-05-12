import { NextResponse } from "next/server";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { fetchTenantOwnPaymentExportRows } from "@/lib/report-export-data";
import { buildPaymentsXlsxBuffer } from "@/lib/report-xlsx";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-route";

export const dynamic = "force-dynamic";

function filenameDate() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function GET() {
  const supabase = createSupabaseRouteHandlerClient();
  const { user, profile } = await getDashboardAuthScope(supabase);

  if (!user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!profile || profile.role !== "tenant") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const email = user.email.trim().toLowerCase();
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("id").eq("email", email).maybeSingle();
  if (tenantError || !tenant?.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const tenantId = String(tenant.id);
  const rows = await fetchTenantOwnPaymentExportRows(supabase, tenantId);
  const generatedAt = new Date().toISOString();
  const buf = buildPaymentsXlsxBuffer(rows, {
    generatedAt,
    scopeDescription: `Tenant ${tenantId}`,
  });

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="propmanage-my-payments-${filenameDate()}.xlsx"`,
    },
  });
}
