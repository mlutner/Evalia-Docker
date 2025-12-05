# Ticket ANAL-006: Question-Level Summary Table

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

- [ ] Table displays: Question #, Question Text, Completion Rate, Avg Value (if numeric), Distribution (if scaled)
- [ ] Sortable columns
- [ ] Filterable by question type
- [ ] Loading skeleton while fetching
- [ ] Error state with retry button
- [ ] Responsive on mobile (horizontal scroll or stacked)
- [ ] Uses version-aware queries
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/components/analytics/QuestionSummaryTable.tsx` (new)
2. `client/src/pages/AnalyticsPage.tsx`
3. `server/routes/analytics.ts` (add endpoint)
4. Use helpers from `server/utils/analytics.ts`

## Suggested Implementation Steps

1. Create `QuestionSummaryTable.tsx` component skeleton
2. Add endpoint: `GET /api/analytics/surveys/:id/question-summary?versionId=...`
3. Use `getQuestionSummary()` helper from BUILD-010 (iterate over all questions)
4. Implement table with columns: Question #, Text, Completion Rate, Avg Value, Distribution
5. Add sorting functionality
6. Add filtering by question type
7. Add loading/error states
8. Style to match existing table patterns
9. Integrate into AnalyticsPage
10. Test with real survey data
11. Stop and await review

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

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] All questions display in table
- [ ] Sorting works
- [ ] Filtering works
- [ ] Version-aware queries work
- [ ] Loading/error states work
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[ANAL-006]` prefix

