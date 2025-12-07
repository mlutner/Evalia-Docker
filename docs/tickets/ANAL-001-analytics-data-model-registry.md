# Ticket ANAL-001: Analytics Data Model Registry

## Goal

Establish the source of truth for analytics metric types, metricIds, JSON shapes, and TypeScript interfaces. Create backend stub functions for metric computation. This is the **contract** that all future metric cards will use.

## Why (Context)

Without a centralized registry, every metric card implementation will:
- Guess at API shapes
- Duplicate type definitions
- Create inconsistent response formats
- Require refactoring when shapes change

This ticket establishes the **backend contract** before any UI components are built. It ensures:
- All metric cards use the same response shapes
- TypeScript types are defined once in `/shared`
- Backend routes have a clear switch(metricId) pattern
- Future metrics follow the same pattern

**This must come before ANAL-010/011/012** (participation metrics) to avoid brittle implementations.

## In Scope (Allowed)

- `shared/analytics.ts` (create new - TypeScript interfaces only)
- `server/routes/analytics.ts` (create new - stub route handlers only)
- `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` (reference for shapes - source of truth)
- Type definitions for all 10 metric types
- Stub functions returning hard-coded example data from spec

**Contract-Level Only:**
- No database queries
- No actual metric computation
- Stub responses can be hard-coded examples from `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`
- Purpose: Establish the API contract before any real implementation

## Out of Scope (Forbidden)

- **Database queries** (ANAL-010+)
- Actual metric computation logic (ANAL-010+)
- UI components (ANAL-011+)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime

**Critical:** This ticket is **contract-only**. Stub handlers return hard-coded example JSON from the spec. No database access, no real computation.

## Acceptance Criteria

- [ ] `shared/analytics.ts` exports TypeScript interfaces for:
  - `AnalyticsResponse<T>` (standard meta/data structure)
  - `IndexDistributionResponse` (reuses ScoreDistributionResponse shape)
  - `IndexBandDistributionResponse` (reuses BandDistributionResponse shape)
  - `DomainOverviewResponse` (reuses CategoryBreakdownResponse shape)
  - `DomainOverviewBySegmentResponse` (extends CategoryBreakdownResponse)
  - `IndexTrendResponse` (LineChart data structure)
  - `HotspotSummaryResponse` (custom shape)
  - `SelfVsTeamComparisonResponse` (custom shape)
  - `IndexSummaryBySegmentResponse` (custom shape)
  - `DomainHeatmapBySegmentResponse` (custom shape)
  - `BeforeAfterIndexComparisonResponse` (custom shape)
- [ ] `server/routes/analytics.ts` defines:
  - Route: `GET /api/analytics/:surveyId/:metricId`
  - Query params: `?version=...&segmentBy=...&filter=...`
  - Switch statement mapping metricId to stub handler
  - All 25+ metricIds from ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md supported
  - Stub handlers return properly typed empty/example responses
- [ ] Types match JSON shapes in `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`
- [ ] No actual computation logic (stubs only)

## Required Files to Modify

1. `shared/analytics.ts` (create new)
2. `server/routes/analytics.ts` (create new)
3. `server/index.ts` or main server file (register analytics routes)

## Suggested Implementation Steps

1. Create `shared/analytics.ts`:
   - Import base types from `@shared/schema` (ScoreDistributionResponse, etc.)
   - Define `AnalyticsResponse<T>` generic wrapper
   - Define interfaces for each metric type (10 total)
   - Export all types

2. Create `server/routes/analytics.ts`:
   - Define route: `GET /api/analytics/:surveyId/:metricId`
   - Parse query params (version, segmentBy, filter)
   - Create switch(metricId) with cases for all metricIds
   - Each case returns stub response (hard-coded example data from spec)
   - **No database queries** - use example JSON from `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`
   - Properly typed using interfaces from `shared/analytics.ts`

3. Register route in main server file:
   - Import analytics router
   - Mount at `/api/analytics`

4. Test stub endpoints:
   - Verify all metricIds return valid JSON
   - Verify TypeScript types compile
   - Verify response shapes match spec

## Test Plan

1. Start server, call `/api/analytics/:surveyId/leadership_index_distribution`
2. Verify response has correct `meta` and `data` structure
3. Verify TypeScript compiles (`npm run check`)
4. Test all 25+ metricIds return valid responses
5. Verify query params are parsed correctly
6. Check that stub responses match expected shapes from spec

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] All 10 metric type interfaces defined
- [ ] All 25+ metricIds have stub handlers
- [ ] **Response shapes match `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` (source of truth)**
- [ ] **No database queries** (stubs only)
- [ ] **No actual computation logic** (hard-coded examples from spec)
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-001]` prefix

**Note:** If there is a conflict between code and spec, update the spec first, then the code.

