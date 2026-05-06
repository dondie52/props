"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import logo from "../../../../logo and brand guildeline/propmanage_bw_logo.png";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"landlord" | "tenant">("landlord");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    if (password.length < 4) return 1;
    if (password.length <= 8) return 2;
    return 3;
  }, [password]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    const roleLabel = role[0].toUpperCase() + role.slice(1);
    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: name, role: roleLabel } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      full_name: name.trim(),
      email: normalizedEmail,
      role,
    });
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push(role === "tenant" ? "/tenant/dashboard" : "/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-page px-4 py-10">
      <div className="pointer-events-none absolute left-[-140px] top-1/2 hidden -translate-y-1/2 opacity-15 lg:block">
        <Image src={logo} alt="" className="h-auto w-[560px] -scale-x-100" />
      </div>

      <div className="relative z-10 w-full max-w-[680px]">
        <div className="mb-8 text-center">
          <Image src={logo} alt="PropManage BW logo" className="mx-auto h-20 w-20 object-contain" />
          <h1 className="mt-3 text-4xl font-bold text-primary">PropManage BW</h1>
          <p className="mt-2 text-sm text-text-sub">Create your secure property management workspace.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-large border border-border-ghost bg-bg-card p-8 shadow-modal md:p-10">
          <h2 className="text-5xl font-bold leading-none text-black">Create Account</h2>
          <p className="mt-2 text-sm text-text-sub">Set up your PropManage BW profile.</p>

          <div className="mt-7 rounded-pill bg-[#eef2f6] p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {(["landlord", "tenant"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`h-10 rounded-pill text-sm font-medium transition ${
                    role === value ? "bg-primary text-white shadow-sm" : "text-primary hover:bg-white"
                  }`}
                >
                  {value === "landlord" ? "Landlord" : "Tenant"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-main">Full Name</label>
              <input
                className="h-11 w-full rounded-base border border-border-ghost bg-[#f7f7f9] px-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Kabelo Molefe"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-main">Email Address</label>
              <input
                className="h-11 w-full rounded-base border border-border-ghost bg-[#f7f7f9] px-3 text-sm focus:border-primary focus:outline-none"
                placeholder="manager@propmanage.bw"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-main">Password</label>
              <input
                className="h-11 w-full rounded-base border border-border-ghost bg-[#f7f7f9] px-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Create password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="mt-2 flex gap-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded ${
                      step <= strength
                        ? strength === 1
                          ? "bg-red-400"
                          : strength === 2
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                        : "bg-border-ghost"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-main">Confirm Password</label>
              <input
                className={`h-11 w-full rounded-base border bg-[#f7f7f9] px-3 text-sm focus:border-primary focus:outline-none ${
                  error === "Passwords do not match." ? "border-error" : "border-border-ghost"
                }`}
                placeholder="Re-enter password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-base bg-primary text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create Account
          </button>

          <p className="mt-5 text-center text-sm text-text-sub">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary">
              Login
            </Link>
          </p>
        </form>

        <div className="mt-6 rounded-base border border-border-ghost bg-white/75 p-4 shadow-card">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#8a6500]">
            <ShieldCheck className="h-4 w-4" />
            Security Notice
          </p>
          <p className="text-sm text-text-sub">
            Accounts are encrypted and monitored across Botswana regional nodes with role-based access controls.
          </p>
        </div>
      </div>
    </main>
  );
}
