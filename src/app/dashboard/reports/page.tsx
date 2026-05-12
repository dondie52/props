import { redirect } from "next/navigation";
import ReportsClient from "@/app/dashboard/reports/ReportsClient";
import { getDashboardAuthScope } from "@/lib/dashboard-auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = createSupabaseServerComponentClient();
  const { profile } = await getDashboardAuthScope(supabase);
  if (profile?.role === "admin") {
    redirect("/admin/reports");
  }
  return <ReportsClient />;
}
