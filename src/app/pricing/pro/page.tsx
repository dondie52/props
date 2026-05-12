import Link from "next/link";
import { ArrowLeft, CheckCircle2, Headset, TrendingUp } from "lucide-react";
import { fetchSiteContentPayload, resolvePricingProPayload } from "@/lib/site-content";

export default async function ProPlanPage() {
  const raw = await fetchSiteContentPayload("pricing_pro");
  const data = resolvePricingProPayload(raw);

  return (
    <main className="min-h-screen bg-bg-page px-6 py-14 text-text-main">
      <div className="mx-auto max-w-3xl">
        <Link href={data.backHref} className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {data.backLabel}
        </Link>

        <section className="rounded-xl border border-[#9a6a03] bg-white p-8 shadow-modal">
          <p className="inline-flex rounded-full bg-[#9a6a03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            {data.planBadge}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-primary">{data.planTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-text-sub">{data.planSubtitle}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[#f6f8fb] p-6">
              <p className="text-primary">
                <span className="text-6xl font-bold">{data.priceMajor}</span>
                <span className="ml-1 text-base text-text-muted">/mo</span>
              </p>
              <p className="mt-2 text-sm text-text-muted">{data.priceNote}</p>
            </div>
            <div className="rounded-lg border border-border-ghost bg-white p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-text-main">
                <TrendingUp className="h-4 w-4 text-primary" />
                {data.idealForLine}
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-text-main">
                <Headset className="h-4 w-4 text-primary" />
                {data.supportLine}
              </p>
            </div>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-text-sub">
            {data.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={data.primaryCtaPath} className="rounded-md bg-[#9a6a03] px-5 py-2.5 text-sm font-medium text-white">
              {data.primaryCtaLabel}
            </Link>
            <Link
              href={data.secondaryCtaPath}
              className="rounded-md border border-border-ghost bg-white px-5 py-2.5 text-sm font-medium text-text-main"
            >
              {data.secondaryCtaLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
