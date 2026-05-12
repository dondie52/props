"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerActionClient } from "@/lib/supabase-server";

function requireIsoDate(value: string, field: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(`${field} must be a valid date (YYYY-MM-DD).`);
  }
  return trimmed;
}

export async function recordPaymentAction(input: {
  paymentId: string;
  paymentDate: string;
  amount?: number;
  paymentMethod?: string;
}) {
  const paymentId = input.paymentId.trim();
  if (!paymentId) throw new Error("Choose which rent payment you are recording.");

  const paymentDate = requireIsoDate(input.paymentDate, "Payment date");
  const supabase = createSupabaseServerActionClient();

  const { data: row, error: fetchError } = await supabase
    .from("payments")
    .select("id,amount,status,method")
    .eq("id", paymentId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!row) throw new Error("Payment not found.");

  const status = String(row.status ?? "").trim().toLowerCase();
  if (status === "paid") throw new Error("This payment is already marked as paid.");

  const baseAmount = Number(row.amount ?? 0);
  const amount =
    input.amount != null && Number.isFinite(input.amount) && input.amount > 0 ? Number(input.amount) : baseAmount;

  const method = String(row.method ?? "");
  const updates: Record<string, unknown> = {
    status: "paid",
    payment_date: paymentDate,
    amount,
  };

  if (method !== "system" && input.paymentMethod?.trim()) {
    updates.method = input.paymentMethod.trim().toLowerCase().replace(/\s+/g, "_");
  }

  const { data: updated, error: updateError } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", paymentId)
    .select("id,status")
    .maybeSingle();

  if (updateError) throw new Error(updateError.message);
  if (!updated?.id) {
    throw new Error(
      "Could not save this payment (nothing was updated). Check that you manage this tenant and try again.",
    );
  }

  revalidatePath("/dashboard/payments", "page");
  return { ok: true as const };
}
