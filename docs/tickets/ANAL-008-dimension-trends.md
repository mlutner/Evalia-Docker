# Ticket ANAL-008: Dimension Trends (Index Trend Over Time)

> **Status:** Complete ✅ TESTED  
> **Phase:** Analytics  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Intent

Add a "Dimension Trends" analytics module to the AnalyticsPage Trends tab. Shows how Insight Dimension scores have changed over time across different scoring versions.

---

## In Scope (Allowed)

### Backend
- Add new metric ID: `INDEX_TRENDS_SUMMARY` to `shared/analytics.ts`
- Add computation function: `computeIndexTrendsSummary(surveyId)` to `server/utils/analytics.ts`
- Add route handler in `server/routes/analytics.ts`
- Query all score_config_versions and compute average scores per version

### Shared Types
- `IndexTrendsSummaryData` interface
- `IndexTrendPoint` interface (version, date, scores by index)
- Add to `METRIC_IDS` and `METRIC_TYPE_MAP`

### Frontend
- Create hook: `useIndexTrendsSummary()`
- Create component: `DimensionTrendsChart`
  - Line chart showing index scores over time/versions
  - Multiple lines for each index type
  - Tooltip with version details
- Integrate into AnalyticsPage Trends tab

---

## Out of Scope (Forbidden)

- Trend predictions/forecasting
- Manager-level trends (future ticket)
- Real-time trend updates
- Core scoring engine changes

---

## Acceptance Criteria

- [ ] Trends tab renders a line chart showing index trends
- [ ] Each index type has its own line
- [ ] X-axis shows version labels/dates
- [ ] Y-axis shows score (0-100)
- [ ] Handles surveys with only 1 version (show single point)
- [ ] Empty state for surveys with no scored responses
- [ ] API returns 200 and matches shared types
- [ ] No client or server console errors

---

## Technical Notes

### Data Source
- Query `score_config_versions` table for all versions
- For each version, calculate average index scores across all responses
- Return array of trend points sorted by version date

### Response Shape

```typescript
interface IndexTrendPoint {
  versionId: string;
  versionLabel: string;
  versionDate: string;
  scores: {
    leadershipEffectiveness: number | null;
    teamWellbeing: number | null;
    burnoutRisk: number | null;
    psychologicalSafety: number | null;
    engagement: number | null;
  };
  responseCount: number;
}

interface IndexTrendsSummaryData {
  trends: IndexTrendPoint[];
  totalVersions: number;
}
```

---

## Required Files to Modify

1. `shared/analytics.ts` - Add types and METRIC_ID
2. `server/utils/analytics.ts` - Add `computeIndexTrendsSummary`
3. `server/routes/analytics.ts` - Add route handler
4. `client/src/components/analytics/useIndexTrendsSummary.ts` (new)
5. `client/src/components/analytics/DimensionTrendsChart.tsx` (new)
6. `client/src/components/analytics/index.ts` - Export new components
7. `client/src/pages/AnalyticsPage.tsx` - Integrate into Trends tab
8. `docs/BUILD_LOG.md`

---

**End of Ticket**
