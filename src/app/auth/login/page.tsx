"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, Shield } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { routeForRole } from "@/lib/role-routing";
import logo from "../../../../logo and brand guildeline/propmanage_bw_logo.png";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? signInData.user;
    const userEmail = user?.email?.toLowerCase();
    const userId = user?.id;
    if (userId) {
      let { data: profile } = await supabase.from("profiles").select("id,role").eq("auth_user_id", userId).maybeSingle();
      if (!profile && userEmail) {
        const { data: fallbackProfile } = await supabase
          .from("profiles")
          .select("id,role")
          .eq("email", userEmail)
          .is("auth_user_id", null)
          .maybeSingle();
        profile = fallbackProfile;
        if (fallbackProfile?.id) {
          await supabase.from("profiles").update({ auth_user_id: userId }).eq("id", fallbackProfile.id);
        }
      }
      router.replace(routeForRole(profile?.role));
      router.refresh();
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-page px-4 py-10">
      <div className="relative z-10 w-full max-w-[560px]">
        <div className="mb-8 text-center">
          <Image
            src={logo}
            alt="PropManage BW logo"
            width={80}
            height={80}
            priority
            className="mx-auto h-20 w-20 object-contain"
          />
          <h1 className="mt-3 text-[38px] font-bold text-primary">PropManage BW</h1>
          <p className="mt-2 text-sm text-text-sub">Operational clarity for property professionals.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-large border border-border-ghost bg-bg-card p-6 shadow-modal md:p-10">
          <h2 className="text-3xl font-bold leading-none text-black md:text-5xl">Login</h2>

          <label className="mb-2 mt-8 block text-sm font-semibold tracking-wide text-text-main">Email Address</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="manager@propmanage.bw"
            className={`mb-5 h-11 w-full rounded-base border bg-[#f7f7f9] px-3 text-sm focus:border-primary focus:outline-none ${
              error && !email ? "border-error" : "border-border-ghost"
            }`}
          />

          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-semibold tracking-wide text-text-main">Password</label>
            <button type="button" className="text-sm text-text-sub hover:text-primary">
              Forgot password?
            </button>
          </div>
          <div
            className={`mb-4 flex h-11 items-center rounded-base border bg-[#f7f7f9] px-3 ${
              error && !password ? "border-error" : "border-border-ghost"
            }`}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-text-muted">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="mb-4 inline-flex items-center gap-2 text-sm text-text-sub">
            <input type="checkbox" className="h-4 w-4 rounded border-border-ghost text-primary focus:ring-primary" />
            Remember me for 30 days
          </label>

          {error ? <p className="mb-3 text-sm text-error">{error}</p> : null}

          <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-base bg-primary text-sm font-semibold text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Login
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-text-muted">
            <span className="h-px flex-1 bg-border-ghost" />
            Institutional Login
            <span className="h-px flex-1 bg-border-ghost" />
          </div>

          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-base border border-border-ghost bg-white text-sm font-semibold text-text-main"
          >
            <Shield className="h-4 w-4" />
            Single Sign-On (SSO)
          </button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-2 md:items-center">
          <div className="rounded-base border border-border-ghost bg-white/70 p-4 shadow-card">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#8a6500]">
              <Shield className="h-4 w-4" />
              System Status
            </p>
            <p className="text-sm italic leading-6 text-text-sub">
              &quot;Our real-time ledger sync is now active across all Botswana regional nodes. Secure access verified.&quot;
            </p>
          </div>

          <p className="text-center text-sm text-text-sub md:text-right">
            {"Don't have an account? "}
            <Link href="/auth/register" className="font-semibold text-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
