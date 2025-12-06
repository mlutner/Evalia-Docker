# Ticket ANAL-002: Analytics Routing + Version Selector + Layout Scaffolding

## Goal

Create the analytics page routing structure, add a version selector dropdown, and scaffold the AnalyticsPage layout with tab sections (Overview, Domains, Managers, Trends). This establishes the UI framework that all metric cards will plug into.

## Why (Context)

Before building individual metric cards, we need:
- A consistent routing pattern (`/analytics/:surveyId`)
- Version selection UI (critical for version-aware analytics)
- Tab structure for organizing metrics
- Layout scaffolding so cards have a place to live

**This must come after ANAL-001** (data model registry) to use the metricId contract, but **does not call specific metrics yet** (just scaffolding).

**This must come before ANAL-011/012** (participation metrics card) so the card has a proper home and version selector to integrate with.

**This is the ONLY ticket allowed to:**
- Add `GET /api/analytics/:surveyId/versions` endpoint
- Touch `client/src/pages/AnalyticsPage.tsx` for layout + tabs

## In Scope (Allowed)

- `client/src/pages/AnalyticsPage.tsx` (create or refactor - **ONLY ticket allowed to modify this file for layout/tabs**)
- `client/src/components/analytics/VersionSelector.tsx` (create new)
- `client/src/components/analytics/AnalyticsLayout.tsx` (create new - optional wrapper)
- `server/routes/analytics.ts` (add `GET /api/analytics/:surveyId/versions` endpoint - **ONLY ticket allowed to add this endpoint**)
- Tab navigation structure (Overview, Domains, Managers, Trends)
- Route definition in router
- Version selector state management

**Dependency:** Uses metricId contract from ANAL-001 but does not call specific metrics yet (just scaffolding).

## Out of Scope (Forbidden)

- Actual metric cards (ANAL-011+)
- Metric computation (ANAL-010+)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime
- Database queries

## Acceptance Criteria

- [ ] Route: `/analytics/:surveyId` renders AnalyticsPage
- [ ] Version selector dropdown:
  - Fetches available versions for survey
  - Displays version number (e.g., "v1", "v2", "Latest")
  - Defaults to latest version
  - Updates URL query param: `?version=v1-id`
  - Triggers metric refetch when changed
- [ ] AnalyticsPage layout:
  - Header with survey name and version selector
  - Tab navigation: Overview, Domains, Managers, Trends, Export
  - Tab content areas (empty placeholders for now)
  - Responsive layout
- [ ] Loading state while fetching version list
- [ ] Error state if survey not found
- [ ] No actual metric cards yet (just scaffolding)

## Required Files to Modify

1. `client/src/pages/AnalyticsPage.tsx` (create or refactor)
2. `client/src/components/analytics/VersionSelector.tsx` (create new)
3. Router configuration (add `/analytics/:surveyId` route)
4. `server/routes/analytics.ts` (add `GET /api/analytics/:surveyId/versions` endpoint)

## Suggested Implementation Steps

1. Create `server/routes/analytics.ts` endpoint:
   - `GET /api/analytics/:surveyId/versions`
   - Returns list of `score_config_versions` for survey
   - Response: `{ versions: [{ id, versionNumber, createdAt }] }`

2. Create `VersionSelector.tsx`:
   - Fetch versions on mount
   - Display dropdown with version options
   - Handle selection, update query param
   - Show loading/error states

3. Create/refactor `AnalyticsPage.tsx`:
   - Extract surveyId from route params
   - Extract version from query params (default to latest)
   - Render header with survey name and VersionSelector
   - Render tab navigation (Overview, Domains, Managers, Trends, Export)
   - Render tab content areas (empty for now)
   - Handle loading/error states

4. Add route to router:
   - `/analytics/:surveyId` → AnalyticsPage

5. Test:
   - Navigate to `/analytics/:surveyId`
   - Verify version selector appears
   - Verify tabs render
   - Verify version change updates URL

## Test Plan

1. Navigate to `/analytics/:surveyId` for existing survey
2. Verify version selector loads and displays versions
3. Select different version, verify URL updates
4. Verify tabs render and switch correctly
5. Test with survey that has no versions (error state)
6. Test responsive layout on mobile
7. Check console for errors

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Route works: `/analytics/:surveyId`
- [ ] Version selector functional
- [ ] Tabs render correctly
- [ ] Layout responsive
- [ ] Loading/error states work
- [ ] No metric cards yet (just scaffolding)
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-002]` prefix

