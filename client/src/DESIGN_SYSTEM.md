# EVALIA DESIGN SYSTEM

## 🎨 Complete Design System Documentation

### Core Files
- `index.css` - All CSS variables (colors, borders, buttons)
- `theme.ts` - Centralized theme object with all design tokens
- `cards.ts` - 3 card type definitions with helper functions
- `buttons.ts` - 3 button type definitions with helper functions
- `colors.ts` - Color palette reference

---

## 📦 3-CARD SYSTEM

### Card Type A: Standard Card (80% usage)
**Use for:** dashboards, surveys grid, templates, scoring, analytics

```
Background: #FFFFFF
Border: #E2E7EF
Text Primary: #1C3B5A
Text Secondary: #6A7789
Border Radius: 12px
Padding: 24px
Shadow: 0 1px 2px rgba(0, 0, 0, 0.04)
```

**Import & Use:**
```tsx
import { CardSystem, getCardStyle } from '@/cards';

<Card style={getCardStyle('standard')} />
// Or use className:
<Card className={CardSystem.standard.className} />
```

---

### Card Type B: Highlight Card (Call Attention - Use Sparingly)

#### Lime Variant (for positive/highlights)
```
Background: #F3FDE3
Border: #D9F55E
Icon Color: #C3F33C
```

#### Teal Variant (for informational)
```
Background: #E1F6F3
Border: #A8E8E1
Icon Color: #37C0A3
```

**Use for:** AI Insights, Alerts, Important data points, Empty states, CTAs

**Import & Use:**
```tsx
import { CardSystem, getCardStyle } from '@/cards';

<Card style={getCardStyle('highlightLime')} />
<Card style={getCardStyle('highlightTeal')} />
```

---

### Card Type C: Dark Card (Rare - 1-2 places max)

**Use for:** Premium sections, Differentiated content, Onboarding, Illustration-driven areas

```
Background: #0A1A2F
Text: #FFFFFF
Accent: Lime (#C3F33C) or Teal (#37C0A3)
Shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
```

**Import & Use:**
```tsx
import { CardSystem, getCardStyle } from '@/cards';

<Card style={getCardStyle('dark')} />
```

---

## 🔘 3-BUTTON SYSTEM

### Button Type 1: Primary Button (Action Buttons)

#### Option A: Teal-First (DEFAULT - Enterprise SaaS feel)
```
Background: #1F6F78
Text: #FFFFFF
Hover: #155A62
Active: #0F4A51
```

#### Option B: Lime-First (Modern/Energetic feel)
```
Background: #C3F33C
Text: #0A1A2F (Navy)
Hover: #A8D92F
Active: #8FBF2A
```

**Use for:** "New Survey", "Analyze Survey", "Start", "Publish"

**Import & Use:**
```tsx
import { ButtonSystem, getButtonClass } from '@/buttons';

// Default Teal
<Button className={ButtonSystem.primaryTeal.className}>
  New Survey
</Button>

// Or use Lime variant
<Button className={ButtonSystem.primaryLime.className}>
  New Survey
</Button>
```

---

### Button Type 2: Secondary Button (Lower Hierarchy)

```
Background: #FFFFFF
Border: #E2E7EF
Text: #1C3B5A
Hover: #F7F9FC (slight gray tint)
```

**Use for:** "Edit Survey", "Preview", "Manage Responses"

**Import & Use:**
```tsx
import { ButtonSystem } from '@/buttons';

<Button className={ButtonSystem.secondary.className}>
  Edit Survey
</Button>
```

---

### Button Type 3: Ghost Button (Minimal)

```
Background: transparent
Text: #2F8FA5 (Teal)
Hover: Underline
```

**Use for:** Inline actions, "Learn more", toggles

**Import & Use:**
```tsx
import { ButtonSystem } from '@/buttons';

<Button className={ButtonSystem.ghost.className}>
  Learn More
</Button>
```

---

## 🎨 COMPLETE COLOR PALETTE

### Primary Colors
- **Teal (Primary):** #2F8FA5
- **Lime (Accent):** #A3D65C
- **Navy (Sidebar):** #0D1B2A

### Backgrounds
- **Page BG:** #F7F9FC
- **Card Surface:** #FFFFFF
- **Highlight Lime:** #F3FDE3
- **Highlight Teal:** #E1F6F3
- **Dark Card:** #0A1A2F

### Text
- **Primary Text:** #1C2635
- **Secondary Text:** #6A7789

### Borders
- **Standard Border:** #E2E7EF
- **Highlight Lime Border:** #D9F55E
- **Highlight Teal Border:** #A8E8E1

### Icon Colors (for highlights)
- **Lime Icon:** #C3F33C
- **Teal Icon:** #37C0A3

---

## 📝 DESIGN PRINCIPLES

1. **Centralized** - All colors/styles defined in ONE place (index.css)
2. **Minimal** - 3 cards, 3 buttons, 1 main palette
3. **Hierarchy** - Use cards and buttons strategically to guide user attention
4. **Consistency** - No custom colors or one-off styles
5. **Updateable** - Change global brand colors by editing ONE file (index.css)

---

---

## 🎯 INTERACTION STATES

### Hover States
Light background tint of the accent color for subtle feedback

**Teal Hover:** #E1F6F3  
**Lime Hover:** #F3FDE3

```tsx
import { InteractionStates } from '@/interactions';

// Use on any element that needs hover feedback
<div className={InteractionStates.hover.teal.className}>
  Content
</div>
```

### Active/Click State
Slight darkening or inset shadow for press feedback

```tsx
<button className={InteractionStates.active.teal.className}>
  Press me
</button>
```

### Disabled State
```
Background: #F0F2F5
Text: #B0B8C2
Opacity: 60%
Cursor: not-allowed
```

```tsx
import { getDisabledClass } from '@/interactions';

<button className={getDisabledClass()} disabled>
  Disabled Button
</button>
```

---

## 🧭 SIDEBAR DESIGN STRATEGY

### Sidebar Structure
```
Background: Navy #0A1A2F
```

### Sidebar Items

**Inactive:**
- Text: white @ 70% opacity
- Background: transparent
- Icon: white @ 70% opacity

**Hover:**
- Background: #112238 (subtle lighter navy)
- Text: white @ 100%
- Icon: white @ 100%
- Transition: 150ms ease-in-out

**Active:**
- Text: white @ 100%
- Left indicator: Lime bar (#A3D65C) - 4px wide, rounded right corners
- Background: transparent
- Icon: white @ 100%

```tsx
import { getSidebarItemClass } from '@/interactions';

<button className={getSidebarItemClass(isActive)} data-active={isActive}>
  <Icon />
  <span>Menu Item</span>
</button>
```

### CSS Classes for Sidebar Items
```css
.sidebar-item               /* base styles */
.sidebar-item:hover         /* hover state */
.sidebar-item.active        /* active state */
.sidebar-item.active::before /* lime indicator bar */
```

---

## 🚀 USAGE CHECKLIST

- [ ] Replace all hardcoded colors with theme.ts variables
- [ ] Use CardSystem for all card styles
- [ ] Use ButtonSystem for all button styles
- [ ] Use InteractionStates for hover/active/disabled states
- [ ] Use getSidebarItemClass for sidebar navigation items
- [ ] No custom card/button/sidebar variants allowed
- [ ] Update index.css when changing brand colors globally
- [ ] Import from theme.ts, cards.ts, buttons.ts, interactions.ts instead of creating new styles
