# Ticket ANAL-001: Survey Participation Metrics Card

## Goal

Display response rate, completion rate, drop-off rate, and average completion time as the primary metrics card on the Survey Analytics page.

## Why (Context)

Users need to understand survey health at a glance before diving into detailed analytics. This is the foundation card for the Analytics Dashboard rebuild. Participation metrics are table stakes for any survey platform - without them, users can't assess survey performance.

## In Scope (Allowed)

- `client/src/pages/AnalyticsPage.tsx` (add/modify metrics section)
- `client/src/components/analytics/ParticipationMetricsCard.tsx` (create new)
- `server/routes/analytics.ts` (add participation metrics endpoint if needed)
- Types for participation data

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Response submission flow (`server/routes/responses.ts`)
- Database schema changes
- SurveyBuilderV2 or builder components
- SurveyView runtime

## Acceptance Criteria

- [ ] Card displays: Total Responses, Response Rate %, Completion Rate %, Avg Completion Time
- [ ] Each metric shows trend indicator (↑↓) vs previous period if data available
- [ ] Loading skeleton while fetching
- [ ] Error state with retry button if fetch fails
- [ ] Matches existing KpiCard styling pattern
- [ ] Responsive on mobile (stack vertically)
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/pages/AnalyticsPage.tsx`
2. `client/src/components/analytics/ParticipationMetricsCard.tsx` (new file)
3. `server/routes/analytics.ts` (if new endpoint needed)

## Suggested Implementation Steps

1. Define TypeScript interface for participation metrics
2. Create ParticipationMetricsCard component skeleton
3. Implement metric calculations (response rate = responses / invites, etc.)
4. Add loading and error states
5. Style to match existing KpiCard pattern
6. Integrate into AnalyticsPage
7. Test with real survey data
8. Stop and await review

## Test Plan

1. Navigate to Analytics page for a survey with 10+ responses
2. Verify all 4 metrics display with correct values
3. Throttle network to 3G - verify loading state appears
4. Block API request - verify error state with retry
5. Test on mobile viewport - verify responsive layout
6. Check console for errors/warnings

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] All 4 metrics display correctly
- [ ] Loading/error states work
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-001]` prefix

