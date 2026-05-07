import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CirclePlay,
  CreditCard,
  FileText,
  Landmark,
  Users,
  Wrench,
} from "lucide-react";
import logo from "../../logo and brand guildeline/propmanage_bw_logo.png";

const features = [
  {
    title: "Property Portfolio",
    text: "Organize all property details, units, and building specifications in one central location.",
    icon: Building2,
  },
  {
    title: "Tenant Management",
    text: "Keep track of tenant contacts, screening history, and seamless communication channels.",
    icon: Users,
  },
  {
    title: "Rent Tracking",
    text: "Automated monitoring of incoming payments, late fee calculation, and arrears reporting.",
    icon: CreditCard,
  },
  {
    title: "Maintenance Requests",
    text: "A streamlined digital ticket system to manage repairs from reporting to resolution.",
    icon: Wrench,
  },
  {
    title: "Lease Management",
    text: "Secure digital storage for contracts with automated alerts for upcoming renewals.",
    icon: FileText,
  },
  {
    title: "Payment History",
    text: "Detailed financial reporting and historical logs for every unit in your portfolio.",
    icon: Landmark,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-page text-text-main">
      <header className="border-b border-border-ghost bg-bg-card">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="PropManage BW logo" className="h-7 w-7 object-contain" />
            <p className="text-lg font-semibold text-primary">PropManage BW</p>
          </div>
          <nav className="hidden items-center gap-8 text-xs text-text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-primary">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-primary">
              Pricing
            </a>
            <Link href="/auth/login" className="transition-colors hover:text-primary">
              Login
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/register" className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-white">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
            Property Management Elevated
          </p>
          <h1 className="text-5xl font-bold leading-tight text-primary">
            Manage Your Properties
            <br />
            <span className="text-[#946100]">With Ease</span>
          </h1>
          <p className="max-w-lg text-sm leading-7 text-text-sub">
            The all-in-one platform for Botswana landlords to simplify rent collection, tenant management, and
            property maintenance.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-xs font-medium text-white"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border-ghost bg-white px-5 text-xs font-medium text-text-main"
            >
              <CirclePlay className="h-4 w-4" />
              Watch Demo
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border-ghost bg-bg-card p-3 shadow-card">
          <Image
            src="/illustrations/hero-city.png"
            alt="PropManage dashboard preview"
            width={1200}
            height={800}
            className="h-full w-full rounded-md object-cover"
            priority
          />
        </div>
      </section>

      <section id="features" className="border-y border-border-ghost bg-[#f6f8fb] py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-[38px] font-bold text-primary">Built for Operational Clarity</h2>
            <p className="mt-2 text-sm text-text-muted">
              Streamline every aspect of your real estate portfolio.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const isAccent = index % 2 === 1;
              return (
                <article key={feature.title} className="rounded-lg border border-border-ghost bg-white p-6 shadow-card">
                  <span
                    className={`mb-4 inline-flex h-8 w-8 items-center justify-center rounded-md ${
                      isAccent ? "bg-[#f2b233] text-[#5a3d00]" : "bg-primary text-white"
                    }`}
                  >
                    <feature.icon className="h-4 w-4" />
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
            <h2 className="text-[38px] font-bold text-primary">Simple Pricing for Growing Portfolios</h2>
            <p className="mt-2 text-sm text-text-muted">Choose the plan that fits your management scale.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/pricing/free-trial" className="group block">
              <article className="flex h-full flex-col rounded-lg border border-border-ghost bg-white p-7 text-center transition-shadow hover:shadow-card">
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Get Started</p>
                <h3 className="mt-2 text-4xl font-semibold text-primary">Free Trial</h3>
                <p className="mt-3 text-primary">
                  <span className="text-6xl font-bold">P0</span>
                  <span className="ml-1 text-base text-text-muted">/mo</span>
                </p>
                <ul className="mt-5 grow space-y-2 text-sm text-text-sub">
                  <li>Manage up to 3 properties</li>
                  <li>Basic tenant logs</li>
                  <li>Standard email support</li>
                </ul>
                <span className="mt-8 rounded-md border border-border-ghost py-2.5 text-sm font-medium transition-colors group-hover:bg-primary group-hover:text-white">
                  Start for Free
                </span>
              </article>
            </Link>

            <article className="relative flex flex-col rounded-lg border border-[#9a6a03] bg-white p-7 text-center shadow-modal">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#9a6a03] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Most Popular
              </span>
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Scalable</p>
              <h3 className="mt-2 text-4xl font-semibold text-primary">Basic</h3>
              <p className="mt-3 text-primary">
                <span className="text-6xl font-bold">P99</span>
                <span className="ml-1 text-base text-text-muted">/mo</span>
              </p>
              <ul className="mt-5 grow space-y-2 text-sm text-text-sub">
                <li>Up to 10 properties</li>
                <li>Advanced rent tracking</li>
                <li>Automated reminders</li>
              </ul>
              <button className="mt-8 rounded-md bg-[#9a6a03] py-2.5 text-sm font-medium text-white">
                Get Basic
              </button>
            </article>

            <Link href="/pricing/pro" className="group block">
              <article className="flex h-full flex-col rounded-lg border border-border-ghost bg-white p-7 text-center transition-shadow hover:shadow-card">
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Enterprise</p>
                <h3 className="mt-2 text-4xl font-semibold text-primary">Pro</h3>
                <p className="mt-3 text-primary">
                  <span className="text-6xl font-bold">P199</span>
                  <span className="ml-1 text-base text-text-muted">/mo</span>
                </p>
                <ul className="mt-5 grow space-y-2 text-sm text-text-sub">
                  <li>Up to 20 properties</li>
                  <li>Full financial reporting</li>
                  <li>Priority 24/7 support</li>
                </ul>
                <span className="mt-8 rounded-md border border-border-ghost py-2.5 text-sm font-medium transition-colors group-hover:bg-primary group-hover:text-white">
                  Go Pro
                </span>
              </article>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border-ghost bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="PropManage BW logo" className="h-5 w-5 object-contain" />
            <span className="text-base font-semibold text-primary">PropManage BW</span>
          </div>
          <p className="text-xs text-text-muted">© 2024 PropManage BW. Built for operational clarity.</p>
          <nav className="flex flex-wrap gap-4 text-xs text-text-muted">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/auth/login">Login</Link>
            <a href="#">Support</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
