"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar, { adminNavItems, landlordNavItems } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type DashboardShellProps = {
  title: string;
  children: ReactNode;
  variant?: "landlord" | "admin";
};

export default function DashboardShell({ title, children, variant = "landlord" }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = variant === "admin" ? adminNavItems : landlordNavItems;

  return (
    <div className="min-h-screen bg-bg-page">
      <Sidebar navItems={navItems} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="min-h-screen lg:ml-60">
        <div className="fixed left-0 right-0 top-0 z-20 lg:left-60">
          <Topbar title={title} onOpenSidebar={() => setIsSidebarOpen(true)} />
        </div>
        <main className="min-h-screen bg-bg-page p-4 pt-20 md:p-6 lg:p-8 lg:pt-24">{children}</main>
      </div>
    </div>
  );
}
