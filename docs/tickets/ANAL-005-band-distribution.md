# Ticket ANAL-005: Band Distribution Chart (Version Aware)

## Goal

Display a pie/donut chart showing the percentage of respondents in each score band, with version-aware aggregation so historical band distributions remain stable.

## Why (Context)

Users need to see at a glance how many respondents fall into each engagement/risk band (e.g., "Highly Engaged: 45%, Engaged: 30%, Neutral: 20%, Disengaged: 5%"). This is a key metric for understanding overall survey health. Must be version-aware so editing band thresholds doesn't retroactively change historical distributions.

## In Scope (Allowed)

- `client/src/components/analytics/BandDistributionChart.tsx` (create new)
- `client/src/pages/AnalyticsPage.tsx` (add band distribution section)
- `server/routes/analytics.ts` (add band distribution endpoint)
- Use `server/utils/analytics.ts` helpers from BUILD-010
- Version-aware queries (use `score_config_version_id`)

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Response submission flow
- Database schema changes
- SurveyBuilderV2 or builder components
- SurveyView runtime

## Acceptance Criteria

- [ ] Pie/donut chart showing % in each band
- [ ] Band labels and colors match survey config
- [ ] Version selector (if multiple versions exist)
- [ ] Loading skeleton while fetching
- [ ] Error state with retry button
- [ ] Responsive on mobile
- [ ] Uses version-aware queries (defaults to latest version)
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/components/analytics/BandDistributionChart.tsx` (new)
2. `client/src/pages/AnalyticsPage.tsx`
3. `server/routes/analytics.ts` (add endpoint)
4. Use helpers from `server/utils/analytics.ts`

## Suggested Implementation Steps

1. Create `BandDistributionChart.tsx` component skeleton
2. Add endpoint: `GET /api/analytics/surveys/:id/band-distribution?versionId=...`
3. Use `getBandDistribution()` helper from BUILD-010
4. Implement pie/donut chart (use charting library like recharts or chart.js)
5. Map band colors from survey config
6. Add version selector if multiple versions exist
7. Add loading/error states
8. Style to match existing chart patterns
9. Integrate into AnalyticsPage
10. Test with real survey data
11. Stop and await review

## Test Plan

1. Navigate to Analytics page for scored survey with 10+ responses
2. Verify band distribution chart displays correctly
3. Verify band colors match survey config
4. Test version selector (if multiple versions exist)
5. Throttle network - verify loading state
6. Block API request - verify error state
7. Test on mobile viewport
8. Check console for errors/warnings

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Band distribution chart displays
- [ ] Version-aware queries work
- [ ] Loading/error states work
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-005]` prefix

