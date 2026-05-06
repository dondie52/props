# PropManage BW — claude.md

> Property management SaaS for Botswana landlords.
> Stack: Next.js 14 App Router · Tailwind CSS · Supabase · Inter font
> Framework: WAT (Write · Apply · Test)

---

## WAT Framework

Every feature follows this cycle:

- **W — Write** the component or page using mock data first
- **A — Apply** DESIGN.md tokens (colors, radius, shadow, spacing)
- **T — Test** UI renders correctly before wiring Supabase

Never skip W→A before T. Never wire Supabase before UI is confirmed working.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                       ← Landing
│   ├── auth/login/page.tsx
│   ├── auth/register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                   ← Landlord dashboard
│   │   ├── properties/page.tsx
│   │   ├── properties/[id]/page.tsx
│   │   ├── tenants/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── maintenance/page.tsx
│   │   └── settings/page.tsx
│   └── tenant/dashboard/page.tsx      ← Tenant portal
├── components/
│   ├── layout/Sidebar.tsx
│   ├── layout/Topbar.tsx
│   ├── layout/TenantNavbar.tsx
│   └── ui/
│       ├── StatCard.tsx
│       ├── StatusChip.tsx
│       ├── Modal.tsx
│       └── Card.tsx
├── lib/supabase.ts
└── types/index.ts
```

---

## Design Tokens (DESIGN.md — source of truth)

```
bg-page:        #f4f6f8   ← page background always
bg-card:        #ffffff   ← all cards
primary:        #003857   ← nav, headings, primary buttons
primary-mid:    #1b4f72   ← icon bg, active states, chart bars
accent:         #fea520   ← CTA buttons, add actions ONLY
text-main:      #1a1c1e
text-sub:       #41474e
text-muted:     #72787f
border:         #e5e8e8   ← ghost borders everywhere
error:          #ba1a1a

shadow-card:    0px 4px 12px rgba(26,28,30,0.05)
shadow-modal:   0px 12px 24px rgba(26,28,30,0.10)

radius-base:    8px    ← cards, buttons, inputs
radius-large:   16px   ← modals, banners
radius-pill:    9999px ← status chips ONLY

input-height:   44px
font:           Inter
spacing-base:   8px scale (8/16/24/40/64)
```

---

## Dos

- Use `bg-[#f4f6f8]` on every page wrapper
- Use white cards with `shadow-card` and `border border-[#e5e8e8]`
- Use `#003857` for primary buttons, headings, sidebar logo
- Use `#fea520` ONLY for CTA/add action buttons
- Use `#1b4f72` for icon backgrounds, chart bars, active sidebar indicator
- Use pill radius `9999px` ONLY for status chips (Paid/Pending/Overdue etc.)
- Use `44px` height for all inputs and buttons
- Use uppercase 0.75rem letter-spacing-wide for all table headers and labels
- Use Inter font everywhere
- Use `1px solid #e5e8e8` ghost borders on inputs, table rows, cards
- Active sidebar item: left border `3px solid #fea520` + bg `#f4f6f8`
- Alternate table rows: white + `#f4f6f8`
- Build with mock data first, Supabase last

---

## Don'ts

- NO gradients anywhere — flat colors only
- NO dark backgrounds — this is a light UI
- NO rounded corners on status chips above `9999px` 
- NO border-radius above `16px` on any element
- NO colored shadows — shadow is always charcoal rgba only
- NO bold weight above `700`
- NO font size below `0.75rem`
- NO amber `#fea520` on primary nav or headings — accent only
- NO pure black `#000000` for text — use `#1a1c1e`
- NO inline styles — Tailwind classes only
- NO Supabase calls before mock UI is confirmed working
- NO `position: fixed` on modals — use flex overlay wrapper
- NO decorative icons — functional icons only via lucide-react

---

## Components Reference

### StatusChip
```tsx
// status prop maps to color:
paid | occupied | active | resolved  → green pill
pending | expiring | in-progress     → amber pill
overdue | open | high                → red pill
vacant | low                         → gray pill
medium                               → amber pill
```

### Buttons
```tsx
Primary:    bg #003857   text white   radius 8px   h-11
CTA:        bg #fea520   text white   radius 8px   h-11
Secondary:  bg white     border #003857  text #003857  radius 8px  h-11
```

### Cards
```tsx
bg white · border border-[#e5e8e8] · rounded-lg · shadow-card · p-6
```

### Modal
```tsx
Overlay:  fixed inset-0 bg-[rgba(26,28,30,0.5)] flex items-center justify-center
Card:     bg white · rounded-xl · shadow-modal · max-w-[520px] · w-[90%] · p-10
Close:    X icon top-right + ESC key + overlay click
```

### Tables
```tsx
Headers:  text-[#72787f] text-xs font-semibold uppercase tracking-wide
Rows:     border-b border-[#e5e8e8] · hover:bg-[#f4f6f8]
Stripe:   odd white · even bg-[#f4f6f8]
```

### Sidebar
```tsx
Width:    240px · bg white · border-r border-[#e5e8e8]
Active:   border-l-[3px] border-[#fea520] · bg-[#f4f6f8] · text-[#003857] font-medium
Inactive: text-[#41474e] · hover:bg-[#f4f6f8]
```

---

## Pages & Roles

| Route | Role | Layout |
|---|---|---|
| `/` | Public | None |
| `/auth/login` | Public | None |
| `/auth/register` | Public | None |
| `/dashboard/*` | Landlord | Sidebar + Topbar |
| `/tenant/dashboard` | Tenant | TenantNavbar only |

Middleware: protect `/dashboard/*` and `/tenant/*` — redirect to `/auth/login` if no session.

---

## Supabase Tables (wire after all UI done)

```sql
landlords        (id, full_name, email, created_at)
properties       (id, landlord_id, name, address, city, type)
units            (id, property_id, unit_number, rent_amount, status)
tenants          (id, unit_id, full_name, email, lease_start, lease_end)
payments         (id, tenant_id, amount, payment_date, due_date, status, method)
maintenance_requests (id, unit_id, category, description, urgency, status, created_at)
```

---

## Build Order

```
1. tailwind.config.js tokens
2. globals.css — Inter font, bg-page body
3. Sidebar · Topbar · TenantNavbar
4. StatCard · StatusChip · Modal · Card
5. Landing page
6. Login · Register
7. Dashboard
8. Properties list · Property detail
9. Tenants · Payments · Maintenance
10. Tenant portal · Settings
11. Supabase tables + data wiring
12. Auth middleware
13. Deploy Vercel
```
