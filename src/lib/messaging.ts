import { supabase } from "@/lib/supabase";

export type MessageThread = {
  id: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderProfileId: string;
};

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!user?.id || !email) return null;

  let { data, error } = await supabase.from("profiles").select("id,email,full_name,role").eq("auth_user_id", user.id).maybeSingle();
  if (!data && !error) {
    const fallback = await supabase
      .from("profiles")
      .select("id,email,full_name,role")
      .eq("email", email)
      .is("auth_user_id", null)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }
  if (error) throw error;
  if (!data?.id) return null;
  return data;
}

export async function getOrCreateConversation(args: {
  tenantEmail: string;
  tenantId?: string | null;
  propertyId?: string | null;
  unitId?: string | null;
}) {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) throw new Error("Sign in to start a conversation.");
  if (currentProfile.role !== "landlord" && currentProfile.role !== "admin") {
    throw new Error("Only landlords can start conversations from this page.");
  }

  const normalizedTenantEmail = args.tenantEmail.trim().toLowerCase();
  const { data: tenantProfile, error: tenantProfileError } = await supabase
    .from("profiles")
    .select("id,full_name")
    .eq("email", normalizedTenantEmail)
    .eq("role", "tenant")
    .maybeSingle();
  if (tenantProfileError) throw tenantProfileError;
  if (!tenantProfile?.id) throw new Error("Tenant profile not found.");

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("landlord_profile_id", currentProfile.id)
    .eq("tenant_profile_id", tenantProfile.id)
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.id) return { conversationId: existing.id, tenantName: tenantProfile.full_name };

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      landlord_profile_id: currentProfile.id,
      tenant_profile_id: tenantProfile.id,
      tenant_id: args.tenantId ?? null,
      property_id: args.propertyId ?? null,
      unit_id: args.unitId ?? null,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (createError) throw createError;
  return { conversationId: created.id, tenantName: tenantProfile.full_name };
}

export async function sendConversationMessage(conversationId: string, body: string) {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) throw new Error("Sign in to send a message.");
  const trimmedBody = body.trim();
  if (!trimmedBody) throw new Error("Message cannot be empty.");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_profile_id: currentProfile.id,
    body: trimmedBody,
  });
  if (error) throw error;

  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
}
