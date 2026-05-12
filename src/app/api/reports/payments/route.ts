import { NextResponse } from "next/server";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { fetchPaymentExportRows } from "@/lib/report-export-data";
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
  const { user, profile, scope } = await getDashboardAuthScope(supabase);

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!profile || profile.role !== "landlord" || !scope.landlordId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rows = await fetchPaymentExportRows(supabase, scope);
  const generatedAt = new Date().toISOString();
  const buf = buildPaymentsXlsxBuffer(rows, {
    generatedAt,
    landlordId: scope.landlordId,
  });

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="propmanage-payments-${filenameDate()}.xlsx"`,
    },
  });
}
