# Evalia Color Consolidation Plan

## Executive Summary

**Problem:** 2,805 hardcoded color values scattered across 130+ files
**Goal:** Consolidate all colors to use CSS variables from `index.css`

---

## Current State Analysis

### Color Count by Type
| Type | Count |
|------|-------|
| Hex colors (#RRGGBB) | 670 |
| Tailwind color classes | 2,088 |
| RGB/RGBA values | 39 |
| **Total** | **2,805** |

### Files with Most Hardcoded Colors
1. `QuestionCard.tsx` - 95 colors (89 hex + 6 Tailwind)
2. `DesignV2.tsx` - 211 colors (19 hex + 192 Tailwind)
3. `theme.ts` - 50 hex (centralized, OK)
4. `surveyBackgrounds.ts` - 30 hex (decorative themes)
5. `LegacyAnalyticsPage.tsx` - 64 colors

---

## Proposed Variable Naming Convention

### Semantic Variables (Use These)
```css
/* Intent-based naming - what the color is FOR */
--color-text-primary       /* Main body text */
--color-text-secondary     /* Supporting text */
--color-text-muted         /* Disabled/subtle text */
--color-text-inverse       /* Text on dark backgrounds */

--color-bg-page            /* Page background */
--color-bg-card            /* Card/surface background */
--color-bg-hover           /* Hover state background */
--color-bg-active          /* Active/pressed state */

--color-border-default     /* Standard borders */
--color-border-strong      /* Emphasized borders */
--color-border-subtle      /* Subtle dividers */

--color-action-primary     /* Primary CTA buttons */
--color-action-primary-hover
--color-action-secondary   /* Secondary buttons */
--color-success            /* Success states */
--color-warning            /* Warning states */
--color-error              /* Error states */
--color-info               /* Information states */
```

### Palette Variables (Define Once, Reference Above)
```css
/* Raw palette - only used to define semantic variables */
--palette-brand-500        /* Main brand color */
--palette-brand-600        /* Darker brand */
--palette-brand-400        /* Lighter brand */
--palette-neutral-900      /* Darkest neutral */
--palette-neutral-100      /* Lightest neutral */
/* etc. */
```

---

## Migration Strategy

### Phase 1: Audit & Categorize
- [x] Complete color audit (done - 2,805 colors found)
- [ ] Categorize each color by semantic purpose
- [ ] Create mapping from hardcoded → semantic variable

### Phase 2: Define Variables
- [ ] Define complete semantic variable set in `index.css`
- [ ] Add Tailwind custom colors in `tailwind.config.ts`
- [ ] Create TypeScript constants for JS usage

### Phase 3: Migrate Critical Files (High Impact)
Priority order:
1. `AnalyticsPage.tsx` - Dashboard visibility
2. `QuestionCard.tsx` - 95 colors, survey-taking experience
3. `DesignV2.tsx` - 211 colors, design system showcase
4. `LegacyAnalyticsPage.tsx` - 64 colors
5. `AIInsightsCard.tsx` - 18 colors

### Phase 4: Migrate Remaining Files
- Component files (50+ files)
- Page files (20+ files)
- Utility/config files

### Phase 5: Cleanup
- Remove unused `theme.ts` hex values
- Remove `colors.ts` duplicate definitions
- Update `buttons.ts` and `cards.ts` to use variables

---

## Tailwind Integration

### Option A: Custom Colors in tailwind.config.ts
```typescript
colors: {
  brand: {
    DEFAULT: 'var(--color-action-primary)',
    hover: 'var(--color-action-primary-hover)',
  },
  surface: 'var(--color-bg-card)',
  // etc.
}
```

### Option B: Arbitrary Values (Current Approach)
```tsx
// Current: text-[var(--color-text-primary)]
// This works but is verbose
```

**Recommendation:** Use Option A for cleaner code

---

## Color Decision Required

Before proceeding, you need to decide on the **actual color palette**:

### Current Palette (index.css)
- Primary: `#2F8FA5` (Blue-teal)
- Accent: `#A3D65C` (Lime green)
- Navy: `#0D1B2A` (Sidebar)

### Alternative 1: Coral/Teal Warm (Was Implemented)
- Primary: `#F04C5D` (Coral)
- Secondary: `#1B9B82` (Teal)
- Paper backgrounds

### Alternative 2: Lattice Forest Green (User Provided)
- Forest: `#1A3D34` (Primary)
- Sage: `#3D7A5C` (Secondary)
- Mint: `#7CB89B` (Accent)
- Seafoam: `#BADCC8` (Light)

**Action:** Pick one palette, then all variables will reference that palette.

---

## File-by-File Transformation Example

### Before (QuestionCard.tsx)
```tsx
<div style={{ backgroundColor: '#F7F9FC' }}>
  <span className="text-blue-500">Text</span>
  <button style={{ color: '#1F6F78' }}>Click</button>
</div>
```

### After (QuestionCard.tsx)
```tsx
<div className="bg-surface">
  <span className="text-action-primary">Text</span>
  <button className="text-action-primary">Click</button>
</div>
```

Or with CSS variables directly:
```tsx
<div style={{ backgroundColor: 'var(--color-bg-card)' }}>
  <span style={{ color: 'var(--color-action-primary)' }}>Text</span>
</div>
```

---

## Estimated Effort

| Phase | Files | Estimated Changes |
|-------|-------|-------------------|
| Phase 2 (Variables) | 3 | ~100 lines |
| Phase 3 (Critical) | 5 | ~400 replacements |
| Phase 4 (Remaining) | 125 | ~2,000 replacements |
| Phase 5 (Cleanup) | 5 | ~50 deletions |

**Total:** ~2,550 changes across ~138 files

---

## Next Steps

1. **Decide on color palette** (current, coral/teal, or forest green)
2. **Create semantic variable mapping** (I can do this once palette is chosen)
3. **Begin Phase 3 migration** of critical files
4. **Automated replacement** for common patterns

---

## Questions for You

1. Which color palette do you want to use?
2. Should Tailwind custom colors mirror CSS variables?
3. Are there any colors that should remain hardcoded (e.g., chart gradients)?

---

## Files to EXCLUDE from Color Migration

**DO NOT update hardcoded colors in these files - they are intentional:**

### Design Builder / Theme Customization
- `DesignV2.tsx` - COLOR_PRESETS, theme palettes, color pickers
- `surveyBackgrounds.ts` - Background image/color options for surveys
- `WelcomePageEditor.tsx` - Survey welcome screen theming
- `theme.ts` - Theme definition file (reference, not hardcoded usage)

**Reason:** These files define the *configurable* theme options that users can select for their surveys. The hardcoded hex values represent the preset palettes and customization options, NOT the Evalia app's own design system.

### Chart Colors (Recharts)
Chart libraries require hex values (CSS variables don't work in SVG). Keep hex values but add comments documenting the CSS variable equivalent:
```tsx
// Chart colors - hex required for Recharts SVG
// Maps to CSS variables: --band-critical, --dimension-engagement, etc.
const CHART_COLORS = ['#B91C1C', '#2D6A4F'];
```
