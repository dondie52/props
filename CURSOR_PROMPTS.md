# Cursor Prompts for PropManage BW

Use these prompts in order. Start a new Cursor chat when context gets long.
Each prompt intentionally starts by reading `claude(1).md` to keep design, tokens, and behavior consistent.

---

## Prompt 0 - First Thing to Paste

```text
Read claude(1).md in the project root. Follow the WAT framework,
design tokens, dos and don'ts for every task in this project.
Do not deviate from the tokens defined there.
```

---

## Prompt 1 - Project Setup

```text
Read claude(1).md. Set up a Next.js 14 App Router project with Tailwind CSS.

Configure tailwind.config.js with these exact custom tokens:
colors: primary #003857, primary-mid #1b4f72, accent #fea520,
bg-page #f4f6f8, bg-card #ffffff, text-main #1a1c1e,
text-sub #41474e, text-muted #72787f, border-ghost #e5e8e8, error #ba1a1a

boxShadow: card "0px 4px 12px rgba(26,28,30,0.05)"
           modal "0px 12px 24px rgba(26,28,30,0.10)"

borderRadius: base 8px, large 16px, pill 9999px

In globals.css:
- Import Inter from @fontsource/inter
- Set body font to Inter
- Set body background to #f4f6f8

Install: @supabase/supabase-js lucide-react recharts @fontsource/inter
```

---

## Prompt 2 - Folder Structure

```text
Read claude(1).md. Scaffold this exact folder structure with empty files:

src/app/page.tsx
src/app/auth/login/page.tsx
src/app/auth/register/page.tsx
src/app/dashboard/page.tsx
src/app/dashboard/properties/page.tsx
src/app/dashboard/properties/[id]/page.tsx
src/app/dashboard/tenants/page.tsx
src/app/dashboard/payments/page.tsx
src/app/dashboard/maintenance/page.tsx
src/app/dashboard/settings/page.tsx
src/app/tenant/dashboard/page.tsx
src/components/layout/Sidebar.tsx
src/components/layout/Topbar.tsx
src/components/layout/TenantNavbar.tsx
src/components/ui/StatCard.tsx
src/components/ui/StatusChip.tsx
src/components/ui/Modal.tsx
src/components/ui/Card.tsx
src/lib/supabase.ts
src/types/index.ts

Each file gets a basic export default function placeholder only.
```

---

## Prompt 3 - Sidebar

```text
Read claude(1).md. Build src/components/layout/Sidebar.tsx.

Specs:
- 240px wide, bg white, border-r border-ghost
- Logo "PropManage BW" top, text primary, font-bold
- Nav items with lucide-react icons:
  LayoutDashboard -> /dashboard
  Building2 -> /dashboard/properties
  Users -> /dashboard/tenants
  CreditCard -> /dashboard/payments
  Wrench -> /dashboard/maintenance
  Settings -> /dashboard/settings
- Active: border-l-[3px] border-accent bg-bg-page text-primary font-medium
- Inactive: text-text-sub hover:bg-bg-page
- usePathname() for active detection
- Bottom: user initials circle bg-primary-mid text white +
  name + email text-muted text-sm
- LogOut icon button text-error at very bottom

WAT: mock user name "Thabo Sithole". No Supabase yet.
```

---

## Prompt 4 - Topbar

```text
Read claude(1).md. Build src/components/layout/Topbar.tsx.

Props: title (string)

Specs:
- bg white, border-b border-ghost, h-16, px-6
- Left: title prop in text-main font-semibold text-lg
- Right: Search input (h-9 w-48 border-ghost rounded-base),
  Bell icon button (lucide Bell, text-muted),
  Avatar circle 36px bg-primary-mid white initials "TS"
- Fully typed with TypeScript
```

---

## Prompt 5 - TenantNavbar

```text
Read claude(1).md. Build src/components/layout/TenantNavbar.tsx.

Specs:
- bg white, border-b border-ghost, h-16, px-6
- Left: "PropManage BW" logo text-primary font-bold
- Center links: My Lease, Payments, Maintenance
  text-text-sub hover:text-primary text-sm
- Right: avatar circle 36px bg-primary-mid +
  LogOut icon button text-error

No Supabase. Mock user "Tebogo Modise".
```

---

## Prompt 6 - StatCard

```text
Read claude(1).md. Build src/components/ui/StatCard.tsx.

Props: title: string, value: string, icon: ReactNode,
       trend?: string, trendUp?: boolean

Specs:
- bg-card border border-ghost rounded-base shadow-card p-6
- Top row: title label-caps text-muted left, icon right
  Icon in 40px circle bg-bg-page text-primary-mid
- Value: text-3xl font-bold text-primary mt-1
- Trend below value: text-xs,
  trendUp=true -> text-green-700 "↑ {trend}"
  trendUp=false -> text-error "↓ {trend}"
```

---

## Prompt 7 - StatusChip

```text
Read claude(1).md. Build src/components/ui/StatusChip.tsx.

Props: status: string

Map status to styles (all pill radius 9999px, text-xs font-semibold px-3 py-1):
paid | occupied | active | resolved -> bg-green-100 text-green-800
pending | expiring | in-progress | medium -> bg-amber-100 text-amber-800
overdue | open | high -> bg-red-100 text-[#ba1a1a]
vacant | low -> bg-bg-page text-text-sub border border-ghost

Capitalize the status label text.
```

---

## Prompt 8 - Modal

```text
Read claude(1).md. Build src/components/ui/Modal.tsx.

Props: isOpen: boolean, onClose: () => void,
       title: string, children: ReactNode

Specs:
- Overlay: fixed inset-0 bg-[rgba(26,28,30,0.5)]
  flex items-center justify-center z-50
- Card: bg-card rounded-large shadow-modal
  max-w-[520px] w-[90%] p-10
- Header: title text-lg font-semibold text-main left,
  lucide X button right -> calls onClose
- Close on: X click, overlay click, ESC keydown
- Children render below header with mt-6
```

---

## Prompt 9 - Landing Page

```text
Read claude(1).md. Build src/app/page.tsx.

Convert the HTML from /page-flow/landinpage/code.html
into a Next.js React component using Tailwind only.

Corrections to apply:
- body bg-bg-page
- All cards: bg-card border border-ghost rounded-base shadow-card
- Primary buttons: bg-primary text white rounded-base h-11 px-6
- CTA buttons: bg-accent text white rounded-base h-11 px-6
- All headings: text-primary
- Body text: text-text-sub
- Nav links use Next.js <Link>
- Fully responsive (mobile + desktop)
```

---

## Prompt 10 - Login Page

```text
Read claude(1).md. Build src/app/auth/login/page.tsx.

Convert HTML from /page-flow/login page/code.html.

Add:
- useState for email, password, showPassword, loading, error
- Validation: empty fields -> red border + error text-error text-sm
- Password toggle: lucide Eye/EyeOff icon right side of input
- Submit: set loading true, show lucide Loader2 animate-spin in button
- On success: useRouter push to /dashboard
- Card: max-w-[440px] mx-auto mt-20 bg-card rounded-large shadow-modal p-10
- Input h-11, border-ghost, focus:border-primary, rounded-base
- Primary button: bg-primary full width h-11

No Supabase yet. Simulate success after 1 second timeout.
```

---

## Prompt 11 - Register Page

```text
Read claude(1).md. Build src/app/auth/register/page.tsx.

Convert HTML from /page-flow/login page/code.html (register screen).

Add:
- useState: name, email, password, confirm, role
- Role toggle pills side by side "Landlord" / "Tenant":
  Selected: bg-primary text-white
  Unselected: bg-card border border-primary text-primary
- Password strength bar below password input:
  <4 chars -> red 1/3 width
  4-8 chars -> amber 2/3 width
  >8 chars -> green full width
- Confirm mismatch: red border + "Passwords do not match" error
- CTA button: bg-accent full width h-11
- On submit: role=Landlord -> /dashboard, role=Tenant -> /tenant/dashboard

No Supabase yet. Simulate with setTimeout.
```

---

## Prompt 12 - Dashboard

```text
Read claude(1).md. Build src/app/dashboard/page.tsx.

Layout: <Sidebar /> left fixed, <Topbar title="Dashboard" /> top,
main content ml-60 pt-16 p-8 bg-bg-page min-h-screen.

Sections:
1. StatCard row (grid grid-cols-4 gap-4):
   Building2 icon -> "Total Properties" "8"
   Users icon -> "Occupied Units" "24/32" trend "12%" trendUp
   CreditCard icon -> "Rent Due" "P18,500"
   Wrench icon -> "Open Maintenance" "3" trend "1 new" trendUp=false

2. Two column grid (grid-cols-3 gap-6 mt-6):
   Left col-span-2: Recent Payments table card
     bg-card border border-ghost rounded-base shadow-card p-6
     Header: "Recent Payments" font-semibold + "View all" link text-primary-mid text-sm
     Table: 5 mock rows, cols: Tenant, Property, Unit, Amount, Date, Status
     Use <StatusChip /> for Status
     Rows: border-b border-ghost hover:bg-bg-page
     Headers: label-caps text-muted

   Right col-span-1: Maintenance summary card
     3 mock rows: category + unit + <StatusChip urgency />

3. Full width below: OccupancyChart
   recharts BarChart, bars fill #1b4f72,
   wrapped in bg-card border border-ghost rounded-base shadow-card p-6

All mock data. No Supabase.
```

---

## Prompt 13 - Properties Page

```text
Read claude(1).md. Build src/app/dashboard/properties/page.tsx.

Layout: Sidebar + Topbar title="Properties".

Header row: "My Properties" text-2xl font-semibold text-primary left,
"Add Property" button bg-accent right -> opens <Modal>.

Search input (controlled useState) filters cards by name.

Property cards grid (grid-cols-3 gap-6):
4 mock cards, each bg-card border border-ghost rounded-base shadow-card p-6:
- Name font-semibold text-main
- Address text-sm text-muted
- Type chip: text-xs border border-ghost rounded-full px-3 py-1 text-text-sub
- Stats row: Total/Occupied/Vacant small boxes bg-bg-page rounded p-2
- Progress bar: track bg-bg-page h-2 rounded-full,
  fill bg-primary-mid rounded-full, width = occupancy %
- Percentage label text-xs text-muted right
- Two buttons: "View Details" secondary -> /dashboard/properties/[id],
  "Add Unit" bg-accent small

Add Property Modal fields:
Property Name, Address, City, Units (type number), Type (select)
Cancel secondary + "Save Property" bg-primary
```

---

## Prompt 14 - Property Detail

```text
Read claude(1).md. Build src/app/dashboard/properties/[id]/page.tsx.

Layout: Sidebar + Topbar with breadcrumb
"Properties / Sunset Apartments" - breadcrumb uses Next.js Link.

Sections:
1. Header card (bg-card shadow-card border-ghost rounded-base p-6):
   Name H2 text-primary, address text-muted,
   type chip, Edit secondary button + Add Unit bg-accent button right

2. 4 mini stat boxes grid-cols-4 (bg-bg-page border border-ghost rounded-base p-4):
   Total Units / Occupied / Vacant / Monthly Revenue

3. Units table (bg-card shadow-card border-ghost rounded-base p-6):
   Cols: Unit No, Tenant, Rent, Lease End, Status, Actions
   6 mock rows, <StatusChip /> for Status
   Actions: "View" text-primary-mid text-sm + lucide Pencil icon button
   Clicking a row sets selectedUnit state

4. Slide-in right panel (when selectedUnit set):
   Fixed right panel 320px, bg-card shadow-modal border-l border-ghost
   Tenant initials circle bg-primary-mid,
   name, lease dates, rent amount,
   last 3 payments mini list with StatusChip
   "Close" X button top right clears selectedUnit
```

---

## Prompt 15 - Tenants Page

```text
Read claude(1).md. Build src/app/dashboard/tenants/page.tsx.

Layout: Sidebar + Topbar title="Tenants".

Header: "All Tenants" + "24 active tenants" text-muted text-sm,
"Add Tenant" bg-accent right.

Filter row: Search input + Status filter select (All/Active/Expiring/Overdue)
useState filters table.

Table (bg-card shadow-card border-ghost rounded-base):
8 mock rows, cols: Name, Property, Unit, Rent, Lease End, Status, Actions
- Name col: flex row, 36px initials circle bg-primary-mid text-white,
  name font-medium text-main + email text-xs text-muted below
- Status: <StatusChip />
- Actions: lucide Eye + Mail icon buttons text-muted hover:text-primary

Alternating rows: odd white, even bg-bg-page
Pagination bar: Prev/Next buttons + "Page 1 of 3" text-muted text-sm
```

---

## Prompt 16 - Payments Page

```text
Read claude(1).md. Build src/app/dashboard/payments/page.tsx.

Layout: Sidebar + Topbar title="Payments".

StatCards row (grid-cols-4):
Collected P18,500 / Pending P4,200 / Overdue P1,800 / Rate 87%

Payments table card (bg-card shadow-card border-ghost rounded-base p-6):
Header: "Payment History" left + month select dropdown +
"Record Payment" bg-accent right -> opens <Modal>

Table 10 mock rows:
Cols: Tenant, Property, Unit, Amount, Due Date, Paid Date, Status, Receipt
- Status: <StatusChip />
- Receipt: lucide Download icon text-primary-mid cursor-pointer
- Row hover: bg-bg-page

Record Payment Modal fields:
Tenant select, Unit select, Amount (P prefix),
Date input, Method select, Notes textarea
Cancel secondary + "Record Payment" bg-primary
```

---

## Prompt 17 - Maintenance Page

```text
Read claude(1).md. Build src/app/dashboard/maintenance/page.tsx.

Layout: Sidebar + Topbar title="Maintenance".

Filter bar (bg-card border-ghost rounded-base p-4 mb-6):
Property, Category, Urgency, Status dropdowns inline.
"New Request" bg-accent right -> opens <Modal>.

Kanban board (grid-cols-3 gap-6):
Columns: Open | In Progress | Resolved
Each column header: bold title + count badge bg-bg-page rounded-full px-2

Each request card (bg-card border border-ghost rounded-base shadow-card p-4 mb-3):
- Top: category text-xs text-muted left + <StatusChip urgency /> right
- Property bold text-main + unit text-sm text-muted
- Description text-sm text-text-sub mt-1
- Bottom: date text-xs text-muted left +
  "Move Forward ->" text-primary-mid text-sm right

Move Forward logic with useState:
open -> in-progress -> resolved
Remove "Move Forward" button on resolved cards.

Mock 8 cards spread: 3 open, 3 in-progress, 2 resolved.

New Request Modal: Category select, Description textarea,
Urgency pills Low/Medium/High
(selected pill: bg-primary text-white, unselected: border border-ghost)
```

---

## Prompt 18 - Tenant Portal

```text
Read claude(1).md. Build src/app/tenant/dashboard/page.tsx.

Layout: <TenantNavbar /> top, content pt-16 p-8 bg-bg-page.

Sections:
1. Welcome banner (bg-card shadow-card border-ghost rounded-large p-6 flex):
   Left: H2 "Welcome back, Tebogo Modise" text-primary,
   "Unit 4B · Sunset Apartments" text-muted text-sm
   Right: amber box bg-accent rounded-base p-4 text-white text-center:
   "Next Payment" text-xs mb-1, "P2,400" text-2xl font-bold,
   "Due in 8 days" text-xs mt-1

2. Lease card (bg-card shadow-card border-ghost rounded-base p-6 mt-6):
   "My Lease" font-semibold + <StatusChip status="active" />
   4 info boxes grid-cols-4 bg-bg-page rounded-base p-3:
   Lease Start / Lease End / Monthly Rent / Deposit
   Lease progress bar: 60% filled bg-primary-mid, track bg-bg-page h-2

3. Payment History table (bg-card shadow-card p-6 mt-6):
   5 mock rows: Date, Amount, <StatusChip />, lucide Download icon

4. Maintenance Requests (bg-card shadow-card p-6 mt-6):
   Header: "My Requests" + "New Request" bg-accent small right
   3 mock rows: lucide icon + title + date + <StatusChip />
   New Request Modal: Category select, Description textarea,
   Urgency pills (same as maintenance page)
```

---

## Prompt 19 - Settings Page

```text
Read claude(1).md. Build src/app/dashboard/settings/page.tsx.

Layout: Sidebar + Topbar title="Settings".
Content: two-column flex gap-6.

Left panel (bg-card shadow-card border-ghost rounded-base p-4 w-60 shrink-0):
Nav items: Profile, Security, Billing, Notifications
Active: border-l-[3px] border-accent bg-bg-page text-primary font-medium pl-3
Inactive: text-text-sub hover:bg-bg-page pl-3
useState activeTab controls right panel.

Right panel (bg-card shadow-card border-ghost rounded-base p-8 flex-1):

Profile tab:
- Avatar 80px circle bg-primary-mid initials white,
  camera icon overlay on hover bg-black/30
- Fields: Full Name, Email, Phone, Company, Country select
  All h-11 border-ghost rounded-base focus:border-primary
- "Save Changes" bg-primary h-11 mt-4

Security tab:
- "Change Password" section: 3 inputs Current/New/Confirm
- 2FA toggle: custom toggle, on=bg-primary-mid, off=bg-bg-page
  label "Two-factor authentication" text-main

Billing tab:
- Plan card bg-primary text-white rounded-base p-6:
  Plan name "Pro", "P199/month", next billing date
- "Upgrade Plan" bg-accent mt-4
- Payment method row: lucide CreditCard icon +
  "Visa ending in 4242" text-main + "Update" link text-primary-mid
```

---

## Prompt 20 - Supabase Setup

```text
Read claude(1).md. Set up Supabase for PropManage BW.

1. Create src/lib/supabase.ts:
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

2. Create .env.local with placeholder keys:
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

3. Create src/types/index.ts with TypeScript types for:
Landlord, Property, Unit, Tenant, Payment, MaintenanceRequest
Match all fields from claude(1).md Supabase tables section.
```

---

## Prompt 21 - Auth Wiring

```text
Read claude(1).md. Wire Supabase Auth into PropManage BW.

Login page - replace setTimeout with:
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) setError(error.message)
else router.push('/dashboard')

Register page - replace setTimeout with:
const { error } = await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: name, role } }
})
if (!error) role === 'Landlord'
  ? router.push('/dashboard')
  : router.push('/tenant/dashboard')

Sidebar logout button:
await supabase.auth.signOut()
router.push('/auth/login')

Create middleware.ts at project root:
Protect /dashboard/* and /tenant/* routes.
Redirect to /auth/login if no active session.
Use @supabase/auth-helpers-nextjs.
```

---

## Prompt 22 - Deploy

```text
Read claude(1).md. Prepare PropManage BW for Vercel deployment.

1. Confirm .env.local has real Supabase URL and anon key
2. Add next.config.js image domains if any images used
3. Run: npm run build - fix any TypeScript or lint errors
4. Push to GitHub
5. Connect repo to Vercel
6. Add environment variables in Vercel dashboard:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
7. Deploy and confirm live URL works
8. Test login, dashboard, and tenant portal on live URL
```
