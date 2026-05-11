"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type TopbarProps = {
  title: string;
  onOpenSidebar?: () => void;
};

export default function Topbar({ title, onOpenSidebar }: TopbarProps) {
  const [displayName, setDisplayName] = useState("User");
  const [displayRole, setDisplayRole] = useState("Member");

  useEffect(() => {
    let mounted = true;

    const applyUser = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!mounted) return;
      if (!user) {
        setDisplayName("User");
        setDisplayRole("Member");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
      const profileName = typeof profile?.full_name === "string" ? profile.full_name.trim() : "";
      const role = typeof profile?.role === "string" ? profile.role : "member";

      setDisplayName(profileName || metadataName || user.email?.split("@")[0] || "User");
      setDisplayRole(role);
    };

    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await applyUser(session.user);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      await applyUser(user);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [displayName]);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border-ghost bg-bg-card/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-page text-text-muted transition-all hover:bg-primary/5 hover:text-primary lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-main tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
          <input
            aria-label="Search dashboard"
            type="search"
            placeholder="Search everything..."
            className="h-10 w-72 rounded-xl border border-border-muted bg-bg-page/50 pl-10 pr-4 text-sm transition-all focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 border-r border-border-ghost pr-2 md:pr-4">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-page hover:text-text-main md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-page hover:text-primary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-text-main leading-none">{displayName}</p>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold">{displayRole}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-mid to-primary text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white transition-transform hover:scale-105 cursor-pointer">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
