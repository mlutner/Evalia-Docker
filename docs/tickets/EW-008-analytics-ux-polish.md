# EW-008: Analytics UX Polish Ticket

## Priority: LOW
## Status: Planned
## Category: UI/UX

---

## Problem Statement

This is a sweeping UI consistency ticket (not functional). Analytics components have accumulated inconsistencies that need harmonization.

---

## Polish Areas

### 1. Consistent Number Formatting

```typescript
// Define standard formatters
const formatScore = (n: number) => n.toFixed(1);      // "72.5"
const formatPercent = (n: number) => `${n.toFixed(0)}%`; // "72%"
const formatCount = (n: number) => n.toLocaleString();   // "1,234"
```

**Issues to fix:**
- Score displays vary (1 decimal, 2 decimals, whole numbers)
- Percentage signs sometimes missing
- Large numbers not comma-separated

### 2. Consistent Color Scale Rules

```typescript
// Band colors (consistent across all charts)
const BAND_COLORS = {
  thriving: "#22c55e",   // green-500
  performing: "#84cc16", // lime-500
  developing: "#eab308", // yellow-500
  emerging: "#f97316",   // orange-500
  struggling: "#ef4444"  // red-500
};
```

**Issues to fix:**
- Different greens/reds in different components
- Opacity inconsistencies
- Dark mode color adjustments

### 3. Trend Arrows Visual Polish

- Consistent size (16px)
- Consistent colors (green up, red down, gray neutral)
- Animation on change
- Accessibility labels

### 4. Mini Progress Bar Normalizations

- Consistent height (6px)
- Consistent border radius (3px)
- Consistent background color
- Smooth animation on load

### 5. Loading + Empty State Styling

- Skeleton loaders match content shape
- Empty states have icon + message
- Consistent messaging tone
- Link to relevant action

---

## Component Audit

| Component | Number Format | Colors | Loading | Empty |
|-----------|--------------|--------|---------|-------|
| MetricStatCard | ⚠️ | ✅ | ⚠️ | ✅ |
| CategoryScoreCard | ⚠️ | ⚠️ | ✅ | ✅ |
| TrendLineChart | ✅ | ⚠️ | ⚠️ | ⚠️ |
| IndexDistributionChart | ⚠️ | ✅ | ✅ | ⚠️ |
| DimensionLeaderboard | ✅ | ⚠️ | ⚠️ | ✅ |

---

## Acceptance Criteria

- [ ] All scores show consistent decimal places
- [ ] All percentages include % symbol
- [ ] All band colors from single source
- [ ] All trend arrows match design spec
- [ ] All progress bars match design spec
- [ ] All loading states use skeletons
- [ ] All empty states have helpful messages
- [ ] Visual regression tests pass

---

## Implementation Notes

### Files to Create/Modify
- `client/src/utils/formatters.ts` - Number formatters
- `client/src/styles/analytics.css` - Shared styles
- `client/src/components/analytics/*.tsx` - Apply consistency

### Design System
- Extract to design tokens where possible
- Document in Storybook (if available)

---

## Related Tickets
- ANAL-IA-001: Unified Analytics IA
- ANAL-DASH-020: Basic Analytics Dashboard

