import type { HomePayload, PricingFreeTrialPayload, PricingProPayload } from "@/lib/site-content";

/** Mirrors `supabase/migrations/20260511143000_site_content_and_reference_items.sql` — used when DB has no row or payload fails validation. */
export const defaultHomePayload: HomePayload = {
  headerBrand: "PropManage BW",
  navFeaturesLabel: "Features",
  navPricingLabel: "Pricing",
  navLoginPath: "/auth/login",
  headerCtaPath: "/auth/register",
  headerCtaLabel: "Get Started Free",
  heroKicker: "Property Management Elevated",
  heroTitleLine1: "Manage Your Properties",
  heroTitleLine2: "With Ease",
  heroSubtitle:
    "The all-in-one platform for Botswana landlords to simplify rent collection, tenant management, and property maintenance.",
  heroCtaTrialPath: "/auth/register",
  heroCtaTrialLabel: "Start Free Trial",
  heroCtaDemoPath: "/dashboard",
  heroCtaDemoLabel: "Watch Demo",
  heroImageAlt: "PropManage dashboard preview",
  featuresTitle: "Built for Operational Clarity",
  featuresSubtitle: "Streamline every aspect of your real estate portfolio.",
  features: [
    {
      icon_key: "Building2",
      title: "Property Portfolio",
      text: "Organize all property details, units, and building specifications in one central location.",
    },
    {
      icon_key: "Users",
      title: "Tenant Management",
      text: "Keep track of tenant contacts, screening history, and seamless communication channels.",
    },
    {
      icon_key: "CreditCard",
      title: "Rent Tracking",
      text: "Automated monitoring of incoming payments, late fee calculation, and arrears reporting.",
    },
    {
      icon_key: "Wrench",
      title: "Maintenance Requests",
      text: "A streamlined digital ticket system to manage repairs from reporting to resolution.",
    },
    {
      icon_key: "FileText",
      title: "Lease Management",
      text: "Secure digital storage for contracts with automated alerts for upcoming renewals.",
    },
    {
      icon_key: "Landmark",
      title: "Payment History",
      text: "Detailed financial reporting and historical logs for every unit in your portfolio.",
    },
  ],
  pricingSectionTitle: "Simple Pricing for Growing Portfolios",
  pricingSectionSubtitle: "Choose the plan that fits your management scale.",
  pricingCards: [
    {
      kind: "link",
      href: "/pricing/free-trial",
      eyebrow: "Get Started",
      name: "Free Trial",
      priceMajor: "P0",
      bullets: ["Manage up to 3 properties", "Basic tenant logs", "Standard email support"],
      ctaLabel: "Start for Free",
    },
    {
      kind: "basic",
      eyebrow: "Scalable",
      name: "Basic",
      priceMajor: "P99",
      badge: "Most Popular",
      bullets: ["Up to 10 properties", "Advanced rent tracking", "Automated reminders"],
      ctaLabel: "Get Basic",
    },
    {
      kind: "link",
      href: "/pricing/pro",
      eyebrow: "Enterprise",
      name: "Pro",
      priceMajor: "P199",
      bullets: ["Up to 20 properties", "Full financial reporting", "Priority 24/7 support"],
      ctaLabel: "Go Pro",
    },
  ],
  footerCopyright: "© 2024 PropManage BW. Built for operational clarity.",
  footerBrand: "PropManage BW",
  footerLinks: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Login", href: "/auth/login", isNextLink: true },
    { label: "Support", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export const defaultPricingFreeTrialPayload: PricingFreeTrialPayload = {
  backHref: "/#pricing",
  backLabel: "Back to pricing",
  planEyebrow: "Get Started",
  planTitle: "Free Trial",
  planSubtitle:
    "Start managing your properties immediately with no upfront cost. Perfect for landlords handling a small portfolio.",
  priceMajor: "P0",
  priceNote: "No credit card required.",
  features: [
    "Manage up to 3 active properties",
    "Track tenants and payment history",
    "Log maintenance issues in one place",
    "Standard email support included",
  ],
  primaryCtaPath: "/auth/register",
  primaryCtaLabel: "Create Free Account",
  secondaryCtaPath: "/auth/login",
  secondaryCtaLabel: "I already have an account",
};

export const defaultPricingProPayload: PricingProPayload = {
  backHref: "/#pricing",
  backLabel: "Back to pricing",
  planBadge: "Enterprise",
  planTitle: "Pro Plan",
  planSubtitle:
    "Built for growing teams that need deeper financial visibility, faster support, and room to scale across larger portfolios.",
  priceMajor: "P199",
  priceNote: "Monthly billing, cancel anytime.",
  idealForLine: "Ideal for 8-20 properties",
  supportLine: "Priority support queue",
  features: [
    "Manage up to 20 properties",
    "Full financial reporting and analytics",
    "Automated reminders and tenant insights",
    "Priority 24/7 support response times",
  ],
  primaryCtaPath: "/auth/register",
  primaryCtaLabel: "Go Pro",
  secondaryCtaPath: "/auth/login",
  secondaryCtaLabel: "Talk to support",
};
