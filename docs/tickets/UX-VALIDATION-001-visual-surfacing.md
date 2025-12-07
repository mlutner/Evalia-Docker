# Ticket UX-VALIDATION-001: Visual Surfacing of Validation Issues

## Goal

Add visual indicators (dots, badges, icons) in the Logic and Scoring builder tabs to surface validation issues at a glance, with hover tooltips for warnings/errors.

## Why (Context)

Validation is wired into save flow, but users can't see issues until they try to save. Surfacing issues visually in the builder helps users fix problems proactively. This is UX polish - low priority compared to analytics foundation, but improves builder experience.

## In Scope (Allowed)

- `client/src/components/builder-extensions/logic/LogicRuleList.tsx` (add issue dots on rules)
- `client/src/components/builder-extensions/logic/LogicRuleCard.tsx` (enhance issue display)
- `client/src/components/builder-extensions/scoring/ScoringNavigator.tsx` (add issue icons on categories/bands)
- `client/src/components/builder-extensions/scoring/CategoriesList.tsx` (add issue indicators)
- `client/src/components/builder-extensions/scoring/BandsTable.tsx` (add issue indicators)
- Hover tooltips showing issue messages
- Use `useValidation` hook to get issue data

## Out of Scope (Forbidden)

- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- Validation logic itself (already done)
- Database schema changes
- SurveyBuilderV2 or builder components (only builder-extensions)
- SurveyView runtime

## Acceptance Criteria

- [ ] Logic tab: Small colored dot/badge on rules with issues in left list
- [ ] Logic tab: Inline issue message in `LogicRuleCard` (already partially done, enhance)
- [ ] Scoring tab: Icon if category has issues in left nav
- [ ] Scoring tab: Icon if band has issues in left nav
- [ ] Scoring tab: Tiny warning chip on misconfigured questions in center panel
- [ ] Hover tooltips show issue message and severity
- [ ] Color coding: red for errors, amber for warnings, blue for info
- [ ] No performance impact (use memoization)
- [ ] No console errors or warnings

## Required Files to Modify

1. `client/src/components/builder-extensions/logic/LogicRuleList.tsx`
2. `client/src/components/builder-extensions/logic/LogicRuleCard.tsx`
3. `client/src/components/builder-extensions/scoring/ScoringNavigator.tsx`
4. `client/src/components/builder-extensions/scoring/CategoriesList.tsx`
5. `client/src/components/builder-extensions/scoring/BandsTable.tsx`
6. `client/src/components/builder-extensions/scoring/QuestionMappingTable.tsx` (add warning chips)

## Suggested Implementation Steps

1. Import `useValidation` hook in LogicRuleList
2. Add colored dot/badge to rules with issues (use `getRuleIssues()`)
3. Enhance LogicRuleCard issue display (already has some, polish it)
4. Import `useValidation` hook in ScoringNavigator
5. Add issue icons to categories (use `getCategoryIssues()`)
6. Add issue icons to bands (use `getBandIssues()`)
7. Add warning chips to questions in QuestionMappingTable (use `getQuestionIssues()`)
8. Add hover tooltips showing issue messages
9. Style with color coding (red/amber/blue)
10. Test with surveys that have validation issues
11. Stop and await review

## Test Plan

1. Create survey with logic rule referencing deleted question
2. Verify red dot appears on rule in Logic tab
3. Hover over dot - verify tooltip shows issue message
4. Create survey with scoring band gap
5. Verify icon appears on band in Scoring tab
6. Create survey with scorable question missing category
7. Verify warning chip appears on question
8. Test performance (should not lag on large surveys)
9. Check console for errors/warnings

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Logic tab indicators work
- [ ] Scoring tab indicators work
- [ ] Hover tooltips work
- [ ] Color coding correct
- [ ] No performance issues
- [ ] No console errors
- [ ] BUILD_LOG.md updated
- [ ] Committed with `[UX-VALIDATION-001]` prefix

## Priority Note

**This is LOW PRIORITY.** Do not start until analytics foundation (ANAL-000, BUILD-010, ANAL-001) is complete. This is UX polish that doesn't unlock strategic value.

