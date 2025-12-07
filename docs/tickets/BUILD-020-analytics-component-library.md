# Ticket BUILD-020: Analytics Component Library

## Goal

Create reusable chart wrappers (`<BarChart/>`, `<LineChart/>`, `<DonutChart/>`, `<MetricStatCard/>`) with responsive styling, theme integration, and loading/error states to prevent duplication across analytics features.

## Why (Context)

Without shared chart components, each analytics feature (participation, score distribution, band distribution) will duplicate chart logic, styling, and state management. Centralizing these components ensures consistency, reduces code duplication, and makes future analytics features faster to build.

## In Scope (Allowed)

- `client/src/components/analytics/charts/BarChart.tsx` (create new)
- `client/src/components/analytics/charts/LineChart.tsx` (create new)
- `client/src/components/analytics/charts/DonutChart.tsx` (create new)
- `client/src/components/analytics/MetricStatCard.tsx` (create new)
- Shared styling, theme integration, loading/error states
- Responsive behavior (mobile-friendly)

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Response submission flow
- Database schema changes
- SurveyBuilderV2 or builder components
- SurveyView runtime
- Charting library choice (use existing or add recharts/chart.js)

## Acceptance Criteria

- [ ] `<BarChart/>` component with props: `data`, `xKey`, `yKey`, `color?`, `loading?`, `error?`
- [ ] `<LineChart/>` component with props: `data`, `xKey`, `yKey`, `color?`, `loading?`, `error?`
- [ ] `<DonutChart/>` component with props: `data`, `labelKey`, `valueKey`, `colors?`, `loading?`, `error?`
- [ ] `<MetricStatCard/>` component with props: `label`, `value`, `trend?`, `loading?`, `error?`
- [ ] All components have loading skeletons
- [ ] All components have error states with retry
- [ ] All components are responsive (mobile-friendly)
- [ ] All components integrate with app theme
- [ ] TypeScript types exported for all props

## Required Files to Modify

1. `client/src/components/analytics/charts/BarChart.tsx` (new)
2. `client/src/components/analytics/charts/LineChart.tsx` (new)
3. `client/src/components/analytics/charts/DonutChart.tsx` (new)
4. `client/src/components/analytics/MetricStatCard.tsx` (new)

## Suggested Implementation Steps

1. Choose charting library (recharts or chart.js) if not already in project
2. Create `MetricStatCard.tsx`:
   - Display label, value, optional trend arrow
   - Add loading skeleton
   - Add error state
   - Style to match existing KpiCard pattern
3. Create `BarChart.tsx`:
   - Wrap charting library bar chart
   - Add loading skeleton
   - Add error state
   - Make responsive
4. Create `LineChart.tsx`:
   - Wrap charting library line chart
   - Add loading skeleton
   - Add error state
   - Make responsive
5. Create `DonutChart.tsx`:
   - Wrap charting library pie/donut chart
   - Add loading skeleton
   - Add error state
   - Make responsive
6. Export all components from `client/src/components/analytics/charts/index.ts`
7. Test all components with sample data
8. Stop and await review

## Test Plan

1. Render each component with sample data
2. Verify loading skeletons display
3. Verify error states display
4. Test responsive behavior (mobile viewport)
5. Verify theme integration (colors match app theme)
6. Check TypeScript compilation
7. Check console for errors/warnings

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] All chart components created
- [ ] Loading/error states work
- [ ] Responsive on mobile
- [ ] Theme integration verified
- [ ] TypeScript types exported
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[BUILD-020]` prefix

