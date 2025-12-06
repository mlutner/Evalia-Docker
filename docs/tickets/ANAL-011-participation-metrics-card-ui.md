# Ticket ANAL-011: ParticipationMetricsCard Component

## Goal

Create the `ParticipationMetricsCard` React component that displays Total Responses, Response Rate %, Completion Rate %, and Average Completion Time. Includes loading skeleton, error states, and trend indicators (↑↓) when historical data exists.

## Why (Context)

This is the first metric card in the analytics dashboard rebuild. It demonstrates the pattern for all future metric cards. The component must:
- Follow the finalized UI spec from `ANALYTICS_UI_DESIGN.md`
- Use the data contract from ANAL-001
- Integrate with version selector from ANAL-002
- Use shared components from BUILD-020 (MetricStatCard, AnalyticsSkeleton, AnalyticsError)

**This must come after ANAL-001** (data model registry), **ANAL-002** (routing/version selector), **ANAL-010** (backend implementation), and **BUILD-020** (component library) so the component has a contract, a place to live, real data, and shared components to use.

## In Scope (Allowed)

- `client/src/components/analytics/ParticipationMetricsCard.tsx` (create new)
- Styling to match `ANALYTICS_UI_DESIGN.md` spec
- Trend indicator logic (compare current vs previous period)

**Uses shared components from BUILD-020:**
- `MetricStatCard` (from BUILD-020)
- `AnalyticsSkeleton` (from BUILD-020)
- `AnalyticsError` (from BUILD-020)

**Do not create these components here** - they are part of BUILD-020 (Analytics Component Library).

## Out of Scope (Forbidden)

- **Creating MetricStatCard, AnalyticsSkeleton, AnalyticsError** (these are in BUILD-020)
- Backend computation (ANAL-010)
- Integration into AnalyticsPage (ANAL-012)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime
- Other metric cards

## Acceptance Criteria

- [ ] Component displays 4 metrics:
  - Total Responses (number)
  - Response Rate % (percentage, or "N/A" if null)
  - Completion Rate % (percentage)
  - Avg Completion Time (formatted as "X min Y sec" or "N/A" if null)
- [ ] Each metric uses `MetricStatCard` component
- [ ] Trend indicators (↑↓) show when historical data exists
- [ ] Loading skeleton while fetching (uses `AnalyticsSkeleton`)
- [ ] Error state with retry button (uses `AnalyticsError`)
- [ ] Matches styling from `ANALYTICS_UI_DESIGN.md`:
  - Card layout (grid of 4 stat cards)
  - Typography (metric value, label, trend)
  - Colors (trend up = green, down = red)
  - Spacing and padding
- [ ] Responsive on mobile (stacks vertically)
- [ ] Integrates with version selector (refetches on version change)
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/components/analytics/ParticipationMetricsCard.tsx` (create new)

**Note:** MetricStatCard, AnalyticsSkeleton, and AnalyticsError are created in BUILD-020, not here.

## Suggested Implementation Steps

1. **Verify BUILD-020 is complete:**
   - Ensure `MetricStatCard`, `AnalyticsSkeleton`, and `AnalyticsError` exist from BUILD-020
   - Import these components (do not create them)

2. Create `ParticipationMetricsCard.tsx`:
   - Accepts `surveyId` and `versionId` props
   - Fetches data from `/api/analytics/:surveyId/participation_metrics?version=...`
   - Renders 4 `MetricStatCard` components in grid
   - Handles loading/error states
   - Uses `MetricStatCard` from BUILD-020 for each metric
   - Uses `AnalyticsSkeleton` from BUILD-020 for loading state
   - Uses `AnalyticsError` from BUILD-020 for error state
   - Computes trend indicators (compare current vs previous version if available)

5. Style to match UI spec:
   - Card container styling
   - Grid layout (4 columns on desktop, 1 on mobile)
   - Typography and colors

6. Test:
   - Loading state
   - Error state
   - Success state with data
   - Trend indicators
   - Responsive layout

## Test Plan

1. Render component with `surveyId` and `versionId`
2. Verify loading skeleton appears while fetching
3. Verify 4 metrics display with correct values
4. Test error state (block API request)
5. Test retry button works
6. Test trend indicators (mock previous period data)
7. Test responsive layout (mobile viewport)
8. Test version change triggers refetch
9. Check console for errors/warnings

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] All 4 metrics display correctly
- [ ] Loading/error states work
- [ ] Trend indicators work
- [ ] Responsive on mobile
- [ ] Matches UI spec styling
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-011]` prefix

