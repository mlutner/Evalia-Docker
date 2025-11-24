# Evalia Color Usage Guide

## 🎨 3-Color Palette

### Navy #0D1B2A (Use Sparingly - Anchor Color)
**Uses:**
- Sidebar background
- Bold section headers
- Text when placed on lime backgrounds
- Backgrounds for illustrations
- Heavy visual anchors

**Example:**
```tsx
style={{ backgroundColor: '#0D1B2A' }} // Sidebar background
```

---

### Teal #2F8FA5 (Primary Action Color)
**Uses:**
- Primary action buttons
- Icon systems
- Chart primary data lines
- Status badges
- Data summaries
- Links and hover states

**Example:**
```tsx
// Primary button
style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}

// Chart line
style={{ stroke: '#1F6F78' }} // Darker teal for better visibility in charts

// Badge
<Badge style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}>Active</Badge>
```

---

### Lime #A3D65C (Secondary / Accent Color)
**Uses:**
- "New Survey" CTA button (strongest call-to-action)
- Highlight/success states
- Success validation messages
- Empty state cards
- Upsell / onboarding cards
- Secondary chart bars/comparisons

**Example:**
```tsx
// New Survey button - STRONGEST CTA
style={{ backgroundColor: '#C3F33C', color: '#0A1A2F' }}

// Success highlight
style={{ backgroundColor: '#F3FDE3', borderColor: '#D9F55E' }}

// Chart secondary bar
style={{ fill: '#C3F33C' }}
```

---

## 📊 Chart Colors (Specifically)

| Element | Color | Hex |
|---------|-------|-----|
| Primary Data Line/Bar | Teal | #1F6F78 |
| Secondary Comparison | Lime | #C3F33C |
| Gridlines | Light Border | #E2E7EF |
| Label Text | Secondary Text | #6A7789 |

**Chart Implementation:**
```tsx
import { theme } from '@/theme';

<LineChart>
  <Line stroke={theme.charts.primaryLine} />
  <Bar fill={theme.charts.secondaryBar} />
  <Grid stroke={theme.charts.gridlines} />
  <XAxis tick={{ fill: theme.charts.labelText }} />
</LineChart>
```

---

## 📏 Card Layout Consistency

### Every Card Must Have:

**Structure:**
```
├─ 24px padding (all sides)
├─ 12px border radius
├─ light border (#E2E7EF)
├─ 16px spacing below title
└─ 8px spacing between metadata items
```

### Typography Hierarchy in Cards:

**Title:** 15px, weight 600, primary text (#1C2635)
**Subtitle/Metadata:** 13px, weight 400, secondary text (#6A7789)
**Stats/Actions:** buttons and labels

**Example Card Structure:**
```tsx
<Card style={{
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #E2E7EF'
}}>
  <h3 style={{
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#1C2635'
  }}>
    Card Title
  </h3>
  
  <p style={{
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: '8px',
    color: '#6A7789'
  }}>
    Metadata item 1
  </p>
  
  <p style={{
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: '8px',
    color: '#6A7789'
  }}>
    Metadata item 2
  </p>
  
  <div style={{ marginTop: '16px' }}>
    {/* Actions/Buttons */}
  </div>
</Card>
```

---

## ✅ Usage Checklist

- [ ] Navy only used for sidebar, headers, text on lime, illustration backgrounds
- [ ] Teal used for primary actions, icons, chart lines, badges, data
- [ ] Lime used for CTAs, highlights, success states, empty states
- [ ] All cards use 24px padding, 12px radius
- [ ] Card titles are 15px/600 weight
- [ ] Card metadata is 13px/400 weight
- [ ] Card spacing follows 16px (titles) and 8px (metadata) rules
- [ ] Chart colors match spec: teal primary, lime secondary, gray gridlines
- [ ] No custom colors used - everything references theme or this guide

