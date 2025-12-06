# Ticket ADMIN-050: Interpretation Rules Engine (Phase 1)

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** Low  
> **Created:** 2025-12-06

---

## Goal

Provide a rules-based system for admins/consultants to define interpretive logic (narratives, flags, warnings) that automatically generate insights from analytics data.

---

## Why (Context)

Raw analytics data (scores, distributions, trends) requires interpretation to be actionable. Currently, consultants manually interpret data. This ticket enables:

- Automated narrative generation based on rules
- Consistent interpretation across surveys
- Severity-based flagging (warnings, critical alerts)
- Reusable interpretation templates

**Phase 1 focuses on the rule engine and admin UI. Phase 2 will render narratives in the analytics UI. Phase 3 may add AI-generated narratives.**

**Dependencies:** ADMIN-010 (dimensions), ADMIN-030 (bands)  
**Blocks:** Phase 2 (UI rendering), Phase 3 (AI narratives)

---

## In Scope (Allowed)

### Database
- New table: `interpretation_rules` (id, survey_id?, dimension_id?, condition_json, narrative_template, severity, created_at, updated_at)

### Backend
- `server/routes/admin/interpretationRules.ts` (create new)
- `server/services/interpretationEngine/*` (create new)
- Rule builder service:
  - IF condition (dimension score, domain score, delta, band)
  - THEN narrative output (template with variables)
  - Severity level (info, warning, critical)
- CRUD endpoints for rules
- Rule evaluation service (returns structured output)

### Shared Types
- `shared/interpretation.ts` (create new - rule DTOs, evaluation results)

### Frontend
- `client/src/admin/interpretation-rules/*` (create new)
- Rule list view
- Rule builder/editor:
  - Condition builder (dimension/domain/band selectors)
  - Comparison operators (>, <, ==, between)
  - Narrative template editor with variable insertion
  - Severity selector
- Rule testing/preview

---

## Out of Scope (Forbidden)

- UI rendering of narratives in AnalyticsPage (Phase 2)
- AI narrative generator (Phase 3)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime
- Analytics API contracts (metric IDs, response shapes)

---

## Acceptance Criteria

- [ ] Admin can create interpretation rules
- [ ] Admin can edit existing rules
- [ ] Admin can delete rules
- [ ] Rule conditions support:
  - [ ] Dimension score comparisons (>, <, ==, between)
  - [ ] Domain score comparisons
  - [ ] Band membership checks
  - [ ] Delta/trend comparisons
- [ ] Narrative templates support variable substitution:
  - [ ] `{dimension.name}` - dimension label
  - [ ] `{dimension.score}` - current score
  - [ ] `{dimension.band}` - current band label
  - [ ] `{delta}` - change from previous
- [ ] Severity levels: info, warning, critical
- [ ] Rules stored in DB with proper validation
- [ ] Rule engine evaluates rules and returns structured output
- [ ] Analytics endpoints can include rule evaluation results (optional param)
- [ ] Rule preview/testing in admin UI

---

## Required Files to Modify/Create

1. `server/db/migrations/XXXX_add_interpretation_rules.sql` (new)
2. `server/routes/admin/interpretationRules.ts` (new)
3. `server/services/interpretationEngine/ruleService.ts` (new)
4. `server/services/interpretationEngine/ruleEvaluator.ts` (new)
5. `shared/interpretation.ts` (new)
6. `client/src/admin/interpretation-rules/RulesList.tsx` (new)
7. `client/src/admin/interpretation-rules/RuleEditor.tsx` (new)
8. `client/src/admin/interpretation-rules/ConditionBuilder.tsx` (new)
9. `client/src/admin/interpretation-rules/NarrativeEditor.tsx` (new)
10. `client/src/admin/interpretation-rules/index.ts` (new)
11. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Design rule schema and condition DSL
2. Create database migration
3. Create shared DTOs for rules and evaluation results
4. Implement rule storage service (CRUD)
5. Implement rule evaluation engine
6. Create API routes
7. Build admin UI: rules list
8. Build admin UI: condition builder
9. Build admin UI: narrative template editor
10. Add rule preview/testing feature
11. Optional: Add `?includeInterpretations=true` to analytics endpoints
12. Write integration tests
13. Update BUILD_LOG.md

---

## Rule Schema (Example)

```typescript
interface InterpretationRule {
  id: string;
  surveyId?: string; // null = global rule
  dimensionId?: string; // null = applies to all dimensions
  name: string;
  condition: RuleCondition;
  narrative: string; // Template with variables
  severity: 'info' | 'warning' | 'critical';
  priority: number; // For ordering when multiple rules match
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RuleCondition {
  type: 'dimension_score' | 'domain_score' | 'band' | 'delta' | 'compound';
  operator: '>' | '<' | '==' | '>=' | '<=' | 'between' | 'in';
  value: number | string | [number, number]; // For between
  dimensionId?: string;
  domainId?: string;
  // For compound conditions
  children?: RuleCondition[];
  logic?: 'AND' | 'OR';
}

interface EvaluationResult {
  ruleId: string;
  matched: boolean;
  narrative?: string; // Rendered with variables substituted
  severity?: 'info' | 'warning' | 'critical';
  context: Record<string, unknown>; // Variables used
}
```

---

## Test Plan

1. **Unit tests:**
   - Condition evaluation logic
   - Narrative variable substitution
   - Compound condition logic (AND/OR)

2. **Integration tests:**
   - Rules persist correctly
   - Evaluation returns expected results
   - Multiple rules evaluated in priority order

3. **Manual testing:**
   - Create rule via admin UI
   - Preview rule against sample data
   - Verify evaluation in analytics API response

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Rules CRUD works correctly
- [ ] Rule engine evaluates conditions correctly
- [ ] Narrative templates render correctly
- [ ] Admin UI accessible and functional
- [ ] Builder + runtime tested manually
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

