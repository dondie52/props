"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerActionClient } from "@/lib/supabase-server";

const CITIES = ["Gaborone", "Francistown", "Maun", "Kasane", "Lobatse", "Molepolole", "Jwaneng"] as const;
const PROPERTY_TYPES = ["Apartment", "Complex", "House"] as const;

function assertNonEmpty(value: string, field: string) {
  if (!value.trim()) throw new Error(`${field} is required.`);
}

export async function createPropertyAction(input: {
  name: string;
  address: string;
  city: string;
  type: string;
}) {
  const name = input.name.trim();
  const address = input.address.trim();
  const city = input.city.trim();
  const type = input.type.trim();

  assertNonEmpty(name, "Property name");
  assertNonEmpty(address, "Address");
  assertNonEmpty(city, "City");
  assertNonEmpty(type, "Type");

  if (!CITIES.includes(city as (typeof CITIES)[number])) {
    throw new Error("Please choose a valid city.");
  }
  if (!PROPERTY_TYPES.includes(type as (typeof PROPERTY_TYPES)[number])) {
    throw new Error("Please choose a valid property type.");
  }

  const supabase = createSupabaseServerActionClient();

  const { data: landlord } = await supabase.from("landlords").select("id").limit(1).maybeSingle();
  if (!landlord?.id) throw new Error("No landlord record found for this account.");

  const { data, error } = await supabase
    .from("properties")
    .insert({ landlord_id: landlord.id, name, address, city, type })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { propertyId: data.id };
}

function generateUnitNumbers(pattern: "A" | "numeric", count: number) {
  if (count < 1 || count > 200) throw new Error("Units count must be between 1 and 200.");
  if (pattern === "numeric") return Array.from({ length: count }, (_, idx) => String(idx + 1));
  return Array.from({ length: count }, (_, idx) => `A${idx + 1}`);
}

export async function bulkCreateUnitsAction(input: {
  propertyId: string;
  mode: "generate" | "paste";
  count?: number;
  pattern?: "A" | "numeric";
  pasted?: string;
  defaultRent?: number;
}) {
  assertNonEmpty(input.propertyId, "Property");
  const supabase = createSupabaseServerActionClient();

  const unitNumbers =
    input.mode === "paste"
      ? (input.pasted ?? "")
          .split(/\r?\n|,/g)
          .map((v) => v.trim())
          .filter(Boolean)
          .slice(0, 200)
      : generateUnitNumbers(input.pattern ?? "A", Number(input.count ?? 0));

  if (unitNumbers.length === 0) throw new Error("Add at least one unit.");

  const rent = Math.max(0, Number(input.defaultRent ?? 0));
  const rows = unitNumbers.map((unitNumber) => ({
    property_id: input.propertyId,
    unit_number: unitNumber,
    rent_amount: rent || 0,
    status: "vacant",
  }));

  const { error } = await supabase.from("units").insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { created: unitNumbers.length };
}

export async function saveOnboardingStateAction(input: { state: Record<string, unknown> }) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { ok: true };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_state: input.state })
    .eq("email", user.email.toLowerCase());

  if (error) throw new Error(error.message);
  return { ok: true };
}

