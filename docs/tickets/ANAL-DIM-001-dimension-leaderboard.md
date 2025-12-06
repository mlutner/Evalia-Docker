# Ticket ANAL-DIM-001: Dimension Leaderboard Table

> **Status:** Completed  
> **Phase:** Analytics UI  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Goal

Add a "Dimension Leaderboard" table to the Dimensions tab showing all 5 Insight Dimensions ranked by performance score. Gives users an instant overview of organizational strengths and weaknesses.

---

## In Scope (Allowed)

### Shared Code
- `shared/analyticsBands.ts`: New shared band resolution helper

### Frontend
- `client/src/components/analytics/DimensionLeaderboardTable.tsx`: New component
- `client/src/components/analytics/index.ts`: Add export
- `client/src/pages/AnalyticsPage.tsx`: Wire into Dimensions tab

### Documentation
- `docs/BUILD_LOG.md`: Update with implementation
- `docs/tickets/ANAL-DIM-001-dimension-leaderboard.md`: This ticket file

---

## Out of Scope (Forbidden)

🚫 **Do NOT modify:**
- Backend analytics computation
- Database schema
- Existing metric IDs
- Other analytics components (unless adding exports)

---

## Technical Specification

### 1. Version Handling

**Rule:**
- If `selectedVersionId` is provided → use that version's scores from trends data
- If `selectedVersionId` is undefined → use the last (most recent) version

### 2. Ranking Logic

**Performance Score Definition:**
```typescript
// For all dimensions except burnout:
performanceScore = rawScore

// For burnout risk (lower raw score = better performance):
performanceScore = 100 - rawScore
```

**Ranking:**
- Sort by `performanceScore` descending
- Rank 1 = best performing dimension
- Tie-breaker: alphabetical by label

### 3. Band Resolution

**Shared Helper:** `shared/analyticsBands.ts`

```typescript
export function resolveIndexBand(
  score: number | null,
  options?: { usePerformanceScore?: boolean; isBurnout?: boolean }
): IndexBand;

export function resolveTrendDirection(change: number | null): 'up' | 'down' | 'neutral';

export function calculatePerformanceScore(rawScore: number | null, isBurnout: boolean): number;
```

### 4. Change Calculation

**Definition:**
```
change = currentVersionScore - previousVersionScore
```

**Rules:**
- Previous version = version immediately before current in trends array
- If no previous version → `change = null` → display "—"
- Trend threshold: ±1 point (same as ANAL-009)

### 5. Component Props

```typescript
interface DimensionLeaderboardTableProps {
  data: IndexTrendsSummaryData | undefined;
  selectedVersionId?: string;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}
```

### 6. Table Columns

| Column | Content |
|--------|---------|
| # | Rank (1-5), 🏆 for #1, ⚠️ for #5 |
| Dimension | Short label from INSIGHT_DIMENSIONS |
| Score | Raw score with band color badge |
| Band | Band label with color |
| Change | `+X.X ↑` / `-X.X ↓` / `—` |
| Performance | Mini progress bar using performanceScore |

---

## Acceptance Criteria

- [x] Leaderboard shows all 5 dimensions ranked by performance
- [x] Version selector integration working
- [x] Burnout Risk handled correctly (inverted performance score)
- [x] Change indicators show vs previous version
- [x] Band colors match scoring system
- [x] Shared band helper created (no hardcoding in component)
- [x] No TypeScript or runtime errors
- [x] BUILD_LOG.md updated

---

## Related Tickets

- **ANAL-008**: Dimension Trends (data source)
- **ANAL-IA-001**: Information Architecture (tab structure)

---

**End of Ticket**

