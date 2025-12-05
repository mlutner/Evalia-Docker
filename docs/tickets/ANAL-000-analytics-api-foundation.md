# Ticket ANAL-000: Analytics API Foundation

## Goal

Establish a consistent `/analytics/surveys/:id/...` namespace with shared response format and version-aware query patterns before building analytics UI components.

## Why (Context)

Analytics endpoints are currently ad-hoc. Without a foundation, each analytics component will write custom SQL and inconsistent response shapes, leading to technical debt. Starting with a clean structure ensures all future analytics features (participation, distributions, summaries) follow the same patterns and are version-aware from day one.

## In Scope (Allowed)

- `server/routes/analytics.ts` (create new router)
- `server/utils/analytics.ts` (shared query helpers)
- Response format standardization: `{ meta: { surveyId, version, generatedAt }, data: { ... } }`
- Version-aware query patterns (use `score_config_version_id` when aggregating)
- Base analytics endpoint structure

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Response submission flow
- Database schema changes (use existing tables)
- UI components (separate tickets)
- SurveyBuilderV2 or builder components
- SurveyView runtime

## Acceptance Criteria

- [ ] `/api/analytics/surveys/:id/...` router created
- [ ] All analytics endpoints return standardized format: `{ meta: { surveyId, version?, generatedAt }, data: { ... } }`
- [ ] Version-aware query helpers in `server/utils/analytics.ts`
- [ ] Helper functions: `getSurveyVersion()`, `getResponsesForVersion()`, `aggregateByVersion()`
- [ ] Health check endpoint: `GET /api/analytics/surveys/:id/health`
- [ ] No breaking changes to existing routes
- [ ] TypeScript types exported for analytics responses

## Required Files to Modify

1. `server/routes/analytics.ts` (new file)
2. `server/utils/analytics.ts` (new file)
3. `server/index.ts` or main router (wire analytics router)

## Suggested Implementation Steps

1. Create `server/routes/analytics.ts` with Express router
2. Define `AnalyticsResponse<T>` TypeScript type with meta/data structure
3. Create `server/utils/analytics.ts` with version-aware query helpers
4. Add `getSurveyVersion(surveyId)` helper
5. Add `getResponsesForVersion(surveyId, versionId?)` helper (defaults to latest)
6. Add `aggregateByVersion(responses, version)` helper
7. Create health check endpoint
8. Wire analytics router into main app
9. Stop and await review

## Test Plan

1. Call `GET /api/analytics/surveys/:id/health` - verify 200 response
2. Verify response format matches `{ meta: { surveyId, generatedAt }, data: { ... } }`
3. Test version helpers with survey that has multiple versions
4. Verify helpers handle missing versions gracefully
5. Check TypeScript compilation

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Standardized response format implemented
- [ ] Version-aware helpers created
- [ ] Health endpoint works
- [ ] Types exported
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-000]` prefix

