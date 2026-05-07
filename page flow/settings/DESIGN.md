---
colors:
  surface: '#f9f9fc'
  surface-dim: '#d9dadd'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f7'
  surface-container: '#edeef1'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#41474e'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#f0f0f4'
  outline: '#72787f'
  outline-variant: '#c1c7cf'
  surface-tint: '#326286'
  primary: '#003857'
  on-primary: '#ffffff'
  primary-container: '#1b4f72'
  on-primary-container: '#92c0e9'
  inverse-primary: '#9dcbf4'
  secondary: '#865300'
  on-secondary: '#ffffff'
  secondary-container: '#fea520'
  on-secondary-container: '#694000'
  tertiary: '#4a2f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#674404'
  on-tertiary-container: '#e4b36c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#9dcbf4'
  on-primary-fixed: '#001e31'
  on-primary-fixed-variant: '#154b6d'
  secondary-fixed: '#ffddb9'
  secondary-fixed-dim: '#ffb961'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#663e00'
  tertiary-fixed: '#ffddb2'
  tertiary-fixed-dim: '#f1be76'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  h1:
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is engineered to evoke a sense of structural integrity and operational clarity. It balances the high-stakes nature of property management with a calm, tech-forward interface. The aesthetic is rooted in **Corporate Modernism**, prioritizing functional hierarchy over decorative elements to ensure users can manage complex data without cognitive fatigue.

The visual narrative relies on generous whitespace to create an "airy" feel, preventing the density of financial and tenant data from becoming overwhelming. It communicates reliability through stable layouts and a disciplined color application.

## Colors

The palette is anchored by **Dark Blue (#1B4F72)**, chosen for its traditional association with corporate stability and trust. This is contrasted by **Amber (#F39C12)**, which serves as a high-visibility accent for critical actions, notifications, and primary Call-to-Actions (CTAs). 

The foundation of the interface is a **Light Gray (#F4F6F8)** background, which provides a clean canvas that reduces eye strain during long working sessions. Typography is set in **Deep Charcoal**, ensuring high-contrast readability that is softer and more sophisticated than pure black.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian nature. The typeface is optimized for screen readability, particularly for the numerical data frequent in property management.

- **Headlines:** Use bold weights and slight negative letter-spacing to create a "locked-in," authoritative feel.
- **Body Copy:** Standardized at 16px (1rem) for optimal legibility, using a 1.5x line height to ensure text blocks remain scannable.
- **Labels:** Small, uppercase labels with increased tracking are used for secondary metadata and table headers to distinguish them from actionable data.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model for dashboard environments, allowing property managers to view maximum data across various screen sizes. Content is organized into a 12-column grid system with 24px gutters to maintain clear separation between modules.

Spacing follows an 8px rhythmic scale. This consistency ensures that even dense layouts—such as tenant ledgers or maintenance logs—maintain a structured and organized appearance. Generous padding (24px to 40px) is applied to container units to preserve the "airy" brand promise.

## Elevation & Depth

To maintain a professional and clean aesthetic, the design system utilizes **Ambient Shadows** and **Tonal Layering** rather than heavy gradients.

1.  **Low Elevation (Surface):** Default background (#F4F6F8).
2.  **Mid Elevation (Cards):** White surfaces (#FFFFFF) with a soft, diffused shadow (0px 4px 12px, 5% opacity charcoal). This signifies interactive modules.
3.  **High Elevation (Modals/Dropdowns):** Sharp white surfaces with a more pronounced shadow (0px 12px 24px, 10% opacity charcoal) to pull critical tasks into the foreground.

The use of "ghost borders" (1px solid #E5E8E8) is preferred over shadows for internal UI elements like input fields and table rows to keep the interface crisp.

## Shapes

The design system employs a **Rounded** shape language with a base corner radius of **8px (0.5rem)**. This specific radius is used to soften the "corporate" edge of the dark blue palette, making the app feel approachable while maintaining an organized, grid-aligned structure.

- **Primary Radius (8px):** Buttons, Input fields, Cards, and Modals.
- **Large Radius (16px):** Promotional banners or large dashboard hero sections.
- **Pill Radius:** Specifically reserved for Status Chips (e.g., "Paid", "Pending", "Overdue") to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Dark Blue (#1B4F72) with White text. Bold weight.
- **Accent/CTA:** Solid Amber (#F39C12) with White or Deep Charcoal text, used exclusively for high-conversion actions (e.g., "Add Property").
- **Secondary:** Transparent with a 1px Dark Blue border.

### Input Fields
- Height: 44px for a comfortable touch and click target.
- Border: 1px Gray-200, shifting to Dark Blue on focus.
- Placeholder text: Gray-400 for clear distinction.

### Cards
- White background, 8px radius, subtle 5% opacity shadow.
- Used for grouping property details, financial summaries, or tenant info.

### Chips & Tags
- Used for status indicators.
- Lightly tinted backgrounds with saturated text for high glanceability (e.g., Light Green background with Dark Green text for "Occupied").

### Data Tables
- Clean, borderless rows with subtle dividers.
- Alternate row striping using Background Light Gray (#F4F6F8) for long-form data management.