# Evalia Design System - Official

## Brand Identity
**Evalia** is a professional survey analytics platform designed for trainers and educators. The design system emphasizes clarity, professionalism, and trustworthiness through a carefully curated palette of teals, limes, and neutrals.

## Evalia Color Palette

### Primary Colors
- **Primary Teal (#2F8FA5)**: Core brand color. Used for primary buttons, links, accents, and active states
- **Dark Teal (#1F6F78)**: Darker teal for emphasis, chart primary data, and CTA buttons  
- **Icon Teal (#37C0A3)**: Bright, vibrant teal for icons, highlights, and secondary accents
- **Accent Lime (#A3D65C)**: Energetic lime for alerts, success states, and visual differentiation

### Neutral Colors
- **Primary Text (#1C2635)**: Main text color for headings and important content
- **Secondary Text (#6A7789)**: Muted text for descriptions, labels, and metadata
- **Light Background (#F7F9FC)**: Page and section backgrounds
- **Surface White (#FFFFFF)**: Card backgrounds and elevated surfaces
- **Borders (#E2E7EF)**: Subtle dividers and card borders

### Component-Specific Colors
- **Sidebar Navy (#0A1A2F)**: Dark background for sidebar navigation
- **Disabled State (#F0F2F5)**: Background for disabled/inactive elements
- **Success/Positive (Green)**: Charts and positive indicators
- **Warning/Attention (Lime)**: Alerts and warnings

## Typography

**Font Family**: Inter (system-ui fallback)
- Headings: Inter SemiBold (600)
- Body: Inter Regular (400)  
- UI Elements: Inter Medium (500)

**Scale**:
- Page Titles: 24-32px (font-bold)
- Section Headers: 18-20px (font-semibold)
- Card Titles: 16px (font-semibold)
- Body Text: 13-14px (font-regular)
- Labels/Metadata: 11-12px (font-semibold, uppercase)
- Captions: 12px (font-regular)

## Spacing System

**Consistent Spacing Values** (using Tailwind units):
- Tight: 4px (gap-1, p-1)
- Standard: 8px (gap-2, p-2)
- Default: 12px (gap-3, p-3)
- Medium: 16px (gap-4, p-4)
- Large: 24px (gap-6, p-6)
- XL: 32px (gap-8, p-8)

**Card Structure**:
- Padding: 20px (px-5, py-5)
- Header padding: 16px (pt-4, pb-3)
- Content padding: 12px (py-3)
- Footer padding: 12px (py-5)
- Gap between sections: 8-12px

## Component Standards

### Cards
- **Border Radius**: 12px (rounded-[12px])
- **Border**: 1px solid #E2E7EF
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.05)
- **Background**: #FFFFFF
- **Hover State**: Subtle elevation (box-shadow increase)
- **Padding**: 20px internal spacing

**Card Variants**:
1. **Standard Card**: White background, light border, soft shadow
2. **Insight Card**: Teal or lime left border accent (4px), neutral background
3. **KPI Card**: Colored left border (4px) matching category, icon with matching color

### Buttons
- **Primary Button**: Dark Teal (#1F6F78) text/background, white text
- **Secondary Button**: White background, border #E2E7EF, primary text
- **Ghost Button**: No background, primary text (#2F8FA5)
- **Icon Button**: 32x32px, no background, secondary text
- **Border Radius**: 8px
- **Height**: Standard 40px (h-10), Small 36px (h-9)

### Survey Cards
- **Height**: 360px (compact)
- **Title**: 16px, font-semibold
- **Spacing**: Consistent 5px padding on all sides (px-5 py-5)
- **Buttons**: Positioned at bottom with 20px top padding
- **Button Colors**: 
  - Edit: Outline style
  - Analyze: Dark Teal (#1F6F78) background

### KPI Cards  
- **Left Border**: 4px, color-coded (#2F8FA5, #37C0A3, #A3D65C)
- **Icon**: Matches border color, 24px size
- **Icon Background**: Light gray (#F7F9FA)
- **Spacing**: 24px internal padding
- **Text Hierarchy**: Label → Large Value → Subtext

### Insight Cards
- **Background**: Light neutral (#F7F9FC)
- **Left Border**: 4px, color-coded by type
- **Icon Colors**:
  - Warning: Lime (#A3D65C)
  - Info: Primary Teal (#2F8FA5)
  - Neutral: Icon Teal (#37C0A3)

### Charts
All dashboard charts use distinct colors:
1. **Response Trends**: Icon Teal (#37C0A3)
2. **Skills Ratings**: Dark Teal (#1F6F78)
3. **Distribution**: Accent Lime (#A3D65C)
4. **Response Volume**: Primary Teal (#2F8FA5)

## Layout System

**Dashboard Layout**:
- KPI Cards: 3-column grid (md:col-span-4), gap-6
- Charts: 8-column for charts, 4-column for AI Insights
- Recent Surveys: Full width table with 360px cards in grid

**Responsive Breakpoints**:
- Mobile: Single column, full-width with padding
- Tablet (md): 2-column grids, adjusted spacing
- Desktop (lg): Multi-column dashboards, standard spacing

## Consistency Rules

### Cross-Component Standards
1. **All Cards**: 12px border-radius, 1px light border, soft shadow
2. **All Text**: Use CSS variables for colors (#1C2635, #6A7789)
3. **All Spacing**: Use defined Tailwind spacing units consistently
4. **All Icons**: 18-24px size, color matching context

### DO's
✓ Use CSS variables from index.css for all colors
✓ Maintain 12px border-radius on all cards/buttons
✓ Use consistent padding: 5px (py-5) for card sections
✓ Apply 8px gaps between content sections
✓ Color-code related components (KPI cards, charts, insights)

### DON'Ts
✗ Don't use arbitrary hex colors in components (use CSS variables)
✗ Don't use different border-radius values (always 12px except 8px for buttons)
✗ Don't mix spacing inconsistently between cards
✗ Don't use outdated color palette (amber/cyan)
✗ Don't hardcode shadows - use standard 0 1px 3px rgba(0,0,0,0.05)

## Implementation Checklist

For every new component:
- [ ] Use colors from index.css CSS variables
- [ ] Apply 12px border-radius (cards) / 8px (buttons)
- [ ] Set padding: 20px (px-5 py-5) for card sections
- [ ] Use light borders (#E2E7EF) and soft shadows
- [ ] Ensure text colors are #1C2635 (primary) or #6A7789 (secondary)
- [ ] Test colors in both light and dark modes if applicable
- [ ] Match icon colors to context (border colors or category)
