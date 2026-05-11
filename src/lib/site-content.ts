import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export type HomeFeatureItem = { icon_key: string; title: string; text: string };

export type HomePricingCardLink = {
  kind: "link";
  href: string;
  eyebrow: string;
  name: string;
  priceMajor: string;
  bullets: string[];
  ctaLabel: string;
};

export type HomePricingCardBasic = {
  kind: "basic";
  eyebrow: string;
  name: string;
  priceMajor: string;
  badge: string;
  bullets: string[];
  ctaLabel: string;
};

export type HomePricingCard = HomePricingCardLink | HomePricingCardBasic;

export type HomeFooterLink = { label: string; href: string; isNextLink?: boolean };

export type HomePayload = {
  headerBrand: string;
  navFeaturesLabel: string;
  navPricingLabel: string;
  navLoginPath: string;
  headerCtaPath: string;
  headerCtaLabel: string;
  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroCtaTrialPath: string;
  heroCtaTrialLabel: string;
  heroCtaDemoPath: string;
  heroCtaDemoLabel: string;
  heroImageAlt: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: HomeFeatureItem[];
  pricingSectionTitle: string;
  pricingSectionSubtitle: string;
  pricingCards: HomePricingCard[];
  footerCopyright: string;
  footerBrand: string;
  footerLinks: HomeFooterLink[];
};

export type PricingFreeTrialPayload = {
  backHref: string;
  backLabel: string;
  planEyebrow: string;
  planTitle: string;
  planSubtitle: string;
  priceMajor: string;
  priceNote: string;
  features: string[];
  primaryCtaPath: string;
  primaryCtaLabel: string;
  secondaryCtaPath: string;
  secondaryCtaLabel: string;
};

export type PricingProPayload = {
  backHref: string;
  backLabel: string;
  planBadge: string;
  planTitle: string;
  planSubtitle: string;
  priceMajor: string;
  priceNote: string;
  idealForLine: string;
  supportLine: string;
  features: string[];
  primaryCtaPath: string;
  primaryCtaLabel: string;
  secondaryCtaPath: string;
  secondaryCtaLabel: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function parseHomeFeatureItem(v: unknown): HomeFeatureItem | null {
  if (!isRecord(v)) return null;
  const { icon_key, title, text } = v;
  if (typeof icon_key !== "string" || typeof title !== "string" || typeof text !== "string") return null;
  return { icon_key, title, text };
}

function parseHomePricingCard(v: unknown): HomePricingCard | null {
  if (!isRecord(v)) return null;
  const kind = v.kind;
  if (kind === "link") {
    const { href, eyebrow, name, priceMajor, ctaLabel } = v;
    const bullets = v.bullets;
    if (
      typeof href !== "string" ||
      typeof eyebrow !== "string" ||
      typeof name !== "string" ||
      typeof priceMajor !== "string" ||
      typeof ctaLabel !== "string" ||
      !isStringArray(bullets)
    ) {
      return null;
    }
    return { kind: "link", href, eyebrow, name, priceMajor, bullets, ctaLabel };
  }
  if (kind === "basic") {
    const { eyebrow, name, priceMajor, badge, ctaLabel } = v;
    const bullets = v.bullets;
    if (
      typeof eyebrow !== "string" ||
      typeof name !== "string" ||
      typeof priceMajor !== "string" ||
      typeof badge !== "string" ||
      typeof ctaLabel !== "string" ||
      !isStringArray(bullets)
    ) {
      return null;
    }
    return { kind: "basic", eyebrow, name, priceMajor, badge, bullets, ctaLabel };
  }
  return null;
}

function parseFooterLink(v: unknown): HomeFooterLink | null {
  if (!isRecord(v)) return null;
  const { label, href } = v;
  if (typeof label !== "string" || typeof href !== "string") return null;
  const isNextLink = v.isNextLink === true;
  return { label, href, ...(isNextLink ? { isNextLink: true } : {}) };
}

export function parseHomePayload(raw: unknown): HomePayload | null {
  if (!isRecord(raw)) return null;
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : null);
  const featuresRaw = raw.features;
  const cardsRaw = raw.pricingCards;
  const linksRaw = raw.footerLinks;
  if (!Array.isArray(featuresRaw) || !Array.isArray(cardsRaw) || !Array.isArray(linksRaw)) return null;
  const features = featuresRaw.map(parseHomeFeatureItem).filter(Boolean) as HomeFeatureItem[];
  const pricingCards = cardsRaw.map(parseHomePricingCard).filter(Boolean) as HomePricingCard[];
  const footerLinks = linksRaw.map(parseFooterLink).filter(Boolean) as HomeFooterLink[];
  const keys = [
    "headerBrand",
    "navFeaturesLabel",
    "navPricingLabel",
    "navLoginPath",
    "headerCtaPath",
    "headerCtaLabel",
    "heroKicker",
    "heroTitleLine1",
    "heroTitleLine2",
    "heroSubtitle",
    "heroCtaTrialPath",
    "heroCtaTrialLabel",
    "heroCtaDemoPath",
    "heroCtaDemoLabel",
    "heroImageAlt",
    "featuresTitle",
    "featuresSubtitle",
    "pricingSectionTitle",
    "pricingSectionSubtitle",
    "footerCopyright",
    "footerBrand",
  ] as const;
  for (const k of keys) {
    if (!str(k)) return null;
  }
  if (features.length === 0 || pricingCards.length === 0 || footerLinks.length === 0) return null;
  return {
    headerBrand: str("headerBrand")!,
    navFeaturesLabel: str("navFeaturesLabel")!,
    navPricingLabel: str("navPricingLabel")!,
    navLoginPath: str("navLoginPath")!,
    headerCtaPath: str("headerCtaPath")!,
    headerCtaLabel: str("headerCtaLabel")!,
    heroKicker: str("heroKicker")!,
    heroTitleLine1: str("heroTitleLine1")!,
    heroTitleLine2: str("heroTitleLine2")!,
    heroSubtitle: str("heroSubtitle")!,
    heroCtaTrialPath: str("heroCtaTrialPath")!,
    heroCtaTrialLabel: str("heroCtaTrialLabel")!,
    heroCtaDemoPath: str("heroCtaDemoPath")!,
    heroCtaDemoLabel: str("heroCtaDemoLabel")!,
    heroImageAlt: str("heroImageAlt")!,
    featuresTitle: str("featuresTitle")!,
    featuresSubtitle: str("featuresSubtitle")!,
    features,
    pricingSectionTitle: str("pricingSectionTitle")!,
    pricingSectionSubtitle: str("pricingSectionSubtitle")!,
    pricingCards,
    footerCopyright: str("footerCopyright")!,
    footerBrand: str("footerBrand")!,
    footerLinks,
  };
}

export function parsePricingFreeTrialPayload(raw: unknown): PricingFreeTrialPayload | null {
  if (!isRecord(raw)) return null;
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : null);
  const features = raw.features;
  if (!isStringArray(features)) return null;
  const keys = [
    "backHref",
    "backLabel",
    "planEyebrow",
    "planTitle",
    "planSubtitle",
    "priceMajor",
    "priceNote",
    "primaryCtaPath",
    "primaryCtaLabel",
    "secondaryCtaPath",
    "secondaryCtaLabel",
  ] as const;
  for (const k of keys) {
    if (!str(k)) return null;
  }
  return {
    backHref: str("backHref")!,
    backLabel: str("backLabel")!,
    planEyebrow: str("planEyebrow")!,
    planTitle: str("planTitle")!,
    planSubtitle: str("planSubtitle")!,
    priceMajor: str("priceMajor")!,
    priceNote: str("priceNote")!,
    features,
    primaryCtaPath: str("primaryCtaPath")!,
    primaryCtaLabel: str("primaryCtaLabel")!,
    secondaryCtaPath: str("secondaryCtaPath")!,
    secondaryCtaLabel: str("secondaryCtaLabel")!,
  };
}

export function parsePricingProPayload(raw: unknown): PricingProPayload | null {
  if (!isRecord(raw)) return null;
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : null);
  const features = raw.features;
  if (!isStringArray(features)) return null;
  const keys = [
    "backHref",
    "backLabel",
    "planBadge",
    "planTitle",
    "planSubtitle",
    "priceMajor",
    "priceNote",
    "idealForLine",
    "supportLine",
    "primaryCtaPath",
    "primaryCtaLabel",
    "secondaryCtaPath",
    "secondaryCtaLabel",
  ] as const;
  for (const k of keys) {
    if (!str(k)) return null;
  }
  return {
    backHref: str("backHref")!,
    backLabel: str("backLabel")!,
    planBadge: str("planBadge")!,
    planTitle: str("planTitle")!,
    planSubtitle: str("planSubtitle")!,
    priceMajor: str("priceMajor")!,
    priceNote: str("priceNote")!,
    idealForLine: str("idealForLine")!,
    supportLine: str("supportLine")!,
    features,
    primaryCtaPath: str("primaryCtaPath")!,
    primaryCtaLabel: str("primaryCtaLabel")!,
    secondaryCtaPath: str("secondaryCtaPath")!,
    secondaryCtaLabel: str("secondaryCtaLabel")!,
  };
}

export async function fetchSiteContentPayload(slug: string): Promise<unknown | null> {
  const supabase = createSupabaseServerComponentClient();
  const { data, error } = await supabase.from("site_content").select("payload").eq("slug", slug).maybeSingle();
  if (error || !data?.payload) return null;
  return data.payload as unknown;
}
