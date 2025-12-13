# Changelog

- [2025-12-13] DEV-INFRA-001: Vite Proxy + Engine Key Fix
  - Added `/api` proxy to `vite.config.ts` for standalone Vite dev server support
  - Fixed duplicate object keys in `client/src/core/logic/engines.ts`
  - Resolves "no templates/surveys showing" issue when accessing app on port 5173
  - Committed as `4f479b9`

- [2025-12-12] LENS-001: Survey-level Diagnostic Lens
  - Added `diagnosticLensId` field to surveys table for analytics interpretation framework routing
  - Created `diagnosticLensIds` zod enum schema in `shared/schema.ts`:
    - Currently supports: `'5d_org_health'`
    - Future-proofed for additional lens types
  - Updated `useDashboardMode` hook with lens-based routing:
    - `determineDashboardMode()` now accepts optional `diagnosticLensId` parameter
    - If lens is `'5d_org_health'` (or undefined), uses canonical 5D category detection
    - Future lenses may route to different dashboard modes
    - `DashboardModeResult` now includes `diagnosticLensId` for consumer access
  - Default behavior: `undefined` → `'5d_org_health'` (no breaking changes)
  - Added 17 unit tests in `client/src/__tests__/hooks/useDashboardMode.lens.test.ts`:
    - Schema validation (diagnosticLensIds, DEFAULT_DIAGNOSTIC_LENS)
    - determineDashboardMode with lens parameter
    - isCanonical5DDashboard edge cases

- [2025-12-12] DIM-001-F: Builder UI for Dimension Assignment
  - Added "Insight Dimension" dropdown to `CategoryScoringInspector.tsx`:
    - Allows users to assign categories to one of 5 Insight Dimensions
    - Options: Leadership Effectiveness, Team Wellbeing, Burnout Risk, Psychological Safety, Engagement
    - "Unassigned" option clears the dimensionId
    - Warning message when category is not mapped
  - Added "Not mapped" badge to `CategoriesList.tsx` for unmapped categories
  - Added "Fix in Scoring → Categories" link to `DimensionMappingWarningBanner.tsx`:
    - Navigates to /builder/{surveyId}/scoring when clicked
    - Provides clear resolution path for analytics warnings
  - Added 11 unit tests in `client/src/__tests__/builder/categoryDimensionMapping.test.ts`:
    - insightDimensionIds validation
    - DIMENSION_LABELS coverage
    - Category serialization with dimensionId
    - Dimension validation

- [2025-12-12] DOM-001: Domain Overview Real Implementation
  - Enhanced `computeDomainOverview()` in `server/utils/analytics.ts` to filter categories by dimension
  - Added `convertDimensionIdToScoreKey()` helper for hyphenated↔camelCase dimension ID conversion
  - Uses `resolveCategoryDimension()` for explicit→legacy→null category mapping resolution
  - Categories sorted by averageScore ascending (worst first) for focus area identification
  - Wired 3 domain_overview endpoints in `server/routes/analytics.ts`:
    - `leadership_domain_overview` → leadership-effectiveness dimension
    - `wellbeing_domain_overview` → team-wellbeing dimension
    - `engagement_domain_overview` → engagement dimension
  - Added 26 unit tests in `server/__tests__/utils/analytics.domainOverview.test.ts`:
    - Dimension ID conversion (hyphenated, camelCase)
    - Category filtering by dimension (explicit dimensionId, legacy mapping)
    - Sorting logic (worst-first, no-responses-last)
    - `resolveCategoryDimension()` priority verification
    - Edge cases (null, empty string, unmapped categories)
  - Frontend `AnalyticsPage.tsx` already uses `dimensionMeta.isReversed()` for burnout inversion

- [2025-12-12] HOT-001: Hotspot Summary Real Implementation
  - Implemented `computeHotspotSummary()` for segment-level hotspot detection
  - Uses band-driven severity detection via `resolveIndexBand()` and `calculatePerformanceScore()`
  - Created `HotspotList` frontend component with priority badges and severity indicators
  - Created `useHotspotSummary` React Query hook
  - Added 27 unit tests in `server/__tests__/utils/analytics.hotspot.test.ts`

- [2025-12-03] LogicEngineV3 Added
  - Implemented `logicEngineV3` with support for AND/OR (`&&`, `||`) and `contains()` for multi-select/comma-separated answers.
  - Added test suite under `shared/__tests__/logicEngineV3.test.ts`.
  - Exported V3 alongside frozen V2 (`src/core/index.ts`, `shared/logicEngine.ts`); runtime still defaults to LogicV2.
  - No breaking changes to existing template behavior.

