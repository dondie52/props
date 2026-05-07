"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerActionClient } from "@/lib/supabase-server";

const CITIES = ["Gaborone", "Francistown", "Maun", "Kasane", "Lobatse", "Molepolole", "Jwaneng"] as const;
const PROPERTY_TYPES = ["Apartment", "Complex", "House"] as const;
const PROPERTY_PHOTOS_BUCKET = "property-photos";

function assertNonEmpty(value: string, field: string) {
  if (!value.trim()) throw new Error(`${field} is required.`);
}

async function getCurrentProfile(supabase: ReturnType<typeof createSupabaseServerActionClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!user?.id || !email) throw new Error("Sign in to continue.");

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!profile && !error) {
    const fallback = await supabase
      .from("profiles")
      .select("id,role")
      .eq("email", email)
      .is("auth_user_id", null)
      .maybeSingle();
    profile = fallback.data;
    error = fallback.error;
  }
  if (error) throw new Error(error.message);
  if (!profile?.id) throw new Error("No profile found for this account.");
  return profile;
}

async function getCurrentLandlordId(supabase: ReturnType<typeof createSupabaseServerActionClient>) {
  const profile = await getCurrentProfile(supabase);
  if (profile.role === "tenant") throw new Error("Tenant accounts cannot manage landlord onboarding.");
  if (profile.role === "admin") return null;

  const { data: landlord, error } = await supabase
    .from("landlords")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!landlord?.id) throw new Error("No landlord record found for this account.");
  return landlord.id;
}

async function assertCanManageProperty(supabase: ReturnType<typeof createSupabaseServerActionClient>, propertyId: string) {
  const landlordId = await getCurrentLandlordId(supabase);
  let query = supabase.from("properties").select("id").eq("id", propertyId);
  if (landlordId) query = query.eq("landlord_id", landlordId);

  const { data: property, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!property?.id) throw new Error("Property not found for this account.");
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

  const landlordId = await getCurrentLandlordId(supabase);
  if (!landlordId) throw new Error("Admins must create properties from a landlord-scoped account.");

  const { data, error } = await supabase
    .from("properties")
    .insert({ landlord_id: landlordId, name, address, city, type })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { propertyId: data.id };
}

export async function createPropertyWithHousesAction(input: {
  name: string;
  address: string;
  city: string;
  type: string;
  numberOfHouses: number;
  bedroomsPerHouse: number;
}) {
  const name = input.name.trim();
  const address = input.address.trim();
  const city = input.city.trim();
  const type = input.type.trim();
  const numberOfHouses = Number(input.numberOfHouses);
  const bedroomsPerHouse = Number(input.bedroomsPerHouse);

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
  if (!Number.isInteger(numberOfHouses) || numberOfHouses < 1 || numberOfHouses > 100) {
    throw new Error("Number of houses must be between 1 and 100.");
  }
  if (!Number.isInteger(bedroomsPerHouse) || bedroomsPerHouse < 1 || bedroomsPerHouse > 20) {
    throw new Error("Bedrooms per house must be between 1 and 20.");
  }

  const supabase = createSupabaseServerActionClient();
  const landlordId = await getCurrentLandlordId(supabase);
  if (!landlordId) throw new Error("Admins must create properties from a landlord-scoped account.");

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({ landlord_id: landlordId, name, address, city, type })
    .select("id")
    .single();
  if (propertyError) throw new Error(propertyError.message);

  const houseRows = Array.from({ length: numberOfHouses }, (_, idx) => ({
    property_id: property.id,
    house_number: `H${idx + 1}`,
    bedroom_count: bedroomsPerHouse,
  }));

  const { error: housesError } = await supabase.from("houses").insert(houseRows);
  if (housesError) {
    await supabase.from("properties").delete().eq("id", property.id);
    throw new Error(housesError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { propertyId: property.id, housesCreated: numberOfHouses };
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
  await assertCanManageProperty(supabase, input.propertyId);

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

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export async function uploadPropertyPhotosAction(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  assertNonEmpty(propertyId, "Property");

  const files = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) return { uploaded: 0 };
  if (files.length > 8) throw new Error("Please upload up to 8 photos at a time.");

  const supabase = createSupabaseServerActionClient();
  await assertCanManageProperty(supabase, propertyId);

  const { count: existingCount, error: countError } = await supabase
    .from("property_photos")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);
  if (countError) throw new Error(countError.message);

  const rows: { property_id: string; storage_path: string; is_primary: boolean }[] = [];
  let shouldSetPrimary = (existingCount ?? 0) === 0;

  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" is not an image file.`);
    if (file.size > 5 * 1024 * 1024) throw new Error(`"${file.name}" exceeds the 5MB limit.`);

    const path = `properties/${propertyId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (uploadError) throw new Error(uploadError.message);

    rows.push({
      property_id: propertyId,
      storage_path: path,
      is_primary: shouldSetPrimary,
    });
    shouldSetPrimary = false;
  }

  const { error: insertError } = await supabase.from("property_photos").insert(rows);
  if (insertError) throw new Error(insertError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { uploaded: rows.length };
}

export async function saveOnboardingStateAction(input: { state: Record<string, unknown> }) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) return { ok: true };

  let { error } = await supabase.from("profiles").update({ onboarding_state: input.state }).eq("auth_user_id", user.id);
  if (error) throw new Error(error.message);

  const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!profile?.id) {
    const fallback = await supabase
      .from("profiles")
      .update({ onboarding_state: input.state })
      .eq("email", user.email.toLowerCase())
      .is("auth_user_id", null);
    error = fallback.error;
  }

  if (error) throw new Error(error.message);
  return { ok: true };
}
