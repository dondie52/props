import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getDashboardSession } from "@/lib/dashboard-auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerComponentClient();
  const { user, profile } = await getDashboardSession(supabase);

  if (!user) redirect("/auth/login");
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
