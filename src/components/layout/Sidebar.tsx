"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Building2,
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

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) return;

      const metadataName =
        typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
      setDisplayName(metadataName || user.email?.split("@")[0] || "User");
      setDisplayEmail(user.email ?? "");
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const user = session?.user;
      if (!user) {
        setDisplayName("User");
        setDisplayEmail("");
        return;
      }

      const metadataName =
        typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
      setDisplayName(metadataName || user.email?.split("@")[0] || "User");
      setDisplayEmail(user.email ?? "");
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
      className={`fixed inset-y-0 left-0 z-40 h-screen w-[260px] border-r border-border-ghost bg-bg-card transition-transform lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-6 py-6 border-b border-border-ghost">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="PropManage BW logo" className="h-8 w-8 object-contain" />
            <p className="text-primary font-bold text-lg">PropManage BW</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted lg:hidden" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100%-145px)] flex-col">
        <nav className="py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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

        <div className="mt-auto border-t border-border-ghost px-6 py-4">
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
          className="mx-2 mb-4 h-11 rounded-base px-6 text-error flex items-center gap-3 hover:bg-bg-page"
        >
          <LogOut className="size-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
