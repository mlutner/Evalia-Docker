# Evalia Style Guide
## Survey Analytics for HR & L&D — 2025 Edition

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [CSS Variables & Design Tokens](#css-variables--design-tokens)
7. [Implementation Examples](#implementation-examples)

---

## Design Philosophy

This style guide breaks away from the cold, generic "AI-generated" blue/purple SaaS aesthetic. Instead, we embrace **warmth, humanity, and approachability** — values that matter in HR and L&D software where the subject is *people*.

**Inspired by**: Culture Amp's vibrant coral palette, 2025's earth-tone movement, and the shift toward warm, grounded design.

### Core Principles

- **Human-First** — Warm coral and teal evoke humanity and growth, not cold technology
- **Distinctive** — Stand out from the sea of blue SaaS products
- **Grounded** — Warm cream backgrounds and earthy accents feel inviting, not sterile
- **Accessible** — WCAG 2.2 AA compliant with 4.5:1+ contrast ratios
- **Data with Soul** — Analytics that feel approachable, not intimidating

---

## Color System

### The Color Theory

Our palette is built on **complementary harmony**: warm coral/terracotta tones paired with cool teal/ocean greens. This creates visual tension that's energizing but balanced — perfect for an analytics product that needs to feel both dynamic and trustworthy.

**Why not blue/purple?**
- Every AI tool, every SaaS product defaults to blue/purple
- HR software is about *people* — warm colors feel more human
- Culture Amp, a leader in this space, uses coral as their primary
- 2025 trends are moving toward earth tones, corals, and warm neutrals

---

### Primary Palette — Coral

Coral conveys energy, optimism, and warmth. It's distinctive without being aggressive.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--coral-50` | `#FFF5F3` | rgb(255, 245, 243) | Lightest backgrounds |
| `--coral-100` | `#FFE8E4` | rgb(255, 232, 228) | Subtle highlights |
| `--coral-200` | `#FFD0C7` | rgb(255, 208, 199) | Borders on coral elements |
| `--coral-300` | `#FFA799` | rgb(255, 167, 153) | Inactive states |
| `--coral-400` | `#FF7A66` | rgb(255, 122, 102) | Secondary emphasis |
| `--coral-500` | `#F04C5D` | rgb(240, 76, 93) | **Primary brand color** |
| `--coral-600` | `#E03A4A` | rgb(224, 58, 74) | Primary buttons, CTAs |
| `--coral-700` | `#C42D3D` | rgb(196, 45, 61) | Hover states |
| `--coral-800` | `#A32433` | rgb(163, 36, 51) | Active/pressed |
| `--coral-900` | `#7D1C28` | rgb(125, 28, 40) | Dark accents |

---

### Secondary Palette — Teal/Ocean

Teal provides the cool counterbalance. It represents growth, clarity, and trust.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--teal-50` | `#EFFCF9` | rgb(239, 252, 249) | Light backgrounds |
| `--teal-100` | `#D1F5ED` | rgb(209, 245, 237) | Subtle highlights |
| `--teal-200` | `#A3EBDB` | rgb(163, 235, 219) | Borders |
| `--teal-300` | `#6BDBC3` | rgb(107, 219, 195) | Inactive elements |
| `--teal-400` | `#45AD8F` | rgb(69, 173, 143) | **Seedling** — growth |
| `--teal-500` | `#1B9B82` | rgb(27, 155, 130) | Secondary actions |
| `--teal-600` | `#1B7688` | rgb(27, 118, 136) | **Ocean** — depth |
| `--teal-700` | `#166460` | rgb(22, 100, 96) | Hover states |
| `--teal-800` | `#115249` | rgb(17, 82, 73) | Active states |
| `--teal-900` | `#0D3D36` | rgb(13, 61, 54) | Dark accents |

---

### Neutral Palette — Warm Paper

Unlike cold grays, our neutrals have warm undertones (cream, paper, sand).

| Token | Hex | Usage |
|-------|-----|-------|
| `--paper-white` | `#FFFDFB` | Pure backgrounds |
| `--paper-50` | `#FAF8F5` | Page backgrounds |
| `--paper-100` | `#F2EDDE` | **Paper** — card backgrounds |
| `--paper-200` | `#E8E2D3` | Subtle borders |
| `--paper-300` | `#D6CFC0` | Disabled backgrounds |
| `--ink-100` | `#9B958A` | Placeholder text |
| `--ink-200` | `#706B62` | Secondary text |
| `--ink-300` | `#524E47` | Body text |
| `--ink-400` | `#3E4543` | **Ink** — headings |
| `--ink-500` | `#2A2D2C` | Primary text |
| `--ink-900` | `#1A1C1B` | High contrast |

---

### Accent Palette

Additional colors for variety and data visualization.

| Name | Hex | Personality |
|------|-----|-------------|
| **Yuzu** | `#FFCE1E` | Energy, celebration, highlights |
| **Peach** | `#F3786D` | Soft warmth, secondary coral |
| **Wisteria** | `#727193` | Sophistication, subtle purple |
| **Lapis** | `#253C64` | Deep trust, contrast |
| **Sage** | `#8B9A71` | Nature, balance, calm |
| **Mocha** | `#8B7355` | Earthiness, 2025 trend color |

---

### Semantic Colors

Status indicators with warmth.

| Purpose | Background | Foreground | Text |
|---------|------------|------------|------|
| **Success** | `#E8F5E9` | `#2E7D32` | Growth achieved |
| **Warning** | `#FFF3E0` | `#E65100` | Attention needed |
| **Error** | `#FFEBEE` | `#C62828` | Critical issue |
| **Info** | `#E3F2FD` | `#1565C0` | Helpful context |

---

### Chart Colors — The Evalia Spectrum

A warm-to-cool gradient that feels cohesive and distinct.

```css
--chart-coral: #F04C5D;      /* Primary metric */
--chart-peach: #F3786D;      /* Secondary metric */
--chart-yuzu: #FFCE1E;       /* Highlights, positive */
--chart-sage: #8B9A71;       /* Natural, neutral */
--chart-teal: #45AD8F;       /* Growth metrics */
--chart-ocean: #1B7688;      /* Deep engagement */
--chart-wisteria: #727193;   /* Subtle differentiation */
--chart-lapis: #253C64;      /* Contrast, depth */
```

**Chart Usage Guidelines:**
- Lead with coral for primary KPIs
- Use teal/ocean for growth/positive trends
- Yuzu for standout data points
- Wisteria and sage for less important series

---

## Typography

### Font Stack

**Primary Font: Inter**
- The industry standard for SaaS dashboards
- Excellent legibility at all sizes
- Pairs beautifully with warm color palettes

**Accent Font (Optional): DM Sans**
- Slightly softer, more humanist alternative
- Works well for marketing pages

**Monospace: JetBrains Mono**
- For data tables, percentages, and numerical displays

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-display: 'DM Sans', var(--font-sans);
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 12px / 0.75rem | 400 | 1.5 | Labels, captions |
| `--text-sm` | 14px / 0.875rem | 400 | 1.5 | Secondary text, table data |
| `--text-base` | 16px / 1rem | 400 | 1.6 | Body text |
| `--text-lg` | 18px / 1.125rem | 500 | 1.5 | Large body, card titles |
| `--text-xl` | 20px / 1.25rem | 600 | 1.4 | Section headers |
| `--text-2xl` | 24px / 1.5rem | 600 | 1.3 | Page subtitles |
| `--text-3xl` | 30px / 1.875rem | 700 | 1.2 | Page titles |
| `--text-4xl` | 36px / 2.25rem | 700 | 1.1 | Dashboard KPIs |
| `--text-5xl` | 48px / 3rem | 700 | 1.0 | Hero numbers |

### Font Weights

```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing & Layout

### Spacing Scale (8pt Grid)

Our spacing system is built on an 8px base unit for consistent rhythm.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | Reset |
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Inline element spacing |
| `--space-3` | 12px | Small component padding |
| `--space-4` | 16px | Default padding, gaps |
| `--space-5` | 20px | Medium padding |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Section spacing |
| `--space-10` | 40px | Large gaps |
| `--space-12` | 48px | Section margins |
| `--space-16` | 64px | Page sections |
| `--space-20` | 80px | Hero spacing |
| `--space-24` | 96px | Major sections |

### Border Radius

Modern, rounded aesthetic without being overly soft.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | Sharp edges |
| `--radius-sm` | 4px | Buttons, inputs |
| `--radius-md` | 8px | Cards, dropdowns |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-xl` | 16px | Feature cards |
| `--radius-2xl` | 24px | Hero sections |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows

Subtle elevation system with warm undertones.

```css
/* Elevation 1 - Cards at rest */
--shadow-sm: 0 1px 2px 0 rgb(62 69 67 / 0.06);

/* Elevation 2 - Cards on hover, dropdowns */
--shadow-md: 0 4px 6px -1px rgb(62 69 67 / 0.08),
             0 2px 4px -2px rgb(62 69 67 / 0.06);

/* Elevation 3 - Modals, popovers */
--shadow-lg: 0 10px 15px -3px rgb(62 69 67 / 0.1),
             0 4px 6px -4px rgb(62 69 67 / 0.06);

/* Elevation 4 - Floating elements */
--shadow-xl: 0 20px 25px -5px rgb(62 69 67 / 0.1),
             0 8px 10px -6px rgb(62 69 67 / 0.06);

/* Focus rings - Coral glow */
--shadow-focus-coral: 0 0 0 3px rgba(240, 76, 93, 0.3);
--shadow-focus-teal: 0 0 0 3px rgba(27, 155, 130, 0.3);
```

### Layout Grid

```css
/* Container widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Sidebar */
--sidebar-width: 260px;
--sidebar-collapsed: 72px;

/* Content area */
--content-max-width: 1200px;
```

---

## Components

### Cards

Cards sit on warm paper backgrounds for a cozy, inviting feel.

```css
.card {
  background: var(--paper-white);
  border: 1px solid var(--paper-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

#### Card Variants

- **Coral Accent Card** - Featured/Important content
- **Teal Accent Card** - Growth/Success indicators
- **Stat Card** - KPI displays with large numbers
- **Interactive Card** - Clickable cards with hover states

### Buttons

Warm, inviting buttons that feel human.

- **Primary (Coral)** - Main CTAs, primary actions
- **Secondary (Teal)** - Secondary actions, growth-related
- **Outline** - Tertiary actions
- **Ghost (Coral/Teal)** - Minimal emphasis actions
- **Danger** - Destructive actions

### Form Inputs

Warm, accessible form controls with coral focus states.

### Badges & Tags

Status indicators using our warm palette:
- Default, Coral, Teal, Yuzu, Success, Warning, Error

### Progress Indicators

Warm progress bars with coral/teal gradients.

### Tables

Warm, readable data tables with paper backgrounds.

### Tabs

Navigation with coral accent for active state.

---

## CSS Variables & Design Tokens

### Complete Token Set

```css
:root {
  /* ========== CORAL PALETTE ========== */
  --coral-50: #FFF5F3;
  --coral-100: #FFE8E4;
  --coral-200: #FFD0C7;
  --coral-300: #FFA799;
  --coral-400: #FF7A66;
  --coral-500: #F04C5D;
  --coral-600: #E03A4A;
  --coral-700: #C42D3D;
  --coral-800: #A32433;
  --coral-900: #7D1C28;

  /* ========== TEAL PALETTE ========== */
  --teal-50: #EFFCF9;
  --teal-100: #D1F5ED;
  --teal-200: #A3EBDB;
  --teal-300: #6BDBC3;
  --teal-400: #45AD8F;
  --teal-500: #1B9B82;
  --teal-600: #1B7688;
  --teal-700: #166460;
  --teal-800: #115249;
  --teal-900: #0D3D36;

  /* ========== NEUTRAL PALETTE ========== */
  --paper-white: #FFFDFB;
  --paper-50: #FAF8F5;
  --paper-100: #F2EDDE;
  --paper-200: #E8E2D3;
  --paper-300: #D6CFC0;
  --ink-100: #9B958A;
  --ink-200: #706B62;
  --ink-300: #524E47;
  --ink-400: #3E4543;
  --ink-500: #2A2D2C;
  --ink-900: #1A1C1B;

  /* ========== ACCENT COLORS ========== */
  --yuzu: #FFCE1E;
  --peach: #F3786D;
  --wisteria: #727193;
  --lapis: #253C64;
  --sage: #8B9A71;
  --mocha: #8B7355;

  /* ========== SEMANTIC COLORS ========== */
  --success-bg: #E8F5E9;
  --success-fg: #2E7D32;
  --warning-bg: #FFF3E0;
  --warning-fg: #E65100;
  --error-bg: #FFEBEE;
  --error-fg: #C62828;
  --info-bg: #E3F2FD;
  --info-fg: #1565C0;

  /* ========== CHART COLORS ========== */
  --chart-coral: #F04C5D;
  --chart-peach: #F3786D;
  --chart-yuzu: #FFCE1E;
  --chart-sage: #8B9A71;
  --chart-teal: #45AD8F;
  --chart-ocean: #1B7688;
  --chart-wisteria: #727193;
  --chart-lapis: #253C64;

  /* ========== TYPOGRAPHY ========== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'DM Sans', var(--font-sans);
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ========== SPACING ========== */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* ========== BORDERS & RADIUS ========== */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ========== SHADOWS ========== */
  --shadow-sm: 0 1px 2px 0 rgb(62 69 67 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(62 69 67 / 0.08), 0 2px 4px -2px rgb(62 69 67 / 0.06);
  --shadow-lg: 0 10px 15px -3px rgb(62 69 67 / 0.1), 0 4px 6px -4px rgb(62 69 67 / 0.06);
  --shadow-xl: 0 20px 25px -5px rgb(62 69 67 / 0.1), 0 8px 10px -6px rgb(62 69 67 / 0.06);
  --shadow-focus-coral: 0 0 0 3px rgba(240, 76, 93, 0.3);
  --shadow-focus-teal: 0 0 0 3px rgba(27, 155, 130, 0.3);

  /* ========== TRANSITIONS ========== */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);

  /* ========== Z-INDEX ========== */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-tooltip: 600;
  --z-toast: 700;
}
```

---

## Implementation Examples

### Survey Response Card

```html
<div class="card card-interactive">
  <div class="card-header">
    <div>
      <h3 class="card-title">Employee Engagement Survey</h3>
      <p class="card-subtitle">Q4 2025 - 156 responses</p>
    </div>
    <span class="badge badge-success badge-dot">Active</span>
  </div>
  <div class="card-body">
    <div class="stat-row">
      <div class="stat-item">
        <span class="stat-value">78%</span>
        <span class="stat-label">Response Rate</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">4.2</span>
        <span class="stat-label">Avg. Score</span>
      </div>
    </div>
    <div class="progress" style="margin-top: var(--space-4);">
      <div class="progress-bar" style="width: 78%;"></div>
    </div>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">View Results</button>
    <button class="btn btn-ghost">Export</button>
  </div>
</div>
```

### Analytics Dashboard KPI Row

```html
<div class="kpi-grid">
  <div class="card card-stat">
    <span class="stat-value">1,247</span>
    <span class="stat-label">Total Responses</span>
    <span class="badge badge-success">+12% vs last month</span>
  </div>

  <div class="card card-stat">
    <span class="stat-value">82%</span>
    <span class="stat-label">Completion Rate</span>
    <span class="badge badge-warning">-3% vs last month</span>
  </div>

  <div class="card card-stat">
    <span class="stat-value">4.5</span>
    <span class="stat-label">Average Score</span>
    <span class="badge badge-success">+0.3 vs last month</span>
  </div>

  <div class="card card-stat">
    <span class="stat-value">6</span>
    <span class="stat-label">Active Surveys</span>
    <span class="badge badge-default">No change</span>
  </div>
</div>
```

---

## Best Practices Summary

### Do's
- Use the 8px spacing grid consistently
- Maintain 4.5:1 contrast ratios for text
- Apply subtle hover states (3-5% scale, color shifts)
- Use shadows sparingly for elevation
- Keep cards clean with adequate whitespace
- Use the mono font for numerical data
- Implement focus states for accessibility

### Don'ts
- Don't use more than 2-3 colors per view
- Avoid sharp corners on interactive elements
- Don't skip hover/focus states
- Avoid thin font weights below 16px
- Don't rely solely on color for status indicators
- Avoid shadows heavier than `--shadow-lg` for cards
- Don't use animation durations over 300ms

---

*Style Guide Version 1.0 — Created December 2025*
*For HR & Learning Development Survey Analytics Platforms*
