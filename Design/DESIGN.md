---
name: SmartCanteen Core
colors:
  surface: '#fff8f4'
  surface-dim: '#e5d8cd'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e6'
  surface-container: '#f9ece0'
  surface-container-high: '#f3e6db'
  surface-container-highest: '#ede0d5'
  on-surface: '#211a14'
  on-surface-variant: '#514537'
  inverse-surface: '#362f28'
  inverse-on-surface: '#fceee3'
  outline: '#847465'
  outline-variant: '#d6c3b1'
  surface-tint: '#865300'
  primary: '#825100'
  on-primary: '#ffffff'
  primary-container: '#a36707'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb960'
  secondary: '#775934'
  on-secondary: '#ffffff'
  secondary-container: '#ffd6a8'
  on-secondary-container: '#7a5b36'
  tertiary: '#006388'
  on-tertiary: '#ffffff'
  tertiary-container: '#037dab'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb960'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#e8c093'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#5d411f'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7ed0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#fff8f4'
  on-background: '#211a14'
  surface-variant: '#ede0d5'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Manrope
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.25'
  h3:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: '1.3'
  h4:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Manrope
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  spacer-1: 0.25rem
  spacer-2: 0.5rem
  spacer-3: 1rem
  spacer-4: 1.5rem
  spacer-5: 3rem
  grid-gutter: 1.5rem
  container-max-width: 1320px
---

## Brand & Style

This design system is built upon a **Warm Professional / Modern** aesthetic, prioritizing utility, efficiency, and a grounded sense of reliability. The target audience includes corporate employees, facility managers, and canteen staff who require a frictionless interface for high-frequency tasks like meal pre-ordering, balance management, and inventory tracking.

The visual language emphasizes clarity through a clean, structured layout and a sophisticated, inviting tone. It avoids unnecessary ornamentation, favoring a "content-first" approach that utilizes whitespace to reduce cognitive load while the warm color palette creates an approachable atmosphere. The emotional response should be one of confidence and organized precision.

## Colors

The color palette is anchored by **Golden Ochre (#A66A0B)**, a warm and trustworthy primary shade that ensures professional appeal with a hospitality-oriented touch.

- **Primary:** Used for key action buttons, active navigation states, and primary branding elements.
- **Secondary:** A warm **Tan/Taupe (#92714A)** used for secondary actions and less prominent UI elements to maintain a grounded visual hierarchy.
- **Surface & Backgrounds:** This design system utilizes a "Light" default mode. Backgrounds use a sophisticated **Stone Grey (#7F756C)** derived tone to reduce screen glare, while cards and containers use lighter surface tints to pop against the base.
- **High Contrast:** Text is set in a near-black shade to ensure maximum readability against light backgrounds, meeting WCAG AA standards.

## Typography

This design system leverages **Manrope** for all typographic layers. Manrope is chosen for its geometric yet modern characteristics, offering excellent legibility in both large-scale headlines and dense data tables.

- **Headlines:** Use semi-bold to bold weights with tighter line-heights to create a strong visual anchor.
- **Body Text:** Uses a standard 1rem (16px) base for comfort. For long-form data or descriptions, the `body-md` scale provides a balanced rhythm.
- **Functional Labels:** Used for buttons, tabs, and input labels, these utilize a slightly heavier weight (Medium 500) and minor letter spacing to differentiate them from static content.

## Layout & Spacing

The design system adheres to the **Bootstrap 12-column fluid grid system**. This ensures compatibility with standard web frameworks and predictable behavior across viewport sizes.

- **Rhythm:** An 8px (0.5rem) base unit governs all padding and margins, ensuring a consistent vertical and horizontal rhythm.
- **Containers:** Content is housed within fixed-width containers on desktop to maintain optimal line lengths for readability, while transitioning to fluid width on mobile devices.
- **Gaps:** Standard gutters are set to 1.5rem to provide ample breathing room between functional modules (cards/columns).

## Elevation & Depth

To convey hierarchy without clutter, this design system uses **Tonal Layers** combined with **Ambient Shadows** that complement the warm neutral palette.

1.  **Level 0 (Base):** The page background (#7F756C derivatives).
2.  **Level 1 (Cards/Containers):** Lighter neutral surfaces with a subtle 1px border or a very soft, diffused shadow to indicate elevation.
3.  **Level 2 (Dropdowns/Modals):** Elements that sit above the primary UI use a more pronounced shadow to indicate interactivity and focus.

Interactive elements like buttons use a subtle lift effect (slight shadow increase) on hover to provide tactile feedback.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius for standard components. This softens the professional aesthetic, making the interface feel approachable and modern.

- **Small Components:** Checkboxes and small badges use a 0.25rem radius.
- **Standard Components:** Buttons, input fields, and cards use the 0.5rem base.
- **Large Components:** Modals and large feature banners may scale up to 1rem (16px) for a more integrated feel.

## Components

The component library follows standard patterns, refined with the design system's specific tokens:

- **Buttons:**
    - **Primary:** Solid #A66A0B with white text. High contrast, 0.5rem radius.
    - **Secondary:** Outlined with a 1px #A66A0B border or solid #92714A.
- **Cards:** Light surface background, 0.5rem border-radius, and a subtle stone-grey border. Used for meal items, user profiles, and dashboard widgets.
- **Input Fields:** 1rem vertical padding, soft warm-grey borders. The focus state uses a 2px solid primary ochre ring with a soft outer glow.
- **Chips/Badges:** Used for food categories (e.g., "Vegetarian," "Gluten-Free"). These use a desaturated version of the palette with dark text to ensure readability.
- **Navigation:** A clean top navbar with a light surface background and primary-colored active indicators.
- **Data Tables:** High-contrast headers with subtle row striping to facilitate scanning of transactions or inventory lists.