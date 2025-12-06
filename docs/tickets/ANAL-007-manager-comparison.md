# Ticket ANAL-007: Manager Comparison (Index + Band Segmentation)

> **Status:** Complete ✅ TESTED  
> **Phase:** Analytics  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Intent

Add a "Manager Comparison" analytics module to the AnalyticsPage under the Managers tab. This is the first segmentation-based analytic and must follow the existing analytics architecture (METRIC_IDS, METRIC_TYPE_MAP, version awareness, GET /api/analytics/:surveyId/:metricId).

---

## In Scope (Allowed)

### Backend
- Add new metric ID: `MANAGER_INDEX_SUMMARY` to `shared/analytics.ts`
- Add computation function: `computeIndexSummaryByManager(surveyId, versionId)` to `server/utils/analytics.ts`
- Add route handler in `server/routes/analytics.ts`
- Must be version-aware (score_config_version_id)
- DB queries using Drizzle ORM

### Shared Types
- `ManagerIndexSummaryData` interface
- `ManagerSummaryItem` interface
- Add to `METRIC_IDS` and `METRIC_TYPE_MAP`

### Frontend
- Create hook: `useManagerIndexSummary()`
- Create component: `ManagerComparisonTable`
  - Columns: Manager | Respondents | Avg Score | Band Distribution | Trend
  - Sortable columns
  - Mini band distribution visualization (reuse pattern from QuestionSummaryTable)
- Integrate into AnalyticsPage Managers tab

---

## Out of Scope (Forbidden)

- Trend calculations (stub with "—" for now)
- Manager hierarchy editor (admin ticket later)
- AI insights
- Multi-team segmentation (future MULTI-002)
- Core scoring engine changes
- Database schema changes

---

## Acceptance Criteria

- [ ] Managers tab renders a sortable table of managers
- [ ] Shows correct respondent counts per manager
- [ ] Shows correct index averages per manager
- [ ] Shows band distribution per manager
- [ ] Version selector updates the data
- [ ] API returns 200 and matches shared types
- [ ] No client or server console errors
- [ ] Loading/error states handled
- [ ] Empty state for surveys with no manager data

---

## Technical Notes

### Data Source

Manager ID comes from survey response metadata:
```typescript
response.metadata?.managerId: string
```

If `managerId` is not present in responses, the table should show "No manager data available".

### Computation Logic

For each unique managerId:
1. Get all responses with that managerId
2. Calculate scores using `calculateSurveyScores`
3. Compute average overall index score
4. Assign each response to a band
5. Count band distribution
6. Return aggregated stats

### Response Shape

```typescript
interface ManagerSummaryItem {
  managerId: string;
  managerName?: string; // from metadata if available
  respondentCount: number;
  completionRate: number;
  avgIndexScore: number;
  bandDistribution: {
    bandId: string;
    bandLabel: string;
    count: number;
    percentage: number;
    color: string;
  }[];
}

interface ManagerIndexSummaryData {
  managers: ManagerSummaryItem[];
  totalManagers: number;
  totalResponses: number;
}
```

---

## Required Files to Modify

1. `shared/analytics.ts` - Add types and METRIC_ID
2. `server/utils/analytics.ts` - Add `computeIndexSummaryByManager`
3. `server/routes/analytics.ts` - Add route handler
4. `client/src/components/analytics/useManagerIndexSummary.ts` (new)
5. `client/src/components/analytics/ManagerComparisonTable.tsx` (new)
6. `client/src/components/analytics/index.ts` - Export new components
7. `client/src/pages/AnalyticsPage.tsx` - Integrate into Managers tab
8. `docs/BUILD_LOG.md`

---

## Test Plan

1. Navigate to Analytics page for survey with manager data
2. Click on Managers tab
3. Verify table displays all unique managers
4. Verify respondent counts are correct
5. Verify average scores calculate correctly
6. Verify band distribution shows correctly
7. Test sorting by each column
8. Change version - verify data updates
9. Test with survey that has no manager data
10. Check console for errors

---

**End of Ticket**

