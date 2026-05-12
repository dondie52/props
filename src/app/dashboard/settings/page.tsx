"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

const tabs = ["Profile", "Security", "Notifications"] as const;

const AVATAR_BUCKET = "profile-avatars";

function avatarObjectPath(userId: string) {
  return `avatars/${userId}/avatar`;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Profile");
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAvatarUrl = useCallback(async (path: string | null) => {
    if (!path) {
      setAvatarUrl(null);
      return;
    }
    const { data, error: signError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24);
    if (signError || !data?.signedUrl) {
      setAvatarUrl(null);
      return;
    }
    setAvatarUrl(data.signedUrl);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_path")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || !profile) {
        setError(profileError?.message ?? "Could not load your profile.");
        setLoading(false);
        return;
      }

      setProfileId(profile.id);
      setFullName(profile.full_name ?? "");
      setEmail(profile.email ?? "");
      setAvatarPath(profile.avatar_path ?? null);
      await refreshAvatarUrl(profile.avatar_path ?? null);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshAvatarUrl]);

  const handleAvatarPick = async (fileList: FileList | null) => {
    setMessage(null);
    setError(null);
    const file = fileList?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be signed in to upload a photo.");
      return;
    }
    if (!profileId) {
      setError("Profile not loaded yet. Try again in a moment.");
      return;
    }

    const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!okType) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    const path = avatarObjectPath(user.id);
    setUploading(true);
    const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { error: updateError } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", profileId);

    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setAvatarPath(path);
    await refreshAvatarUrl(path);
    setMessage("Profile photo updated.");
  };

  const handleRemoveAvatar = async () => {
    setMessage(null);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !profileId) return;

    const path = avatarObjectPath(user.id);
    setUploading(true);
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", profileId);
    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setAvatarPath(null);
    setAvatarUrl(null);
    setMessage("Profile photo removed.");
  };

  const handleSaveProfile = async () => {
    if (!profileId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || "User" })
      .eq("id", profileId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Profile saved.");
  };

  return (
    <DashboardShell title="Settings">
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
              {error ? <p className="mb-3 text-sm text-error">{error}</p> : null}
              {message ? <p className="mb-3 text-sm text-success">{message}</p> : null}

              {loading ? (
                <div className="flex items-center gap-2 text-text-muted">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading profile…</span>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex flex-wrap items-end gap-4">
                    <div className="relative">
                      <label
                        htmlFor="settings-avatar-input"
                        className="group relative mb-1 flex h-20 w-20 cursor-pointer overflow-hidden rounded-pill bg-primary-mid text-white shadow-sm ring-2 ring-transparent transition hover:ring-primary/30"
                      >
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                            {initialsFromName(fullName)}
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                          {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          ) : (
                            <Camera className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </label>
                      <input
                        id="settings-avatar-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploading || !profileId}
                        onChange={(e) => {
                          void handleAvatarPick(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <p className="max-w-[11rem] text-[11px] text-text-muted">Click photo to upload. JPG, PNG, or WebP · max 5MB</p>
                    </div>
                    {avatarPath ? (
                      <button
                        type="button"
                        onClick={() => void handleRemoveAvatar()}
                        disabled={uploading || !profileId}
                        className="mb-6 inline-flex h-9 items-center gap-1.5 rounded-base border border-border-ghost px-3 text-xs font-medium text-text-sub transition hover:border-error hover:text-error disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove photo
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-sm font-medium text-text-main">
                      Full name
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 h-11 w-full rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none"
                        placeholder="Full Name"
                        autoComplete="name"
                      />
                    </label>
                    <label className="block text-sm font-medium text-text-main">
                      Email
                      <input
                        value={email}
                        readOnly
                        className="mt-1 h-11 w-full cursor-not-allowed rounded-base border border-border-ghost bg-bg-page px-3 text-text-muted"
                        placeholder="Email"
                        title="Email is managed in your account security settings."
                      />
                    </label>
                    <input
                      className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none"
                      placeholder="Phone"
                    />
                    <input
                      className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none"
                      placeholder="Company"
                    />
                    <select className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none">
                      <option>Botswana</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSaveProfile()}
                    disabled={saving || !profileId}
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-base bg-primary px-5 text-white disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          ) : null}
          {activeTab === "Security" ? (
            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-primary">Change Password</h2>
                <div className="grid gap-3">
                  <input className="h-11 rounded-base border border-border-ghost px-3" placeholder="Current Password" />
                  <input className="h-11 rounded-base border border-border-ghost px-3" placeholder="New Password" />
                  <input className="h-11 rounded-base border border-border-ghost px-3" placeholder="Confirm Password" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-text-main">Two-factor authentication</p>
                <button type="button" className="relative h-6 w-11 rounded-pill bg-primary-mid">
                  <span className="absolute right-1 top-1 h-4 w-4 rounded-pill bg-white" />
                </button>
              </div>
            </div>
          ) : null}
          {activeTab === "Notifications" ? <p className="text-text-sub">Notification preferences coming soon.</p> : null}
        </Card>
      </div>
    </DashboardShell>
  );
}
