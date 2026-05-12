import { NextResponse } from "next/server";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { fetchTenantMaintenanceExportRows } from "@/lib/report-export-data";
import { buildMaintenanceXlsxBuffer } from "@/lib/report-xlsx";
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
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("unit_id").eq("email", email).maybeSingle();
  if (tenantError || !tenant?.unit_id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const unitId = String(tenant.unit_id);
  const rows = await fetchTenantMaintenanceExportRows(supabase, unitId);
  const generatedAt = new Date().toISOString();
  const buf = buildMaintenanceXlsxBuffer(rows, {
    generatedAt,
    scopeDescription: `Tenant unit ${unitId}`,
  });

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="propmanage-my-maintenance-${filenameDate()}.xlsx"`,
    },
  });
}
