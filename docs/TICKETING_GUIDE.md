# Evalia Ticketing Guide

> Standardized ticket format for AI-assisted development in Cursor

---

## Why Tickets Matter

When working with AI assistants, **specificity prevents drift**. Without clear boundaries:
- AI may "improve" unrelated code
- Scope creep happens silently
- Core architecture gets modified accidentally

This template enforces:
1. **Explicit scope** - AI knows exactly what to touch
2. **Protected zones** - Critical systems stay untouched
3. **Testable outcomes** - Clear definition of done
4. **Audit trail** - Easy to review what changed

---

## Ticket Template

Copy this template for each new task:

```markdown
# Ticket <ID>: <Title>

## Goal

A concise but explicit description of what must be achieved.
Do not describe HOW, only WHAT.

## Why (Context)

Explain in 2–4 sentences:
- Why this matters
- Dependencies or constraints
- How it fits Evalia's architecture

## In Scope (Allowed)

Explicit list of what AI is permitted to modify.
Use file paths. Be specific.

Example:
- `client/src/utils/validateLogic.ts`
- `server/routes/analytics.ts`
- Add new Zod schema ONLY for analytics payloads

## Out of Scope (Forbidden)

Ensure AI does NOT touch:
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime branching
- Database schema unless explicitly allowed
- Builder layout or unrelated components

## Acceptance Criteria

Bullet list of concrete, testable outcomes.
Each must be verifiable.

Example:
- [ ] Detect cycles in logic graph
- [ ] Return warnings list to builder UI
- [ ] No changes to scoring engine
- [ ] Unit test added for cycle detection

## Required Files to Modify

Repeat the allowed file list (AI focuses better when duplicated):
1. `path/to/file1.ts`
2. `path/to/file2.tsx`

## Suggested Implementation Steps

1. Step one
2. Step two
3. Step three
4. Stop and await review

## Test Plan

One paragraph describing:
- How to validate it works
- What sample data to test
- How to test regressions

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Reviewed diff for unrelated modifications
- [ ] Builder + runtime tested manually
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message
```

---

## Ticket ID Convention

Use prefix + sequential number:

| Prefix | Area | Example |
|--------|------|---------|
| `ANAL` | Analytics | ANAL-001 |
| `BUILD` | Builder | BUILD-042 |
| `LOGIC` | Logic Engine | LOGIC-007 |
| `SCORE` | Scoring | SCORE-015 |
| `DIST` | Distribution | DIST-003 |
| `ADMIN` | Admin Panel | ADMIN-001 |
| `INFRA` | Infrastructure | INFRA-012 |
| `UI` | UI/UX Polish | UI-028 |
| `BUG` | Bug Fixes | BUG-099 |

---

## Protected Zones (Global Out of Scope)

Unless explicitly in scope, AI must NEVER modify:

```
# Core engines (versioned, deterministic)
src/core/scoring/*
src/core/logic/*
shared/scoringEngine.ts
shared/logicEngine.ts

# Runtime behavior
client/src/pages/SurveyView.tsx (response flow)
client/src/components/surveys/ResultsScreen.tsx
server/routes/responses.ts (scoring calculation)

# Database schema
shared/schema.ts (table definitions)
migrations/*

# AI guardrails
server/schemas/ai.ts
server/aiService.ts (prompt templates)

# Type contracts
shared/schema.ts (type definitions)
client/src/components/builder-extensions/INTEGRATION_GUIDE.ts
```

---

## Example Tickets

### Example 1: Analytics Feature

```markdown
# Ticket ANAL-001: Survey Participation Metrics Card

## Goal

Display response rate, completion rate, and average completion time on the Analytics page.

## Why (Context)

Users need to understand survey health at a glance. This is the first card in the Analytics Dashboard rebuild. Depends on existing `/api/surveys/:id/responses` endpoint.

## In Scope (Allowed)

- `client/src/pages/AnalyticsPage.tsx` (add ParticipationCard component)
- `client/src/components/analytics/ParticipationCard.tsx` (create new)
- `server/routes/analytics.ts` (add metrics endpoint if needed)

## Out of Scope (Forbidden)

- Core scoring engine
- Response submission flow
- Database schema changes
- SurveyBuilderV2

## Acceptance Criteria

- [ ] Card shows: total responses, response rate %, avg completion time
- [ ] Loading state while fetching
- [ ] Error state if fetch fails
- [ ] Matches existing card styling (KpiCard pattern)

## Required Files to Modify

1. `client/src/pages/AnalyticsPage.tsx`
2. `client/src/components/analytics/ParticipationCard.tsx` (new)

## Suggested Implementation Steps

1. Create ParticipationCard component with props interface
2. Add metrics calculation logic
3. Integrate into AnalyticsPage
4. Add loading/error states
5. Test with real survey data

## Test Plan

Load Analytics page for a survey with 10+ responses. Verify metrics display correctly. Check loading state by throttling network. Verify no console errors.

## Completion Checklist

- [ ] Code compiles
- [ ] No forbidden files changed
- [ ] Card displays correct metrics
- [ ] Responsive on mobile
- [ ] Committed
```

### Example 2: Bug Fix

```markdown
# Ticket BUG-023: Logic rules not loading from templates

## Goal

Fix bug where templates with `has_logic` tag don't load their `logicRules` into the builder.

## Why (Context)

Users select logic-based templates but rules don't appear in Logic tab. Blocks template adoption. Root cause: template import flow missing `logicRules` field.

## In Scope (Allowed)

- `client/src/contexts/SurveyBuilderContext.tsx` (template import section only)
- `server/seedTemplates.ts` (condition format fix)

## Out of Scope (Forbidden)

- Logic engine runtime
- Scoring system
- Builder UI components
- Other context functions

## Acceptance Criteria

- [ ] Logic rules appear in Logic tab after template load
- [ ] Condition format matches `answer("qId") == "value"`
- [ ] No regression in AI survey import
- [ ] No regression in existing survey load

## Required Files to Modify

1. `client/src/contexts/SurveyBuilderContext.tsx`
2. `server/seedTemplates.ts`

## Suggested Implementation Steps

1. Add `logicRules: q.logicRules` to template import flow
2. Fix condition format in seedTemplates
3. Reseed templates
4. Test with adaptive engagement template

## Test Plan

1. Clear browser storage
2. Go to Templates, select "Adaptive Engagement"
3. Open Logic tab - verify rules appear
4. Create new AI survey - verify still works

## Completion Checklist

- [ ] Code compiles
- [ ] Templates load with logic
- [ ] AI import still works
- [ ] Committed with BUILD_LOG update
```

---

## Using Tickets in Cursor

### Starting a Ticket

1. Create ticket in this format
2. Paste entire ticket as first message in new Cursor chat
3. Say: "Please implement this ticket. Follow the steps in order and stop before committing."

### During Implementation

- If AI tries to modify forbidden files, say: "Stop. That file is out of scope."
- If AI suggests "improvements" outside scope, say: "Stay focused on the ticket scope."
- After each step, review the diff before proceeding

### Completing a Ticket

1. Run completion checklist
2. Review all changed files against "In Scope" list
3. Update BUILD_LOG.md
4. Commit with message: `[<TICKET-ID>] <Title>`

---

## Ticket Backlog Location

Active tickets: `docs/tickets/`  
Completed tickets: `docs/tickets/completed/`

Create ticket files as: `docs/tickets/ANAL-001-participation-metrics.md`

---

## Quick Reference

```
# New ticket command
cp docs/TICKETING_GUIDE.md docs/tickets/NEW-001-title.md

# Commit format
git commit -m "[ANAL-001] Add participation metrics card"

# Verify no forbidden changes
git diff --name-only HEAD~1 | grep -E "src/core|SurveyView|schema.ts"
```

