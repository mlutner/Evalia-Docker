# Ticket ANAL-004: Score Distribution Visualization (Version Aware)

## Goal

Display score distribution charts (overall and by category) on the Survey Analytics page, with version-aware aggregation so historical scores remain stable.

## Why (Context)

Users need to see how scores are distributed across respondents to identify trends, outliers, and category-level insights. This must be version-aware so that editing scoring config doesn't retroactively change historical distributions. This is a core analytics feature that builds on ANAL-000 and BUILD-010.

## In Scope (Allowed)

- `client/src/components/analytics/ScoreDistributionChart.tsx` (create new)
- `client/src/pages/AnalyticsPage.tsx` (add score distribution section)
- `server/routes/analytics.ts` (add score distribution endpoint)
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

- [ ] Bar chart showing overall score distribution (buckets: 0-20, 21-40, etc.)
- [ ] Category-level score breakdown (bar chart or heatmap)
- [ ] Version selector (if multiple versions exist)
- [ ] Loading skeleton while fetching
- [ ] Error state with retry button
- [ ] Responsive on mobile
- [ ] Uses version-aware queries (defaults to latest version)
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/components/analytics/ScoreDistributionChart.tsx` (new)
2. `client/src/pages/AnalyticsPage.tsx`
3. `server/routes/analytics.ts` (add endpoint)
4. Use helpers from `server/utils/analytics.ts`

## Suggested Implementation Steps

1. Create `ScoreDistributionChart.tsx` component skeleton
2. Add endpoint: `GET /api/analytics/surveys/:id/score-distribution?versionId=...`
3. Use `getScoreDistribution()` helper from BUILD-010
4. Implement overall score distribution (buckets)
5. Implement category-level breakdown
6. Add version selector if multiple versions exist
7. Add loading/error states
8. Style to match existing chart patterns
9. Integrate into AnalyticsPage
10. Test with real survey data
11. Stop and await review

## Test Plan

1. Navigate to Analytics page for scored survey with 10+ responses
2. Verify overall score distribution displays correctly
3. Verify category breakdown displays correctly
4. Test version selector (if multiple versions exist)
5. Throttle network - verify loading state
6. Block API request - verify error state
7. Test on mobile viewport
8. Check console for errors/warnings

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Overall and category distributions display
- [ ] Version-aware queries work
- [ ] Loading/error states work
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-004]` prefix

