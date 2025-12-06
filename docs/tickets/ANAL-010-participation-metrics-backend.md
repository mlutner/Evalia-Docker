# Ticket ANAL-010: Participation Metrics Backend Implementation

## Goal

Implement backend computation for participation metrics: Total Responses, Response Rate %, Completion Rate %, and Average Completion Time. These metrics are version-aware (filter by `score_config_version_id`) and universal (not tied to leadership/wellbeing domains).

## Why (Context)

Participation metrics are the foundation of survey analytics. They answer basic questions:
- How many people responded?
- What percentage of invites responded?
- How many completed vs started?
- How long did it take on average?

**This must come after ANAL-001** (data model registry) so we have the contract defined. **This must come before ANAL-011** (UI component) so the card has real data to display.

Participation metrics are universal - they don't depend on scoring categories or domains, making them a good first implementation.

## In Scope (Allowed)

- `server/routes/analytics.ts` (implement ONE case: `metricId === "participation_metrics"`)
- `server/utils/analytics.ts` (create helper functions for calculations)
- Database queries to compute:
  - Total Responses (count of responses for survey/version)
  - Response Rate % (responses / invites, if invites tracked)
  - Completion Rate % (completed / started)
  - Avg Completion Time (average of `completed_at - started_at`)
- Version-aware filtering (by `score_config_version_id`)

**Critical:** 
- Uses `metricId = "participation_metrics"` (standardized in ANAL-001)
- **Only modifies ONE case in the switch statement** - do not change other metric handlers
- All shapes must match `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` (source of truth)

## Out of Scope (Forbidden)

- **Other metric handlers** (do not modify other cases in switch statement)
- UI components (ANAL-011)
- Integration into AnalyticsPage (ANAL-012)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime
- Database schema changes

## Acceptance Criteria

- [ ] Endpoint: `GET /api/analytics/:surveyId/participation_metrics?version=...`
- [ ] Returns JSON matching `ParticipationMetricsResponse` type from `shared/analytics.ts`
- [ ] Computes all 4 metrics correctly:
  - Total Responses: Count of responses for survey/version
  - Response Rate %: (responses / invites) * 100 (or null if invites not tracked)
  - Completion Rate %: (completed / started) * 100
  - Avg Completion Time: Average duration in seconds (or null if not available)
- [ ] Version-aware: Filters by `score_config_version_id` if provided
- [ ] Handles edge cases:
  - No responses → returns zeros/null
  - No invites tracked → Response Rate % is null
  - No completion times → Avg Completion Time is null
- [ ] Performance: Efficient queries (no N+1)

## Required Files to Modify

1. `server/routes/analytics.ts` (implement handler)
2. `server/utils/analytics.ts` (create helper functions)
3. `shared/analytics.ts` (add `ParticipationMetricsResponse` type if not in ANAL-001)

## Suggested Implementation Steps

1. Add `ParticipationMetricsResponse` type to `shared/analytics.ts`:
   ```typescript
   interface ParticipationMetricsResponse {
     totalResponses: number;
     responseRate: number | null; // percentage
     completionRate: number; // percentage
     avgCompletionTime: number | null; // seconds
   }
   ```

2. Create `server/utils/analytics.ts`:
   - `computeParticipationMetrics(surveyId, versionId?)`: Main computation function
   - Query responses for survey/version
   - Calculate each metric
   - Return typed response

3. Update `server/routes/analytics.ts`:
   - **Add ONE case only:** `case "participation_metrics":`
   - Call `computeParticipationMetrics`
   - Return properly typed response matching `ParticipationMetricsResponse` from spec
   - **Do not modify other metric handlers**

4. Test with real data:
   - Survey with responses
   - Survey with no responses
   - Version filtering

## Test Plan

1. Call `/api/analytics/:surveyId/participation_metrics` for survey with responses
2. Verify all 4 metrics return correct values
3. Test with `?version=v1-id` to filter by version
4. Test with survey that has no responses (zeros/null)
5. Test with survey that has no invites tracked (Response Rate % is null)
6. Verify queries are efficient (check logs)
7. Verify TypeScript types compile

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] **Only ONE case added to switch statement** (participation_metrics)
- [ ] **Response shape matches `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`** (source of truth)
- [ ] All 4 metrics computed correctly
- [ ] Version-aware filtering works
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-010]` prefix

**Note:** If there is a conflict between code and spec, update the spec first, then the code.

