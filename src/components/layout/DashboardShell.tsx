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
    <div className="h-dvh overflow-hidden bg-bg-page">
      <Sidebar navItems={navItems} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="h-dvh text-text-main lg:ml-[260px]">
        <div className="fixed left-0 right-0 top-0 z-20 lg:left-[260px]">
          <Topbar title={title} onOpenSidebar={() => setIsSidebarOpen(true)} />
        </div>
        <main className="mt-16 h-[calc(100dvh-4rem)] overflow-y-auto bg-bg-page p-4 text-text-main md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
