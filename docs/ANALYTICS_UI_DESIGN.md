# Analytics UI Design Specification

> **Status:** Draft - Pending Review  
> **Last Updated:** 2025-12-06  
> **Purpose:** Define the visual design, layout, and component structure for the analytics dashboard rebuild

---

## Design Principles

1. **Consistency with Builder V2**
   - Match spacing, typography, and color palette
   - Use same panel widths (280px/320px) where applicable
   - Understated, minimal aesthetic (not "AI-built" look)

2. **Card-Based Layout**
   - Each metric/chart in its own card
   - Consistent card styling: `rounded-xl`, subtle shadows
   - Responsive grid system

3. **Version-Aware by Default**
   - All analytics respect score config versions
   - Version selector when multiple versions exist
   - Historical data remains stable

4. **Progressive Disclosure**
   - Overview → Details → Drill-down
   - Tabs for major sections
   - Expandable sections for deeper analysis

---

## Page Structure

### Analytics Page (`/analytics/:id`)

```
┌─────────────────────────────────────────────────────────┐
│ Header: Survey Title, Description, Export Buttons        │
├─────────────────────────────────────────────────────────┤
│ Tab Navigation: Overview | Participation | Categories |  │
│                        Questions | Comments | Export     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Participation Metrics Card (4 metrics)           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Score        │  │ Band         │  │ Response     │  │
│  │ Distribution │  │ Distribution │  │ Trend        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Question Summary Table                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Component Library Structure

### Base Components (BUILD-020)

#### `<MetricStatCard />`
- **Props:** `label`, `value`, `trend?`, `icon?`, `subtext?`
- **Usage:** Single metric with optional trend indicator
- **Styling:** Matches existing `StatCard` pattern

#### `<BarChart />`
- **Props:** `data`, `xKey`, `yKey`, `color?`, `loading?`, `error?`
- **Usage:** Horizontal/vertical bar charts
- **Library:** Recharts or Chart.js

#### `<LineChart />`
- **Props:** `data`, `xKey`, `yKey`, `color?`, `loading?`, `error?`
- **Usage:** Time series, trends
- **Library:** Recharts or Chart.js

#### `<DonutChart />`
- **Props:** `data`, `labelKey`, `valueKey`, `colors?`, `loading?`, `error?`
- **Usage:** Band distribution, category breakdowns
- **Library:** Recharts or Chart.js

---

## Feature-Specific Components

### Participation Metrics Card (ANAL-001)
- **Layout:** 4-column grid (responsive: 1 col mobile, 2 col tablet, 4 col desktop)
- **Metrics:**
  1. Total Responses
  2. Response Rate % (or "N/A" if invites not available)
  3. Completion Rate %
  4. Avg Completion Time
- **Styling:** Card with 4 metric items inside
- **States:** Loading skeleton, error state with retry

### Score Distribution Chart (ANAL-004)
- **Layout:** Full-width card
- **Chart Type:** Bar chart (horizontal or vertical)
- **Data:** Overall score buckets (0-20, 21-40, etc.) + category breakdown
- **Version Selector:** Dropdown if multiple versions exist

### Band Distribution Chart (ANAL-005)
- **Layout:** Card (can be side-by-side with score distribution)
- **Chart Type:** Donut chart
- **Data:** Count/percentage per band
- **Colors:** Match band colors from survey config
- **Version Selector:** Dropdown if multiple versions exist

### Question Summary Table (ANAL-006)
- **Layout:** Full-width card with table
- **Columns:** Question #, Question Text, Completion Rate, Avg Value, Distribution
- **Features:** Sortable, filterable by question type
- **Responsive:** Horizontal scroll on mobile

---

## Color Palette

- **Primary:** `#2F8FA5` (teal) - matches builder
- **Success/Positive:** `#10B981` (emerald)
- **Warning:** `#F59E0B` (amber)
- **Error:** `#EF4444` (red)
- **Neutral:** Gray scale (`#F9FAFB` to `#111827`)
- **Bands:** Use colors from `scoreConfig.scoreRanges[].color`

---

## Typography

- **Page Title:** `text-2xl font-bold text-gray-900`
- **Section Headers:** `text-lg font-semibold text-gray-900`
- **Metric Labels:** `text-xs font-medium text-gray-500 uppercase tracking-wider`
- **Metric Values:** `text-2xl font-bold text-gray-900` (or `text-3xl` for large)
- **Body Text:** `text-sm text-gray-600`

---

## Spacing

- **Page Padding:** `px-4 py-6` (mobile) → `px-6 py-8` (desktop)
- **Card Gap:** `gap-4` (mobile) → `gap-6` (desktop)
- **Card Padding:** `p-5` or `p-6`
- **Section Spacing:** `space-y-6`

---

## Responsive Breakpoints

- **Mobile:** `< 768px` - Single column, stacked cards
- **Tablet:** `768px - 1024px` - 2-column grid
- **Desktop:** `> 1024px` - 3-4 column grid

---

## Loading & Error States

### Loading
- Skeleton screens matching final layout
- Shimmer animation
- Preserve card structure

### Error
- Icon (AlertCircle)
- Error message
- Retry button
- Don't break page layout

---

## Version Selector

When multiple score config versions exist:
- Dropdown in header or card
- Label: "Score Config Version"
- Options: "Latest (v2)" or "v1", "v2", etc.
- Default: Latest version
- Updates all version-aware charts/tables

---

## Questions for Review

1. **Tab Structure:** Keep current tabs (Overview, Questions, Responses, Insights) or reorganize?
2. **Filter Sidebar:** Left panel (like Builder) or top bar?
3. **Chart Library:** Recharts (React-native) or Chart.js (more features)?
4. **Mobile Priority:** Mobile-first or desktop-first?
5. **Export Location:** Header buttons or separate Export tab?

---

## Next Steps

1. ✅ Review this spec
2. 🔲 Create wireframes/mockups (Figma or ASCII)
3. 🔲 Finalize component library structure (BUILD-020)
4. 🔲 Build base components first
5. 🔲 Then build feature components (ANAL-001, ANAL-004, etc.)

