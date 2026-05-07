"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import logo from "../../../logo and brand guildeline/propmanage_bw_logo.png";
import { supabase } from "@/lib/supabase";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard/properties", icon: Building2 },
  { label: "Tenants", href: "/dashboard/tenants", icon: Users },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { label: "Messages", href: "/dashboard/messages", icon: Mail },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");
  const [displayEmail, setDisplayEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    const applyUser = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!mounted) return;
      if (!user) {
        setDisplayName("User");
        setDisplayEmail("");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const metadataName =
        typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
      const profileName = typeof profile?.full_name === "string" ? profile.full_name.trim() : "";
      const profileEmail = typeof profile?.email === "string" ? profile.email.trim() : "";

      setDisplayName(profileName || metadataName || user.email?.split("@")[0] || "User");
      setDisplayEmail(profileEmail || user.email || "");
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="w-[240px] bg-bg-card border-r border-border-ghost h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-border-ghost">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="PropManage BW logo" className="h-8 w-8 object-contain" />
          <p className="text-primary font-bold text-lg">PropManage BW</p>
        </div>
      </div>

      <nav className="py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`h-11 px-6 flex items-center gap-3 border-l-[3px] ${
                isActive
                  ? "border-accent bg-bg-page text-primary font-medium"
                  : "border-transparent text-text-sub hover:bg-bg-page"
              }`}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 py-4 border-t border-border-ghost">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-pill bg-primary-mid text-white flex items-center justify-center font-medium">
            {initials}
          </div>
          <div>
            <p className="text-text-main font-medium">{displayName}</p>
            <p className="text-text-muted text-sm">{displayEmail || "No email"}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="h-11 px-6 mb-4 mx-2 text-error flex items-center gap-3 hover:bg-bg-page rounded-base"
      >
        <LogOut className="size-4" />
        <span>Log out</span>
      </button>
    </aside>
  );
}
