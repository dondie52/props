-- Public marketing copy and onboarding reference lists (seeded; read by anon + authenticated).

create table if not exists public.site_content (
  slug text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_reference_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('city', 'property_type')),
  value text not null,
  sort_order int not null,
  unique (category, value)
);

create index if not exists app_reference_items_category_sort_idx
  on public.app_reference_items (category, sort_order);

alter table public.site_content enable row level security;
alter table public.app_reference_items enable row level security;

drop policy if exists "site_content_select_public" on public.site_content;
create policy "site_content_select_public"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "app_reference_items_select_public" on public.app_reference_items;
create policy "app_reference_items_select_public"
  on public.app_reference_items for select
  to anon, authenticated
  using (true);

grant select on table public.site_content to anon, authenticated;
grant select on table public.app_reference_items to anon, authenticated;

insert into public.site_content (slug, payload)
values
  (
    'home',
    jsonb_build_object(
      'headerBrand', 'PropManage BW',
      'navFeaturesLabel', 'Features',
      'navPricingLabel', 'Pricing',
      'navLoginPath', '/auth/login',
      'headerCtaPath', '/auth/register',
      'headerCtaLabel', 'Get Started Free',
      'heroKicker', 'Property Management Elevated',
      'heroTitleLine1', 'Manage Your Properties',
      'heroTitleLine2', 'With Ease',
      'heroSubtitle', 'The all-in-one platform for Botswana landlords to simplify rent collection, tenant management, and property maintenance.',
      'heroCtaTrialPath', '/auth/register',
      'heroCtaTrialLabel', 'Start Free Trial',
      'heroCtaDemoPath', '/dashboard',
      'heroCtaDemoLabel', 'Watch Demo',
      'heroImageAlt', 'PropManage dashboard preview',
      'featuresTitle', 'Built for Operational Clarity',
      'featuresSubtitle', 'Streamline every aspect of your real estate portfolio.',
      'features',
      jsonb_build_array(
        jsonb_build_object('icon_key', 'Building2', 'title', 'Property Portfolio', 'text', 'Organize all property details, units, and building specifications in one central location.'),
        jsonb_build_object('icon_key', 'Users', 'title', 'Tenant Management', 'text', 'Keep track of tenant contacts, screening history, and seamless communication channels.'),
        jsonb_build_object('icon_key', 'CreditCard', 'title', 'Rent Tracking', 'text', 'Automated monitoring of incoming payments, late fee calculation, and arrears reporting.'),
        jsonb_build_object('icon_key', 'Wrench', 'title', 'Maintenance Requests', 'text', 'A streamlined digital ticket system to manage repairs from reporting to resolution.'),
        jsonb_build_object('icon_key', 'FileText', 'title', 'Lease Management', 'text', 'Secure digital storage for contracts with automated alerts for upcoming renewals.'),
        jsonb_build_object('icon_key', 'Landmark', 'title', 'Payment History', 'text', 'Detailed financial reporting and historical logs for every unit in your portfolio.')
      ),
      'pricingSectionTitle', 'Simple Pricing for Growing Portfolios',
      'pricingSectionSubtitle', 'Choose the plan that fits your management scale.',
      'pricingCards',
      jsonb_build_array(
        jsonb_build_object(
          'kind', 'link',
          'href', '/pricing/free-trial',
          'eyebrow', 'Get Started',
          'name', 'Free Trial',
          'priceMajor', 'P0',
          'bullets', jsonb_build_array('Manage up to 3 properties', 'Basic tenant logs', 'Standard email support'),
          'ctaLabel', 'Start for Free'
        ),
        jsonb_build_object(
          'kind', 'basic',
          'eyebrow', 'Scalable',
          'name', 'Basic',
          'priceMajor', 'P99',
          'badge', 'Most Popular',
          'bullets', jsonb_build_array('Up to 10 properties', 'Advanced rent tracking', 'Automated reminders'),
          'ctaLabel', 'Get Basic'
        ),
        jsonb_build_object(
          'kind', 'link',
          'href', '/pricing/pro',
          'eyebrow', 'Enterprise',
          'name', 'Pro',
          'priceMajor', 'P199',
          'bullets', jsonb_build_array('Up to 20 properties', 'Full financial reporting', 'Priority 24/7 support'),
          'ctaLabel', 'Go Pro'
        )
      ),
      'footerCopyright', '© 2024 PropManage BW. Built for operational clarity.',
      'footerBrand', 'PropManage BW',
      'footerLinks',
      jsonb_build_array(
        jsonb_build_object('label', 'Features', 'href', '#features'),
        jsonb_build_object('label', 'Pricing', 'href', '#pricing'),
        jsonb_build_object('label', 'Login', 'href', '/auth/login', 'isNextLink', true),
        jsonb_build_object('label', 'Support', 'href', '#'),
        jsonb_build_object('label', 'Privacy', 'href', '#'),
        jsonb_build_object('label', 'Terms', 'href', '#')
      )
    )
  ),
  (
    'pricing_free_trial',
    jsonb_build_object(
      'backHref', '/#pricing',
      'backLabel', 'Back to pricing',
      'planEyebrow', 'Get Started',
      'planTitle', 'Free Trial',
      'planSubtitle', 'Start managing your properties immediately with no upfront cost. Perfect for landlords handling a small portfolio.',
      'priceMajor', 'P0',
      'priceNote', 'No credit card required.',
      'features',
      jsonb_build_array(
        'Manage up to 3 active properties',
        'Track tenants and payment history',
        'Log maintenance issues in one place',
        'Standard email support included'
      ),
      'primaryCtaPath', '/auth/register',
      'primaryCtaLabel', 'Create Free Account',
      'secondaryCtaPath', '/auth/login',
      'secondaryCtaLabel', 'I already have an account'
    )
  ),
  (
    'pricing_pro',
    jsonb_build_object(
      'backHref', '/#pricing',
      'backLabel', 'Back to pricing',
      'planBadge', 'Enterprise',
      'planTitle', 'Pro Plan',
      'planSubtitle', 'Built for growing teams that need deeper financial visibility, faster support, and room to scale across larger portfolios.',
      'priceMajor', 'P199',
      'priceNote', 'Monthly billing, cancel anytime.',
      'idealForLine', 'Ideal for 8-20 properties',
      'supportLine', 'Priority support queue',
      'features',
      jsonb_build_array(
        'Manage up to 20 properties',
        'Full financial reporting and analytics',
        'Automated reminders and tenant insights',
        'Priority 24/7 support response times'
      ),
      'primaryCtaPath', '/auth/register',
      'primaryCtaLabel', 'Go Pro',
      'secondaryCtaPath', '/auth/login',
      'secondaryCtaLabel', 'Talk to support'
    )
  )
on conflict (slug) do nothing;

insert into public.app_reference_items (category, value, sort_order)
values
  ('city', 'Gaborone', 1),
  ('city', 'Francistown', 2),
  ('city', 'Maun', 3),
  ('city', 'Kasane', 4),
  ('city', 'Lobatse', 5),
  ('city', 'Molepolole', 6),
  ('city', 'Jwaneng', 7),
  ('property_type', 'Apartment', 1),
  ('property_type', 'Complex', 2),
  ('property_type', 'House', 3)
on conflict (category, value) do nothing;
