"use client";

import { Camera, CreditCard } from "lucide-react";
import { useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";

const tabs = ["Profile", "Security", "Billing", "Notifications"] as const;

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Profile");

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
                className={`mb-1 block whitespace-nowrap border-l-[3px] px-3 py-3 text-left text-sm lg:w-full ${activeTab === tab ? "border-accent bg-bg-page text-primary font-medium" : "border-transparent text-text-sub hover:bg-bg-page"}`}
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
                <div className="flex h-full items-center justify-center text-xl font-semibold">TS</div>
                <div className="absolute inset-0 hidden items-center justify-center bg-black/30 group-hover:flex">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none" placeholder="Full Name" />
                <input className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none" placeholder="Email" />
                <input className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none" placeholder="Phone" />
                <input className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none" placeholder="Company" />
                <select className="h-11 rounded-base border border-border-ghost px-3 focus:border-primary focus:outline-none">
                  <option>Botswana</option>
                </select>
              </div>
              <button type="button" className="mt-4 h-11 rounded-base bg-primary px-5 text-white">
                Save Changes
              </button>
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
          {activeTab === "Billing" ? (
            <div>
              <div className="rounded-base bg-primary p-6 text-white">
                <p className="text-sm">Pro</p>
                <p className="text-2xl font-bold">P199/month</p>
                <p className="text-sm">Next billing: 01 Jun 2026</p>
              </div>
              <button type="button" className="mt-4 h-11 rounded-base bg-accent px-5 text-white">
                Upgrade Plan
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
            </div>
          ) : null}
          {activeTab === "Notifications" ? <p className="text-text-sub">Notification preferences coming soon.</p> : null}
        </Card>
      </div>
    </DashboardShell>
  );
}
