"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Building2,
  FileDown,
  Home,
  ShieldCheck,
  X,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import logo from "../../../logo and brand guildeline/propmanage_bw_logo.png";
import { supabase } from "@/lib/supabase";

export type SidebarNavItem = { label: string; href: string; icon: ComponentType<{ className?: string }> };

export const landlordNavItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard/properties", icon: Building2 },
  { label: "Tenants", href: "/dashboard/tenants", icon: Users },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { label: "Reports", href: "/dashboard/reports", icon: FileDown },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const adminNavItems: SidebarNavItem[] = [
  { label: "Overview", href: "/admin", icon: Home },
  { label: "Landlords", href: "/admin/landlords", icon: Users },
  { label: "Properties", href: "/admin/properties", icon: Building2 },
  { label: "Settings", href: "/dashboard/settings", icon: ShieldCheck },
];

type SidebarProps = {
  navItems?: SidebarNavItem[];
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ navItems = landlordNavItems, isOpen = false, onClose }: SidebarProps) {
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
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[280px] flex-col border-r border-border-ghost bg-bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}
    >
      <div className="flex h-20 shrink-0 items-center px-8 border-b border-border-ghost/50">
        <div className="flex items-center justify-between w-full">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <Image src={logo} alt="PropManage BW logo" className="h-6 w-6 brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <p className="text-primary font-bold text-lg tracking-tight leading-none">PropManage</p>
              <p className="text-accent font-extrabold text-[10px] tracking-[0.2em] uppercase mt-1">Botswana</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-page hover:text-text-main lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 scrollbar-hide">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-text-sub hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? "text-white" : "text-text-muted group-hover:text-primary"
                }`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/40 shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-mid/10 to-primary/5 p-4 group">
            <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-mid to-primary text-white font-bold shadow-lg ring-2 ring-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-main leading-tight">{displayName}</p>
                <p className="truncate text-[11px] text-text-muted font-medium leading-tight mt-0.5">{displayEmail || "No email"}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-text-sub transition-all hover:bg-error/5 hover:text-error"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
