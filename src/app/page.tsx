import Image from "next/image";
import Link from "next/link";
import { CirclePlay } from "lucide-react";
import logo from "../../logo and brand guildeline/propmanage_bw_logo.png";
import { getMarketingIcon } from "@/lib/marketing-icons";
import {
  fetchSiteContentPayload,
  resolveHomePayload,
  type HomePayload,
  type HomePricingCard,
} from "@/lib/site-content";

function PricingCardBlock({ card }: { card: HomePricingCard }) {
  if (card.kind === "link") {
    return (
      <Link href={card.href} className="group block">
        <article className="flex h-full flex-col rounded-lg border border-border-ghost bg-white p-7 text-center transition-shadow hover:shadow-card">
          <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">{card.eyebrow}</p>
          <h3 className="mt-2 text-4xl font-semibold text-primary">{card.name}</h3>
          <p className="mt-3 text-primary">
            <span className="text-6xl font-bold">{card.priceMajor}</span>
            <span className="ml-1 text-base text-text-muted">/mo</span>
          </p>
          <ul className="mt-5 grow space-y-2 text-sm text-text-sub">
            {card.bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <span className="mt-8 rounded-md border border-border-ghost py-2.5 text-sm font-medium transition-colors group-hover:bg-primary group-hover:text-white">
            {card.ctaLabel}
          </span>
        </article>
      </Link>
    );
  }
  return (
    <article className="relative flex flex-col rounded-lg border border-[#9a6a03] bg-white p-7 text-center shadow-modal">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#9a6a03] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        {card.badge}
      </span>
      <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">{card.eyebrow}</p>
      <h3 className="mt-2 text-4xl font-semibold text-primary">{card.name}</h3>
      <p className="mt-3 text-primary">
        <span className="text-6xl font-bold">{card.priceMajor}</span>
        <span className="ml-1 text-base text-text-muted">/mo</span>
      </p>
      <ul className="mt-5 grow space-y-2 text-sm text-text-sub">
        {card.bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <button type="button" className="mt-8 rounded-md bg-[#9a6a03] py-2.5 text-sm font-medium text-white">
        {card.ctaLabel}
      </button>
    </article>
  );
}

function HomeContent({ data, hasDemoVideo, demoVideoUrl }: { data: HomePayload; hasDemoVideo: boolean; demoVideoUrl: string }) {
  const demoButtonClass =
    "inline-flex h-10 items-center gap-2 rounded-md border border-border-ghost bg-white px-5 text-xs font-medium text-text-main";

  return (
    <main className="min-h-screen bg-bg-page text-text-main">
      <header className="border-b border-border-ghost bg-bg-card">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="PropManage BW logo" className="h-7 w-7 object-contain" />
            <p className="text-lg font-semibold text-primary">{data.headerBrand}</p>
          </div>
          <nav className="hidden items-center gap-8 text-xs text-text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-primary">
              {data.navFeaturesLabel}
            </a>
            <a href="#pricing" className="transition-colors hover:text-primary">
              {data.navPricingLabel}
            </a>
            <Link href={data.navLoginPath} className="transition-colors hover:text-primary">
              Login
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={data.headerCtaPath} className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-white">
              {data.headerCtaLabel}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{data.heroKicker}</p>
          <h1 className="text-3xl font-bold leading-tight text-primary md:text-5xl">
            {data.heroTitleLine1}
            <br />
            <span className="text-[#946100]">{data.heroTitleLine2}</span>
          </h1>
          <p className="max-w-lg text-sm leading-7 text-text-sub">{data.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={data.heroCtaTrialPath}
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-xs font-medium text-white"
            >
              {data.heroCtaTrialLabel}
            </Link>
            {hasDemoVideo ? (
              <a href={demoVideoUrl} target="_blank" rel="noopener noreferrer" className={demoButtonClass}>
                <CirclePlay className="h-4 w-4" />
                {data.heroCtaDemoLabel}
              </a>
            ) : (
              <Link href="#demo" className={demoButtonClass}>
                <CirclePlay className="h-4 w-4" />
                {data.heroCtaDemoLabel}
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border-ghost bg-bg-card p-3 shadow-card">
          <Image
            src="/illustrations/hero-city.png"
            alt={data.heroImageAlt}
            width={1200}
            height={800}
            className="h-full w-full rounded-md object-cover"
            priority
          />
        </div>
      </section>

      {!hasDemoVideo ? (
        <section id="demo" className="scroll-mt-24 border-b border-border-ghost bg-bg-card py-12">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-semibold text-primary">Product demo</h2>
            <p className="mt-2 text-sm leading-6 text-text-sub">
              A short guided video is on the way. Until then, you can explore PropManage BW with a free trial in your
              browser.
            </p>
            <Link
              href={data.heroCtaTrialPath}
              className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-5 text-xs font-medium text-white"
            >
              {data.heroCtaTrialLabel}
            </Link>
          </div>
        </section>
      ) : null}

      <section id="features" className="border-y border-border-ghost bg-[#f6f8fb] py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-[38px] font-bold text-primary">{data.featuresTitle}</h2>
            <p className="mt-2 text-sm text-text-muted">{data.featuresSubtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.features.map((feature, index) => {
              const isAccent = index % 2 === 1;
              const Icon = getMarketingIcon(feature.icon_key);
              return (
                <article key={feature.title} className="rounded-lg border border-border-ghost bg-white p-6 shadow-card">
                  <span
                    className={`mb-4 inline-flex h-8 w-8 items-center justify-center rounded-md ${
                      isAccent ? "bg-[#f2b233] text-[#5a3d00]" : "bg-primary text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-[30px] font-semibold leading-none text-primary">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-text-sub">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#eceef3] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-[38px] font-bold text-primary">{data.pricingSectionTitle}</h2>
            <p className="mt-2 text-sm text-text-muted">{data.pricingSectionSubtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {data.pricingCards.map((card, idx) => (
              <PricingCardBlock key={card.kind === "link" ? card.href : `basic-${idx}`} card={card} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border-ghost bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="PropManage BW logo" className="h-5 w-5 object-contain" />
            <span className="text-base font-semibold text-primary">{data.footerBrand}</span>
          </div>
          <p className="text-xs text-text-muted">{data.footerCopyright}</p>
          <nav className="flex flex-wrap gap-4 text-xs text-text-muted">
            {data.footerLinks.map((item) =>
              item.isNextLink ? (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </footer>
    </main>
  );
}

export default async function Home() {
  const demoVideoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim() ?? "";
  const hasDemoVideo = /^https?:\/\//i.test(demoVideoUrl);

  const raw = await fetchSiteContentPayload("home");
  const data = resolveHomePayload(raw);

  return <HomeContent data={data} hasDemoVideo={hasDemoVideo} demoVideoUrl={demoVideoUrl} />;
}
