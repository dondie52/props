import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let { data: profile } = await supabase.from("profiles").select("role").eq("auth_user_id", user.id).maybeSingle();

  if (!profile && user.email) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", user.email.toLowerCase())
      .is("auth_user_id", null)
      .maybeSingle();
    profile = fallback;
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
