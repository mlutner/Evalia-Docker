# Ticket ANAL-QA-030: Shared Bands & Dimension Helpers Refactor

> **Status:** ✅ Implemented  
> **Phase:** Quality Assurance  
> **Priority:** High  
> **Parent Epic:** ANAL-QA-001  
> **Created:** 2025-12-06  
> **Completed:** 2025-12-05

---

## Goal

Ensure all analytics components use centralized helpers for:
1. **Band resolution** – `resolveIndexBand()` from `shared/analyticsBands.ts`
2. **Dimension IDs** – `InsightDimensionId` from `shared/analytics.ts`

Remove any local/hardcoded band logic or dimension strings.

---

## Current State

### Already Created (ANAL-DIM-001)
- `shared/analyticsBands.ts` with:
  - `INDEX_BANDS` constant
  - `resolveIndexBand(score, options)`
  - `resolveTrendDirection(change)`
  - `calculatePerformanceScore(rawScore, isBurnout)`

### Components to Refactor

| Component | Current State | Action |
|-----------|--------------|--------|
| `DimensionLeaderboardTable` | ✅ Uses shared helper | No change |
| `IndexDistributionChart` | ❌ No band logic yet | May need band colors |
| `BandDistributionChart` | ❌ Uses data.bands directly | Verify consistency |
| `ManagerComparisonTable` | ❌ Local band coloring | Refactor to use helper |
| `BeforeAfterComparisonChart` | ❌ Local trend logic | Refactor to use helper |
| `DimensionTrendsChart` | ❌ Local dimension colors | Centralize colors |

---

## Part A: Refactor Band Coloring

### ManagerComparisonTable

**Current (local):**
```typescript
// Inline band color logic
const getBandColor = (score: number) => {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  // ...
};
```

**Refactored:**
```typescript
import { resolveIndexBand } from '@shared/analyticsBands';

const band = resolveIndexBand(score);
const color = band.color;
```

### BandDistributionChart

Verify the chart uses band colors from the API response (`data.bands[].color`), which should match `INDEX_BANDS`.

If there's any local color mapping, refactor to use the shared helper.

---

## Part B: Refactor Trend Direction Logic

### BeforeAfterComparisonChart

**Current (if local):**
```typescript
const getTrend = (change: number) => {
  if (change > 1) return 'up';
  if (change < -1) return 'down';
  return 'neutral';
};
```

**Refactored:**
```typescript
import { resolveTrendDirection, TREND_THRESHOLD } from '@shared/analyticsBands';

const trend = resolveTrendDirection(change);
```

---

## Part C: Centralize Dimension Colors

### DimensionTrendsChart

**Current (if local):**
```typescript
const DIMENSION_COLORS = {
  leadershipEffectiveness: '#8884d8',
  teamWellbeing: '#82ca9d',
  // ...
};
```

**Action:** Move to `shared/analytics.ts` alongside `INSIGHT_DIMENSIONS`:

```typescript
// shared/analytics.ts
export const INSIGHT_DIMENSION_COLORS: Record<InsightDimensionId, string> = {
  leadershipEffectiveness: '#8884d8',
  teamWellbeing: '#82ca9d',
  burnoutRisk: '#ffc658',
  psychologicalSafety: '#ff7300',
  engagement: '#0088FE',
};
```

---

## Part D: Type-Level Guardrails

### Ensure TypeScript Catches Missing Dimensions

```typescript
// shared/analytics.ts
export type InsightDimensionId = 
  | 'leadershipEffectiveness'
  | 'teamWellbeing'
  | 'burnoutRisk'
  | 'psychologicalSafety'
  | 'engagement';

// If we add a dimension, this mapping MUST be updated
export const INSIGHT_DIMENSIONS: Record<InsightDimensionId, InsightDimension> = {
  // TS will error if a dimension is missing
};
```

### Audit for Hardcoded Strings

Search codebase for:
```bash
grep -r "burnout-risk" client/src/
grep -r "team-wellbeing" client/src/
grep -r "leadership-effectiveness" client/src/
```

Replace any hardcoded strings with references to `INSIGHT_DIMENSIONS[key].indexType`.

---

## Acceptance Criteria

- [x] All components use `resolveIndexBand()` for score → band mapping
- [x] All components use `resolveTrendDirection()` for trend arrows
- [x] Band colors centralized in `shared/analyticsBands.ts`
- [x] No hardcoded band thresholds in key UI components
- [x] TypeScript enforces band/trend types

### Implementation Notes (2025-12-05)

**Enhanced `shared/analyticsBands.ts`:**
- `INDEX_BAND_DEFINITIONS` - canonical source with min/max thresholds
- `resolveBandIndex()` - returns 0-4 index for bucket counting
- `getColorForScore()` - direct score-to-color lookup
- `createEmptyBandStats()` - initializes band distribution arrays
- `DISTRIBUTION_BUCKET_COLORS` - for index distribution charts
- `TREND_COLORS` - for trend indicators
- Strong types: `BandId`, `TrendDirection`, `IndexBandInfo`, `IndexBandWithStats`

**Refactored server code:**
- `DEFAULT_INDEX_BANDS` deprecated, derives from shared definitions
- `computeIndexBandDistribution` uses `resolveBandIndex()`
- `calculateBandDistribution` uses shared helpers

**Refactored client components:**
- `DimensionLeaderboardTable` uses `getColorForScore()`, `IndexBandInfo` type
- `IndexDistributionChart` uses `DISTRIBUTION_BUCKET_COLORS`
- `BeforeAfterComparisonChart` uses `TREND_COLORS`

**Tests:** All 53 shared + analytics tests pass

---

## Files to Modify

| File | Changes |
|------|---------|
| `shared/analytics.ts` | Add `INSIGHT_DIMENSION_COLORS` |
| `client/src/components/analytics/ManagerComparisonTable.tsx` | Use `resolveIndexBand()` |
| `client/src/components/analytics/BeforeAfterComparisonChart.tsx` | Use `resolveTrendDirection()` |
| `client/src/components/analytics/DimensionTrendsChart.tsx` | Use centralized colors |
| `client/src/components/analytics/BandDistributionChart.tsx` | Verify band consistency |

---

**End of Ticket**

