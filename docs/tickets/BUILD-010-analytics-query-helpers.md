# Ticket BUILD-010: Analytics Query Helpers

## Goal

Create reusable helper functions in `server/utils/analytics.ts` for common analytics queries (participation metrics, score distributions, band distributions, version-specific aggregations) to prevent each analytics component from writing custom SQL.

## Why (Context)

Without shared query helpers, each analytics component (participation card, score chart, band chart) will duplicate SQL logic, leading to inconsistencies, bugs, and maintenance burden. Centralizing these queries ensures version-awareness, performance optimization, and consistent data shapes across all analytics features.

## In Scope (Allowed)

- `server/utils/analytics.ts` (extend existing or create)
- Helper functions for:
  - Participation metrics (response rate, completion rate, drop-off, avg time)
  - Score distributions (by category, overall)
  - Band distributions (count per band)
  - Version-specific aggregations
  - Response filtering (date range, custom fields)
- TypeScript types for all helper return values
- Error handling and null-safety

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Database schema changes
- UI components (separate tickets)
- SurveyBuilderV2 or builder components
- SurveyView runtime

## Acceptance Criteria

- [ ] `getParticipationMetrics(surveyId, versionId?)` returns response rate, completion rate, drop-off, avg time
- [ ] `getScoreDistribution(surveyId, versionId?, byCategory?)` returns score breakdowns
- [ ] `getBandDistribution(surveyId, versionId?)` returns count per band
- [ ] `getQuestionSummary(surveyId, questionId, versionId?)` returns question-level stats
- [ ] All helpers default to latest version if `versionId` omitted
- [ ] All helpers handle missing data gracefully (return empty/zero values)
- [ ] TypeScript types exported for all return values
- [ ] Helpers are pure functions (no side effects)

## Required Files to Modify

1. `server/utils/analytics.ts` (create or extend)

## Suggested Implementation Steps

1. Create `server/utils/analytics.ts` if it doesn't exist
2. Import storage and schema types
3. Implement `getParticipationMetrics()`:
   - Query responses for survey/version
   - Calculate response rate (responses / invites, if invites exist)
   - Calculate completion rate (completed / started)
   - Calculate drop-off rate (1 - completion rate)
   - Calculate avg completion time from `totalDurationMs`
4. Implement `getScoreDistribution()`:
   - Query responses with scoring data
   - Group by category if `byCategory=true`
   - Return min/max/avg/median scores
5. Implement `getBandDistribution()`:
   - Query responses with `bandId`
   - Count per band
   - Return percentages
6. Implement `getQuestionSummary()`:
   - Query responses for specific question
   - Calculate completion rate, avg value (if numeric), distribution (if scaled)
7. Add TypeScript types for all return values
8. Add error handling (try/catch, null checks)
9. Stop and await review

## Test Plan

1. Test `getParticipationMetrics()` with survey that has 10+ responses
2. Test with survey that has no responses (should return zeros)
3. Test version-specific queries (verify correct version used)
4. Test `getBandDistribution()` with scored survey
5. Test `getQuestionSummary()` with different question types
6. Verify all helpers handle missing `versionId` (defaults to latest)
7. Check TypeScript compilation

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] All helper functions implemented
- [ ] TypeScript types exported
- [ ] Error handling added
- [ ] Version-awareness verified
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[BUILD-010]` prefix

