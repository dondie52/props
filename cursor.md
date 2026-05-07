# PropManage BW — Cursor Build Guide

> Stack: Next.js 14 (App Router) · Tailwind CSS · Supabase · Inter font  
> Design: Minimalist Corporate — DESIGN.md tokens  
> Pages: 9 (Landing, Login, Register, Dashboard, Properties, Property Detail, Tenants, Payments, Maintenance, Tenant Portal, Settings)

---

## 1. Project Setup

Paste this into Cursor chat first before touching any page:

```
Create a new Next.js 14 project with App Router and Tailwind CSS called propmanage-bw.

Install these dependencies:
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- recharts
- lucide-react
- @fontsource/inter

Set up the following in tailwind.config.js:

colors:
  primary: '#003857'
  primary-container: '#1b4f72'
  accent: '#fea520'
  surface: '#f4f6f8'
  surface-card: '#ffffff'
  on-surface: '#1a1c1e'
  on-surface-variant: '#41474e'
  muted: '#72787f'
  border-ghost: '#e5e8e8'
  error: '#ba1a1a'

borderRadius:
  sm: '0.25rem'
  DEFAULT: '0.5rem'
  md: '0.75rem'
  lg: '1rem'
  xl: '1.5rem'
  full: '9999px'

fontFamily:
  sans: ['Inter', 'sans-serif']

boxShadow:
  card: '0px 4px 12px rgba(26,28,30,0.05)'
  modal: '0px 12px 24px rgba(26,28,30,0.10)'

Set Inter as the default font in globals.css.
Set body background to #f4f6f8.
```

---

## 2. Folder Structure

Tell Cursor to create this structure:

```
src/
├── app/
│   ├── page.tsx                  ← Landing page
│   ├── layout.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx              ← Landlord dashboard
│   │   ├── properties/
│   │   │   ├── page.tsx          ← Properties list
│   │   │   └── [id]/page.tsx     ← Property detail
│   │   ├── tenants/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── maintenance/page.tsx
│   │   └── settings/page.tsx
│   └── tenant/
│       └── dashboard/page.tsx    ← Tenant portal
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── TenantNavbar.tsx
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── StatusChip.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   └── charts/
│       └── OccupancyChart.tsx
├── lib/
│   └── supabase.ts
└── types/
    └── index.ts
```

---

## 3. Reusable Components — Build These First

### Prompt: Sidebar

```
Create a Sidebar.tsx component for PropManage BW landlord dashboard.

Specs:
- Width: 240px, white background, 1px right border #e5e8e8
- Fixed height full screen
- Top: "PropManage BW" logo text in #003857 font-bold, 24px padding
- Nav items array: 
  { icon, label, href } for:
  Dashboard (/dashboard)
  Properties (/dashboard/properties)
  Tenants (/dashboard/tenants)
  Payments (/dashboard/payments)
  Maintenance (/dashboard/maintenance)
  Settings (/dashboard/settings)
- Each nav item: flex row, icon left (lucide-react 18px), 
  label body-sm, padding 10px 16px, rounded-md
- Active state: bg-surface (#f4f6f8), 
  left border 3px solid #fea520, text #003857 font-medium
- Inactive: text #41474e, hover bg-surface
- Bottom: user avatar circle (initials), name, email in #41474e small
- Logout button at very bottom, text #ba1a1a

Use Next.js usePathname() to detect active route.
Use lucide-react icons.
Tailwind only.
```

---

### Prompt: StatCard

```
Create a StatCard.tsx reusable component.

Props: title (string), value (string), 
trend (string optional), trendUp (boolean optional), icon (ReactNode)

Specs:
- White background, 8px radius, 
  shadow: 0px 4px 12px rgba(26,28,30,0.05)
  1px border #e5e8e8, padding 24px
- Icon in top right: 40px circle, bg #f4f6f8, icon color #1b4f72
- Title: uppercase 0.75rem font-semibold #72787f letter-spacing 0.05em
- Value: 2rem font-bold #003857
- Trend: small text below — green with ↑ if trendUp, red with ↓ if not

Tailwind only.
```

---

### Prompt: StatusChip

```
Create a StatusChip.tsx reusable component.

Props: status ('paid' | 'pending' | 'overdue' | 
'occupied' | 'vacant' | 'active' | 'expiring' | 
'open' | 'in-progress' | 'resolved' | 'high' | 'medium' | 'low')

Each status maps to:
paid / occupied / active / resolved: 
  bg light green, text dark green, pill radius
pending / expiring / in-progress / medium: 
  bg light amber, text #865300, pill radius
overdue / high / open: 
  bg light red, text #ba1a1a, pill radius
vacant / low: 
  bg #f4f6f8, text #41474e, pill radius

Font: 0.75rem font-semibold, padding 4px 12px, border-radius 9999px
Tailwind only.
```

---

### Prompt: Modal

```
Create a Modal.tsx reusable component.

Props: isOpen (boolean), onClose (function), 
title (string), children (ReactNode)

Specs:
- Overlay: fixed inset-0, bg rgba(26,28,30,0.5), 
  flex items-center justify-center, z-50
- Modal card: white bg, 16px radius, 
  shadow 0px 12px 24px rgba(26,28,30,0.10)
  max-width 520px, width 90%, padding 40px
- Header: title H3 #1a1c1e left + X button right (lucide X icon)
- Close on overlay click and X button
- Close on ESC key press

Tailwind only.
```

---

## 4. Page Build Prompts — In Order

---

### Page 1: Landing Page (`app/page.tsx`)

```
Build the landing page for PropManage BW at app/page.tsx.

Import the Stitch-generated HTML from /page-flow/landinpage/code.html 
and convert it into a clean Next.js React component using Tailwind.

Apply these corrections to match DESIGN.md exactly:
- Font: Inter
- Background: #f4f6f8
- Cards: white, 8px radius, shadow 0px 4px 12px rgba(26,28,30,0.05), 
  1px border #e5e8e8
- Primary buttons: bg #003857 text white 8px radius
- CTA buttons: bg #fea520 text white 8px radius
- All section headings: #003857
- Body text: #41474e
- Replace any incorrect colors with DESIGN.md tokens

Make it fully responsive. Use Next.js Link for all navigation.
```

---

### Page 2: Login (`app/auth/login/page.tsx`)

```
Build the login page for PropManage BW.

Import Stitch HTML from /page-flow/login page/code.html 
and convert to Next.js + Tailwind.

Add these functional pieces:
- Form state with useState for email and password
- Form validation — show red border + error message 
  if fields empty on submit
- Password show/hide toggle using lucide Eye/EyeOff icons
- "Login" button shows loading spinner (lucide Loader2 animate-spin) 
  while submitting
- On successful login redirect to /dashboard using useRouter
- Keep all DESIGN.md tokens: 
  card shadow modal, 44px input height, 8px radius, 
  #003857 primary button, #e5e8e8 border

No Supabase wiring yet — just UI and state.
```

---

### Page 3: Register (`app/auth/register/page.tsx`)

```
Build the register page for PropManage BW.

Import Stitch HTML from /page-flow/login page/code.html 
(register screen) and convert to Next.js + Tailwind.

Add:
- useState for all fields: name, email, password, 
  confirmPassword, role
- Role toggle: two pill buttons "Landlord" / "Tenant"
  Selected: bg #003857 text white
  Unselected: white bg #003857 border
- Password strength bar below password field:
  Weak: 1/3 red, Medium: 2/3 amber, Strong: full green
- Confirm password mismatch error in red below field
- CTA button: bg #fea520 "Create Account"
- On submit redirect: 
  Landlord → /dashboard, Tenant → /tenant/dashboard

No Supabase yet — UI and state only.
```

---

### Page 4: Dashboard (`app/dashboard/page.tsx`)

```
Build the landlord dashboard page for PropManage BW.

Import Stitch HTML from /page-flow/dashboard/code.html 
and convert to Next.js + Tailwind.

Layout:
- Use Sidebar.tsx component on the left
- Use Topbar.tsx component at the top
- Main content area with left margin matching sidebar width

Wire up these components:
- 4x StatCard.tsx with mock data:
  Total Properties: "8"
  Occupied Units: "24/32"
  Rent Due: "P18,500"
  Open Maintenance: "3"

- Recent Payments table with 5 mock rows:
  columns: Tenant, Property, Unit, Amount, Date, Status
  Use StatusChip.tsx for Status column
  Table: borderless, 1px #e5e8e8 row dividers

- OccupancyChart.tsx — recharts BarChart:
  bars in #1b4f72, grid lines #e5e8e8, 
  white card container with shadow-card

- 3 maintenance summary rows with StatusChip urgency

All mock data — no Supabase yet.
Apply all DESIGN.md tokens exactly.
```

---

### Page 5: Properties (`app/dashboard/properties/page.tsx`)

```
Build the Properties list page for PropManage BW.

Import Stitch HTML from /page-flow/property detail/code.html 
and convert to Next.js + Tailwind.

Use Sidebar + Topbar layout.

Features:
- Search input (controlled useState) filters property cards by name
- "Add Property" button opens Modal.tsx
- 4 mock property cards in a responsive 3-column grid:
  Each card: property name, address, type chip, 
  unit stats, occupancy progress bar, 
  "View Details" + "Add Unit" buttons
  "View Details" links to /dashboard/properties/[id]
- Progress bar: filled div bg #1b4f72, track bg #e5e8e8, 
  width set by occupancy percentage
- Add Property modal form fields:
  Property Name, Address, City, Units (number input), 
  Type (select dropdown)
  Cancel + Save buttons

All DESIGN.md tokens. Mock data only.
```

---

### Page 6: Property Detail (`app/dashboard/properties/[id]/page.tsx`)

```
Build the Property Detail page for PropManage BW.

Import Stitch HTML from /page-flow/property detail/code.html 
and convert to Next.js + Tailwind.

Use Sidebar + Topbar layout.
Topbar shows breadcrumb: Properties > Sunset Apartments

Sections:
- Property header card: name H2, address, type chip,
  Edit + Add Unit buttons
- 4 mini stat boxes: Total Units, Occupied, Vacant, Revenue

- Units table (mock data 6 rows):
  Columns: Unit No, Tenant, Rent, Lease End, Status, Actions
  StatusChip for Status
  Actions: "View" text link + Edit icon button

- Clicking a unit row shows a slide-in right panel:
  Tenant name, initials avatar circle #1b4f72 bg,
  Lease dates, Rent amount, 
  last 3 payments mini list,
  "Full Profile" secondary button

All DESIGN.md tokens. Mock data only.
```

---

### Page 7: Tenants (`app/dashboard/tenants/page.tsx`)

```
Build the Tenants page for PropManage BW.

Import Stitch HTML from /page-flow/tntents/code.html 
and convert to Next.js + Tailwind.

Use Sidebar + Topbar layout.

Features:
- Search bar (filters table by tenant name)
- Filter dropdown by status (All/Active/Expiring/Overdue)
- "Add Tenant" amber CTA — opens Modal

Tenants table (8 mock rows):
Columns: Name (avatar + name), Property, Unit, 
Rent, Lease End, Status, Actions
- Avatar: 36px initials circle bg #1b4f72 white text
- StatusChip for Status
- Actions: View icon + Message icon (lucide)
- Alternating row bg: white + #f4f6f8
- Pagination: Prev/Next buttons + page count

All DESIGN.md tokens.
```

---

### Page 8: Payments (`app/dashboard/payments/page.tsx`)

```
Build the Payments page for PropManage BW.

Import Stitch HTML from /page-flow/payments/code.html 
and convert to Next.js + Tailwind.

Use Sidebar + Topbar layout.

Sections:
- 4 StatCards: Collected P18,500 / Pending P4,200 / 
  Overdue P1,800 / Collection Rate 87%

- Payments table (10 mock rows):
  Columns: Tenant, Property, Unit, Amount, 
  Due Date, Paid Date, Status, Receipt
  StatusChip for Status
  Receipt: lucide Download icon button color #1b4f72
  Row hover: bg #f4f6f8

- Month filter dropdown (top right of table card)
- "Record Payment" amber CTA opens Modal with fields:
  Tenant dropdown, Unit dropdown, 
  Amount (P prefix input), Date picker, 
  Method dropdown, Notes textarea
  Footer: Cancel + "Record Payment" #003857 primary

All DESIGN.md tokens.
```

---

### Page 9: Maintenance (`app/dashboard/maintenance/page.tsx`)

```
Build the Maintenance Tracker page for PropManage BW.

Import Stitch HTML from /page-flow/mataince page/code.html 
and convert to Next.js + Tailwind.

Use Sidebar + Topbar layout.

Features:
- Filter bar: Property, Category, Urgency, Status dropdowns
- "New Request" amber CTA opens Modal

Kanban board (3 columns):
Background: #f4f6f8
Columns: Open | In Progress | Resolved

Each column: 
- Header with bold title + count badge
- Column container: white card, 8px radius, 1px border

Each request card (white, 8px radius, 1px ghost border, 
shadow-card, 16px padding):
- Top: category chip left + urgency StatusChip right
- Property name bold + unit number
- Short description body-sm #41474e
- Bottom: date muted + "Move Forward →" link #1b4f72
  (clicking moves card to next column using useState)

Mock data: 8 cards spread across columns

"Move Forward" logic:
Open → In Progress → Resolved using useState array

All DESIGN.md tokens.
```

---

### Page 10: Tenant Portal (`app/tenant/dashboard/page.tsx`)

```
Build the Tenant Portal dashboard for PropManage BW.

Import Stitch HTML from /page-flow/tentants portal/code.html 
and convert to Next.js + Tailwind.

Layout: TenantNavbar.tsx top only (no sidebar)
Navbar: logo left, links: My Lease, Payments, 
Maintenance, Logout right, avatar

Sections:
- Welcome banner (white card, 16px radius, shadow-card):
  Left: H2 "Welcome back, Tebogo Modise" #003857,
  unit + property subtitle #41474e
  Right: amber box bg #fea520 8px radius:
  "Next Payment" label white, "P2,400" large white bold,
  "Due in 8 days" small white

- Lease card (white, 8px radius, shadow-card):
  4 info boxes: Lease Start, Lease End, Rent, Deposit
  Lease progress bar: filled #1b4f72

- Payment History table (5 mock rows):
  Date, Amount, StatusChip, Download icon

- Maintenance Requests list (3 mock items):
  Icon + title + date + StatusChip
  "New Request" amber CTA opens Modal:
  Category dropdown, Description textarea, 
  Urgency pills Low/Medium/High

All DESIGN.md tokens.
```

---

### Page 11: Settings (`app/dashboard/settings/page.tsx`)

```
Build the Settings page for PropManage BW.

Use Sidebar + Topbar layout.

Two column layout:
- Left (white card, 240px): settings nav list
  Items: Profile, Security, Notifications, Billing
  Active: left border 3px #fea520, bg #f4f6f8, text #003857
  Inactive: text #41474e

- Right (white card, flex-1): active panel content
  Controlled by useState activeTab

Profile panel:
- Avatar circle 80px, initials + camera icon overlay on hover
- Fields: Full Name, Email, Phone, Company, Country
- "Save Changes" primary #003857 button

Security panel:
- Change Password: 3 inputs (current, new, confirm)
- 2FA toggle: custom toggle switch, on = #1b4f72

Billing panel:
- Current plan card: #003857 bg white text
  plan name, price, next billing date
- "Upgrade" amber CTA
- Payment method row: card icon + last 4 + "Update" link

Click left nav items to switch panels using useState.
All DESIGN.md tokens.
```

---

## 5. Supabase Integration (After All Pages Done)

```
Now connect PropManage BW to Supabase.

Create lib/supabase.ts:
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

Create these tables in Supabase SQL editor:

landlords:
  id uuid primary key default gen_random_uuid()
  full_name text, email text unique, 
  created_at timestamptz default now()

properties:
  id uuid primary key default gen_random_uuid()
  landlord_id uuid references landlords(id)
  name text, address text, city text, 
  type text, created_at timestamptz default now()

units:
  id uuid primary key default gen_random_uuid()
  property_id uuid references properties(id)
  unit_number text, rent_amount numeric, 
  status text default 'vacant'

tenants:
  id uuid primary key default gen_random_uuid()
  unit_id uuid references units(id)
  full_name text, email text,
  lease_start date, lease_end date

payments:
  id uuid primary key default gen_random_uuid()
  tenant_id uuid references tenants(id)
  amount numeric, payment_date date, 
  due_date date, status text, method text

maintenance_requests:
  id uuid primary key default gen_random_uuid()
  unit_id uuid references units(id)
  category text, description text, 
  urgency text, status text default 'open',
  created_at timestamptz default now()

Then replace mock data on dashboard, properties, 
tenants, payments, and maintenance pages with 
real Supabase queries using the supabase client.
```

---

## 6. Auth Wiring (Last Step)

```
Wire up Supabase Auth for PropManage BW.

Login page:
const { error } = await supabase.auth.signInWithPassword({ 
  email, password 
})
If error: show error message below form
If success: redirect to /dashboard

Register page:
const { error } = await supabase.auth.signUp({ 
  email, password,
  options: { data: { full_name: name, role } }
})
If success: redirect based on role

Add middleware.ts at root to protect /dashboard and 
/tenant routes — redirect to /auth/login if no session.

Add logout function in Sidebar:
await supabase.auth.signOut()
redirect to /auth/login
```

---

## 7. Quick Reference — DESIGN.md Tokens

| Token | Value |
|---|---|
| Background | `#f4f6f8` |
| Card surface | `#ffffff` |
| Primary | `#003857` |
| Primary container | `#1b4f72` |
| Accent / CTA | `#fea520` |
| Text primary | `#1a1c1e` |
| Text secondary | `#41474e` |
| Text muted | `#72787f` |
| Border ghost | `#e5e8e8` |
| Error | `#ba1a1a` |
| Card shadow | `0px 4px 12px rgba(26,28,30,0.05)` |
| Modal shadow | `0px 12px 24px rgba(26,28,30,0.10)` |
| Border radius | `8px` (cards, buttons, inputs) |
| Large radius | `16px` (modals, hero sections) |
| Pill radius | `9999px` (status chips only) |
| Input height | `44px` |
| Font | `Inter` |

---

## 8. Build Order Checklist

- [ ] Project setup + Tailwind config
- [ ] Folder structure created
- [ ] Sidebar.tsx
- [ ] Topbar.tsx
- [ ] StatCard.tsx
- [ ] StatusChip.tsx
- [ ] Modal.tsx
- [ ] Landing page
- [ ] Login page
- [ ] Register page
- [ ] Dashboard
- [ ] Properties list
- [ ] Property detail
- [ ] Tenants
- [ ] Payments
- [ ] Maintenance kanban
- [ ] Tenant portal
- [ ] Settings
- [ ] Supabase tables
- [ ] Supabase data wiring
- [ ] Auth + middleware
- [ ] Deploy to Vercel
