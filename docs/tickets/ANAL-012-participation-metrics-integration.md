# Ticket ANAL-012: Participation Metrics Integration

## Goal

Integrate `ParticipationMetricsCard` into `AnalyticsPage` Overview tab. Ensure it works with version selector, responsive layout, and all edge cases.

## Why (Context)

The participation metrics card is built (ANAL-011) and backend is ready (ANAL-010), but it needs to be integrated into the analytics page. This ticket ensures:
- Card appears in correct location (Overview tab)
- Version selector integration works
- Layout is responsive
- Edge cases are handled

**This must come after ANAL-002** (routing/version selector) and **ANAL-011** (card component).

## In Scope (Allowed)

- `client/src/pages/AnalyticsPage.tsx` (integrate ParticipationMetricsCard)
- Layout adjustments for Overview tab
- Version selector integration
- Responsive layout verification

## Out of Scope (Forbidden)

- Creating new components (ANAL-011)
- Backend computation (ANAL-010)
- **Other metric cards or tabs** (Overview tab only)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime

**Critical:** Do not modify any other metric cards or tabs; Overview tab only.

## Acceptance Criteria

- [ ] `ParticipationMetricsCard` appears in Overview tab
- [ ] Card receives `surveyId` and `versionId` from page state
- [ ] Version selector changes trigger card refetch
- [ ] Card is positioned correctly in layout (top of Overview tab)
- [ ] Responsive layout verified (mobile, tablet, desktop)
- [ ] Loading state works (card shows skeleton while fetching)
- [ ] Error state works (card shows error, doesn't break page)
- [ ] No layout shifts or visual glitches
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/pages/AnalyticsPage.tsx` (integrate card)

## Suggested Implementation Steps

1. Import `ParticipationMetricsCard` into `AnalyticsPage.tsx`

2. In Overview tab content:
   - Render `ParticipationMetricsCard` at top
   - Pass `surveyId` from route params
   - Pass `versionId` from version selector state

3. Ensure version selector integration:
   - When version changes, card should refetch
   - Card should show loading state during refetch

4. Test responsive layout:
   - Desktop: Card in grid layout
   - Tablet: Card adapts
   - Mobile: Card stacks vertically

5. Test edge cases:
   - No responses → Card shows zeros/null gracefully
   - API error → Card shows error, page doesn't break
   - Loading → Card shows skeleton

6. Verify no layout shifts:
   - Card doesn't cause page reflow
   - Loading → Success transition is smooth

## Test Plan

1. Navigate to `/analytics/:surveyId` (Overview tab)
2. Verify `ParticipationMetricsCard` appears at top
3. Verify all 4 metrics display correctly
4. Change version selector, verify card refetches
5. Test responsive layout (mobile, tablet, desktop)
6. Test loading state (throttle network)
7. Test error state (block API request)
8. Verify no console errors
9. Verify no layout shifts

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Card appears in Overview tab
- [ ] Version selector integration works
- [ ] Responsive layout verified
- [ ] Loading/error states work
- [ ] No layout shifts
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-012]` prefix

