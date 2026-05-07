"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import logo from "../../../logo and brand guildeline/propmanage_bw_logo.png";
import { supabase } from "@/lib/supabase";

export default function TenantNavbar() {
  const router = useRouter();
  const [name, setName] = useState("Tenant");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) return;
      const { data: tenant } = await supabase.from("tenants").select("full_name").eq("email", user.email.toLowerCase()).maybeSingle();
      if (tenant?.full_name) setName(tenant.full_name);
    };
    void loadProfile();
  }, []);

  const initials = useMemo(() => {
    const parts = name.split(" ").filter(Boolean);
    if (!parts.length) return "T";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [name]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navLinks = (
    <>
      <Link className="hover:text-primary" href="/tenant/dashboard" onClick={() => setIsOpen(false)}>
        My Lease
      </Link>
      <Link className="hover:text-primary" href="/tenant/dashboard" onClick={() => setIsOpen(false)}>
        Payments
      </Link>
      <Link className="hover:text-primary" href="/tenant/dashboard" onClick={() => setIsOpen(false)}>
        Maintenance
      </Link>
    </>
  );

  return (
    <header className="border-b border-border-ghost bg-bg-card">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="PropManage BW logo" className="h-8 w-8 object-contain" />
          <span className="font-bold text-primary">PropManage BW</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-text-sub md:flex">
          {navLinks}
          <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-mid text-sm font-medium text-white">
            {initials}
          </div>
          <button type="button" aria-label="Log out" className="text-error hover:text-error/80" onClick={() => void handleLogout()}>
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
        <button type="button" className="text-text-muted md:hidden" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {isOpen ? (
        <div className="border-t border-border-ghost bg-bg-card px-4 py-4 md:hidden">
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>
          <div className="space-y-3 text-sm text-text-sub">{navLinks}</div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-mid text-sm font-medium text-white">
              {initials}
            </div>
            <button type="button" aria-label="Log out" className="text-error hover:text-error/80" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
