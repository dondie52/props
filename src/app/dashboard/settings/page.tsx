"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, CreditCard, Loader2 } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

const ALL_TABS = ["Profile", "Security", "Billing", "Notifications"] as const;
type TabId = (typeof ALL_TABS)[number];

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("Profile");
  const [role, setRole] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const showBilling = role !== "tenant";

  const tabs = useMemo(() => ALL_TABS.filter((t) => (t === "Billing" ? showBilling : true)), [showBilling]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "billing" && showBilling) {
      setActiveTab("Billing");
    }
  }, [searchParams, showBilling]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab("Profile");
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id,full_name,email,role")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !profile) {
        setLoadError(error?.message ?? "Could not load your profile.");
        setIsLoading(false);
        return;
      }
      setProfileId(profile.id);
      setFullName(profile.full_name ?? "");
      setEmail(profile.email ?? user.email ?? "");
      setRole(typeof profile.role === "string" ? profile.role : null);
      setIsLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const shellVariant = role === "admin" ? "admin" : "landlord";

  const handleSaveProfile = async () => {
    setSaveMessage("");
    if (!profileId || !fullName.trim()) {
      setSaveMessage("Full name is required.");
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", profileId);
    setIsSaving(false);
    if (error) {
      setSaveMessage(error.message);
      return;
    }
    setSaveMessage("Saved.");
  };

  if (isLoading) {
    return (
      <DashboardShell title="Settings" variant={shellVariant}>
        <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading settings…
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Settings" variant={shellVariant}>
      {loadError ? (
        <p className="rounded-base border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">{loadError}</p>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="w-full shrink-0 p-4 lg:w-60">
          <div className="flex gap-1 overflow-x-auto pb-1 lg:block">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`mb-1 block whitespace-nowrap border-l-[3px] px-3 py-3 text-left text-sm lg:w-full ${activeTab === tab ? "border-accent bg-bg-page font-medium text-primary" : "border-transparent text-text-sub hover:bg-bg-page"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>
        <Card className="flex-1 p-5 sm:p-8">
          {activeTab === "Profile" ? (
            <div>
              <div className="group relative mb-6 h-20 w-20 overflow-hidden rounded-pill bg-primary-mid text-white">
                <div className="flex h-full items-center justify-center text-xl font-semibold">
                  {fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?"}
                </div>
                <div className="absolute inset-0 hidden items-center justify-center bg-black/30 group-hover:flex">
                  <Camera className="h-4 w-4" aria-hidden />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-text-muted">Full name</span>
                  <input
                    className="h-11 w-full rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-text-muted">Email</span>
                  <input
                    className="h-11 w-full rounded-base border border-border-ghost bg-bg-page px-3 text-text-muted"
                    value={email}
                    readOnly
                    title="Email is managed through your account provider."
                  />
                </label>
                <p className="md:col-span-2 text-xs text-text-muted">Phone and company fields can be added later.</p>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleSaveProfile()}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-base bg-primary px-5 text-white disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </button>
              {saveMessage ? (
                <p className={`mt-3 text-sm ${saveMessage === "Saved." ? "text-green-700" : "text-error"}`}>{saveMessage}</p>
              ) : null}
            </div>
          ) : null}
          {activeTab === "Security" ? (
            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-primary">Password</h2>
                <p className="text-sm text-text-sub">
                  Use the Supabase / hosted auth flow to reset your password from the login page (“Forgot password”), or
                  change it in your identity provider if your workspace uses SSO.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-text-main">Two-factor authentication</p>
                <span className="text-xs text-text-muted">Coming soon</span>
              </div>
            </div>
          ) : null}
          {activeTab === "Billing" && showBilling ? (
            <div>
              <div className="rounded-base bg-primary p-6 text-white">
                <p className="text-sm">Pro</p>
                <p className="text-2xl font-bold">P199/month</p>
                <p className="text-sm">Next billing: 01 Jun 2026</p>
              </div>
              <button type="button" className="mt-4 h-11 rounded-base bg-accent px-5 text-white">
                Upgrade plan
              </button>
              <div className="mt-6 flex flex-col gap-3 rounded-base border border-border-ghost p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary-mid" />
                  <p className="text-text-main">Visa ending in 4242</p>
                </div>
                <button type="button" className="text-sm text-primary-mid">
                  Update
                </button>
              </div>
              <p className="mt-4 text-xs text-text-muted">Payment integration is illustrative until connected to a billing provider.</p>
            </div>
          ) : null}
          {activeTab === "Notifications" ? <p className="text-text-sub">Notification preferences coming soon.</p> : null}
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <DashboardShell title="Settings">
          <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        </DashboardShell>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
