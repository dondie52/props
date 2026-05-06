import Link from "next/link";
import { ArrowLeft, CheckCircle2, Headset, TrendingUp } from "lucide-react";

const proFeatures = [
  "Manage up to 20 properties",
  "Full financial reporting and analytics",
  "Automated reminders and tenant insights",
  "Priority 24/7 support response times",
];

export default function ProPlanPage() {
  return (
    <main className="min-h-screen bg-bg-page px-6 py-14 text-text-main">
      <div className="mx-auto max-w-3xl">
        <Link href="/#pricing" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        <section className="rounded-xl border border-[#9a6a03] bg-white p-8 shadow-modal">
          <p className="inline-flex rounded-full bg-[#9a6a03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            Enterprise
          </p>
          <h1 className="mt-4 text-4xl font-bold text-primary">Pro Plan</h1>
          <p className="mt-3 text-sm leading-6 text-text-sub">
            Built for growing teams that need deeper financial visibility, faster support, and room to scale across
            larger portfolios.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[#f6f8fb] p-6">
              <p className="text-primary">
                <span className="text-6xl font-bold">P199</span>
                <span className="ml-1 text-base text-text-muted">/mo</span>
              </p>
              <p className="mt-2 text-sm text-text-muted">Monthly billing, cancel anytime.</p>
            </div>
            <div className="rounded-lg border border-border-ghost bg-white p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-text-main">
                <TrendingUp className="h-4 w-4 text-primary" />
                Ideal for 8-20 properties
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-text-main">
                <Headset className="h-4 w-4 text-primary" />
                Priority support queue
              </p>
            </div>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-text-sub">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/auth/register" className="rounded-md bg-[#9a6a03] px-5 py-2.5 text-sm font-medium text-white">
              Go Pro
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md border border-border-ghost bg-white px-5 py-2.5 text-sm font-medium text-text-main"
            >
              Talk to support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
