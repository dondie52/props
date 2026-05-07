"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import TenantNavbar from "@/components/layout/TenantNavbar";
import { ConversationMessage, MessageThread, getCurrentProfile, sendConversationMessage } from "@/lib/messaging";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [profileId, setProfileId] = useState<string>("");
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadThreads = async () => {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile?.id) return;
      setProfileId(currentProfile.id);

      const { data: conversationRows, error: conversationsError } = await supabase
        .from("conversations")
        .select("id,last_message_at,landlord_profile_id,property_id,unit_id")
        .eq("tenant_profile_id", currentProfile.id)
        .order("last_message_at", { ascending: false });
      if (conversationsError) {
        setError(conversationsError.message);
        return;
      }

      const landlordProfileIds = Array.from(new Set((conversationRows ?? []).map((row) => row.landlord_profile_id)));
      const propertyIds = Array.from(new Set((conversationRows ?? []).map((row) => row.property_id).filter(Boolean))) as string[];
      const unitIds = Array.from(new Set((conversationRows ?? []).map((row) => row.unit_id).filter(Boolean))) as string[];

      const [{ data: landlordProfiles }, { data: properties }, { data: units }] = await Promise.all([
        landlordProfileIds.length ? supabase.from("profiles").select("id,full_name").in("id", landlordProfileIds) : Promise.resolve({ data: [] }),
        propertyIds.length ? supabase.from("properties").select("id,name").in("id", propertyIds) : Promise.resolve({ data: [] }),
        unitIds.length ? supabase.from("units").select("id,unit_number").in("id", unitIds) : Promise.resolve({ data: [] }),
      ]);

      const landlordMap = new Map((landlordProfiles ?? []).map((row) => [row.id, row.full_name]));
      const propertyMap = new Map((properties ?? []).map((row) => [row.id, row.name]));
      const unitMap = new Map((units ?? []).map((row) => [row.id, row.unit_number]));

      const mappedThreads = (conversationRows ?? []).map((row) => ({
        id: row.id,
        tenantName: landlordMap.get(row.landlord_profile_id) ?? "Landlord",
        propertyName: row.property_id ? propertyMap.get(row.property_id) ?? "-" : "-",
        unitNumber: row.unit_id ? unitMap.get(row.unit_id) ?? "-" : "-",
        updatedAt: row.last_message_at,
      }));
      setThreads(mappedThreads);
      if (mappedThreads[0]?.id) setActiveThreadId(mappedThreads[0].id);
    };
    void loadThreads();
  }, []);

  useEffect(() => {
    if (!activeThreadId) return;
    const loadMessages = async () => {
      const { data, error: messagesError } = await supabase
        .from("messages")
        .select("id,body,created_at,sender_profile_id")
        .eq("conversation_id", activeThreadId)
        .order("created_at", { ascending: true });
      if (messagesError) {
        setError(messagesError.message);
        return;
      }
      setMessages(
        (data ?? []).map((row) => ({
          id: row.id,
          body: row.body,
          createdAt: row.created_at,
          senderProfileId: row.sender_profile_id,
        })),
      );
      if (profileId) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", activeThreadId)
          .neq("sender_profile_id", profileId)
          .is("read_at", null);
      }
    };
    void loadMessages();
  }, [activeThreadId, profileId]);

  const activeThread = useMemo(() => threads.find((thread) => thread.id === activeThreadId) ?? null, [threads, activeThreadId]);

  const onSend = async () => {
    if (!activeThreadId) return;
    try {
      setSending(true);
      setError("");
      await sendConversationMessage(activeThreadId, body);
      setBody("");
      const { data } = await supabase
        .from("messages")
        .select("id,body,created_at,sender_profile_id")
        .eq("conversation_id", activeThreadId)
        .order("created_at", { ascending: true });
      setMessages(
        (data ?? []).map((row) => ({
          id: row.id,
          body: row.body,
          createdAt: row.created_at,
          senderProfileId: row.sender_profile_id,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page">
      <TenantNavbar />
      <main className="mx-auto flex max-w-7xl gap-6 p-8 pt-20">
        <Card className="w-72 shrink-0 p-3">
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveThreadId(thread.id)}
              className={`mb-2 block w-full rounded-base border px-3 py-2 text-left ${
                activeThreadId === thread.id ? "border-primary bg-bg-page" : "border-border-ghost"
              }`}
            >
              <p className="text-sm font-semibold text-text-main">{thread.tenantName}</p>
              <p className="text-xs text-text-muted">
                {thread.propertyName} · Unit {thread.unitNumber}
              </p>
            </button>
          ))}
          {threads.length === 0 ? <p className="p-2 text-sm text-text-muted">No conversations yet.</p> : null}
        </Card>

        <Card className="flex-1 p-5">
          <div className="border-b border-border-ghost pb-3">
            <h2 className="text-lg font-semibold text-primary">{activeThread?.tenantName ?? "Messages"}</h2>
            <p className="text-xs text-text-muted">
              {activeThread ? `${activeThread.propertyName} · Unit ${activeThread.unitNumber}` : "Your landlord can start a chat from tenants."}
            </p>
          </div>
          <div className="mt-4 h-[420px] space-y-3 overflow-y-auto rounded-base bg-bg-page p-3">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[80%] rounded-base px-3 py-2 text-sm ${message.senderProfileId === profileId ? "ml-auto bg-primary text-white" : "bg-white text-text-main"}`}>
                <p>{message.body}</p>
                <p className={`mt-1 text-[11px] ${message.senderProfileId === profileId ? "text-white/80" : "text-text-muted"}`}>
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {messages.length === 0 ? <p className="text-sm text-text-muted">No messages yet.</p> : null}
          </div>
          <div className="mt-4 flex gap-2">
            <textarea
              rows={2}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a message..."
              className="flex-1 rounded-base border border-border-ghost px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              disabled={sending || !activeThreadId}
              onClick={() => void onSend()}
              className="h-11 rounded-base bg-accent px-4 text-sm font-semibold text-white disabled:opacity-70"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
        </Card>
      </main>
    </div>
  );
}
