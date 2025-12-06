# Ticket ANAL-009: Before/After Index Comparison

> **Status:** Completed  
> **Phase:** Analytics Core  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Goal

Add a "Before/After Index Comparison" analytics module to the AnalyticsPage under the Trends tab. This allows users to compare Insight Dimension scores between two specific scoring versions (e.g., before and after an intervention).

---

## In Scope (Allowed)

### Backend
- `server/utils/analytics.ts`: Add `computeBeforeAfterIndexComparison()` function
- `server/routes/analytics.ts`: Wire route handler for `BEFORE_AFTER_INDEX_COMPARISON` metric

### Shared Types
- `shared/analytics.ts`: Add `BeforeAfterIndexComparisonData`, `BeforeAfterIndexComparisonResponse` types

### Frontend
- `client/src/components/analytics/useBeforeAfterComparison.ts`: New data fetching hook
- `client/src/components/analytics/BeforeAfterComparisonChart.tsx`: New visualization component
- `client/src/components/analytics/index.ts`: Export new hook and component
- `client/src/pages/AnalyticsPage.tsx`: Replace placeholder with real component

### Documentation
- `docs/BUILD_LOG.md`: Update with ANAL-009 implementation
- `docs/tickets/ANAL-009-before-after-comparison.md`: This ticket file

---

## Out of Scope (Forbidden)

🚫 **Do NOT modify:**
- Scoring engine logic
- Database schema
- Existing metric IDs (this is a new metric only)
- Other analytics components (unless wiring exports)

---

## Technical Specification

### Backend: `computeBeforeAfterIndexComparison()`

**Input:**
- `surveyId: string`
- `versionBefore: string` - Scoring version ID for "before" period
- `versionAfter: string` - Scoring version ID for "after" period

**Output:**
```typescript
interface BeforeAfterIndexComparisonData {
  versionBefore: {
    id: string;
    label: string;
    versionNumber: number;
    date: string;
    responseCount: number;
  };
  versionAfter: {
    id: string;
    label: string;
    versionNumber: number;
    date: string;
    responseCount: number;
  };
  comparison: {
    dimensionId: string;
    dimensionLabel: string;
    scoreBefore: number | null;
    scoreAfter: number | null;
    change: number | null;
    changePercent: number | null;
    trend: 'up' | 'down' | 'neutral';
  }[];
  summary: {
    totalDimensionsImproved: number;
    totalDimensionsDeclined: number;
    totalDimensionsStable: number;
    overallTrend: 'positive' | 'negative' | 'mixed' | 'stable';
  };
}
```

**Logic:**
1. Fetch responses for `versionBefore` and calculate average scores for all 5 dimensions
2. Fetch responses for `versionAfter` and calculate average scores for all 5 dimensions
3. Compute difference (`scoreAfter - scoreBefore`) and percentage change
4. Determine trend per dimension: `up` if change > 1, `down` if change < -1, else `neutral`
5. Compute summary counts

### API Route

**Endpoint:** `GET /api/analytics/:surveyId/before_after_index_comparison?versionBefore=...&versionAfter=...`

**Response:**
```typescript
{
  meta: AnalyticsMeta;
  data: BeforeAfterIndexComparisonData;
}
```

### Frontend Hook: `useBeforeAfterComparison`

**Input:**
- `surveyId: string | undefined`
- `versionBefore?: string`
- `versionAfter?: string`
- `enabled?: boolean`

**Returns:**
- `data: BeforeAfterIndexComparisonResponse | undefined`
- `isLoading: boolean`
- `error: Error | null`
- `refetch: () => void`

### Frontend Component: `BeforeAfterComparisonChart`

**Props:**
- `data: BeforeAfterIndexComparisonData | undefined`
- `isLoading: boolean`
- `error: Error | null`
- `onRetry: () => void`
- `onVersionChange?: (versionBefore: string, versionAfter: string) => void`
- `availableVersions?: Version[]`
- `title?: string`
- `description?: string`

**Features:**
- Version selector dropdowns for "Before" and "After"
- Grouped bar chart showing before/after scores per dimension
- Change indicators (+X.X or -X.X) with color coding
- Summary card showing overall trend
- Loading, error, and empty states
- Warning if fewer than 2 versions available

---

## Acceptance Criteria

- [x] Backend computes correct before/after comparison
- [x] API returns valid response shape
- [x] Frontend displays version selectors
- [x] Frontend displays comparison chart
- [x] Change values calculated correctly
- [x] Trend indicators show correct direction
- [x] Works with version selector (filters by selected versions)
- [x] Handles edge cases (missing data, single version)
- [x] No TypeScript or runtime errors
- [x] BUILD_LOG.md updated

---

## Related Tickets

- **ANAL-008**: Dimension Trends (predecessor - shows trends over time)
- **ANAL-004**: Index Distribution (pattern reference)
- **ANAL-005**: Band Distribution (pattern reference)

---

**End of Ticket**

