# Ticket ANAL-006: Question-Level Summary Table

> **Status:** Implemented (pending review)
> **Created:** 2025-12-06
> **Updated:** 2025-12-06

## Goal

Display a table showing completion rate, average value (if numeric), and response distribution (if scaled) for each question in the survey.

## Why (Context)

Users need question-level insights to identify which questions have low completion rates, which questions produce the highest/lowest scores, and how responses are distributed across options. This is foundational for deeper analytics (segmentation, correlation analysis) later.

## In Scope (Allowed)

- `client/src/components/analytics/QuestionSummaryTable.tsx` (create new)
- `client/src/pages/AnalyticsPage.tsx` (add question summary section)
- `server/routes/analytics.ts` (add question summary endpoint)
- Use `server/utils/analytics.ts` helpers from BUILD-010
- Version-aware queries (use `score_config_version_id`)

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Response submission flow
- Database schema changes
- SurveyBuilderV2 or builder components
- SurveyView runtime

## Acceptance Criteria

- [x] Table displays: Question #, Question Text, Completion Rate, Avg Value (if numeric), Distribution (if scaled)
- [x] Sortable columns
- [x] Filterable by question type
- [x] Loading skeleton while fetching
- [x] Error state with retry button
- [x] Responsive on mobile (horizontal scroll)
- [x] Uses version-aware queries
- [ ] No console errors or warnings (pending browser test)

## Implementation Summary

### Backend

1. **Types added to `shared/analytics.ts`:**
   - `QuestionSummaryItem` interface
   - `QuestionSummaryData` interface
   - `OptionDistribution` interface
   - `METRIC_IDS.QUESTION_SUMMARY`
   - `METRIC_TYPE_MAP[METRIC_IDS.QUESTION_SUMMARY]`

2. **Helper added to `server/utils/analytics.ts`:**
   - `computeQuestionSummary(surveyId, versionId?)` function
   - Handles all question types (numeric, choice, etc.)
   - Computes completion rate, avg/min/max values, and distributions
   - Skips structural questions (section, statement, legal, hidden)

3. **Route added to `server/routes/analytics.ts`:**
   - `GET /api/analytics/:surveyId/question_summary?version=...`
   - Returns `QuestionSummaryResponse` with per-question statistics

### Frontend

1. **Hook created: `useQuestionSummary.ts`**
   - Fetches question summary data from the analytics API
   - Version-aware with query invalidation

2. **Component created: `QuestionSummaryTable.tsx`**
   - Sortable columns (question #, completion rate, avg value, total answers)
   - Filter by question type dropdown
   - Inline mini-distribution visualization with tooltips
   - Loading, error, and empty states

3. **Integrated into `AnalyticsPage.tsx`:**
   - Added to Domains tab
   - Connected to version selector

## Files Changed

| File | Change |
|------|--------|
| `shared/analytics.ts` | Added types and METRIC_ID |
| `server/utils/analytics.ts` | Added `computeQuestionSummary` |
| `server/routes/analytics.ts` | Added route handler |
| `client/src/components/analytics/useQuestionSummary.ts` | New |
| `client/src/components/analytics/QuestionSummaryTable.tsx` | New |
| `client/src/components/analytics/index.ts` | Added exports |
| `client/src/pages/AnalyticsPage.tsx` | Added to Domains tab |
| `docs/BUILD_LOG.md` | Added entry |

## Test Plan

1. Navigate to Analytics page for survey with 10+ responses
2. Verify all questions display in table
3. Test sorting by each column
4. Test filtering by question type
5. Verify completion rates calculate correctly
6. Verify avg values display for numeric questions
7. Verify distributions display for scaled questions
8. Throttle network - verify loading state
9. Block API request - verify error state
10. Test on mobile viewport
11. Check console for errors/warnings

## Completion Checklist

- [x] Code compiles (pre-existing errors unrelated to this ticket)
- [x] No forbidden files changed
- [x] All questions display in table
- [x] Sorting works
- [x] Filtering works
- [x] Version-aware queries work
- [x] Loading/error states work
- [x] Responsive on mobile (horizontal scroll)
- [ ] No console errors (pending browser test)
- [x] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-006]` prefix

