"use client";

import { useEffect, useRef, useState } from "react";
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
  const shellRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const navItems = variant === "admin" ? adminNavItems : landlordNavItems;

  useEffect(() => {
    const shellRect = shellRef.current?.getBoundingClientRect();
    const contentRect = contentRef.current?.getBoundingClientRect();
    const mainRect = mainRef.current?.getBoundingClientRect();
    // #region agent log
    fetch("http://127.0.0.1:7851/ingest/cfa3b922-9c8a-4c92-bfaf-18b672b0b00c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "927419" },
      body: JSON.stringify({
        sessionId: "927419",
        runId: "pre-fix",
        hypothesisId: "H2_H3_H4",
        location: "DashboardShell.tsx:layoutEffect",
        message: "Dashboard shell viewport and container metrics",
        data: {
          viewportHeight: window.innerHeight,
          shellHeight: shellRect?.height ?? null,
          contentHeight: contentRect?.height ?? null,
          mainTop: mainRect?.top ?? null,
          mainHeight: mainRect?.height ?? null,
          mainClientHeight: mainRef.current?.clientHeight ?? null,
          mainScrollHeight: mainRef.current?.scrollHeight ?? null,
          mainScrollTop: mainRef.current?.scrollTop ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <div ref={shellRef} className="h-dvh overflow-hidden bg-bg-page">
      <Sidebar navItems={navItems} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div ref={contentRef} className="h-dvh text-text-main lg:ml-60">
        <div className="fixed left-0 right-0 top-0 z-20 lg:left-60">
          <Topbar title={title} onOpenSidebar={() => setIsSidebarOpen(true)} />
        </div>
        <main ref={mainRef} className="h-[calc(100dvh-4rem)] overflow-y-auto bg-bg-page p-4 pt-6 text-text-main md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
