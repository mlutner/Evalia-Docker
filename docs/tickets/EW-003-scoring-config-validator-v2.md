# EW-003: Scoring Config Validator v2

## Priority: HIGH
## Status: Planned
## Category: Scoring Infrastructure

---

## Problem Statement

The existing scoring validator is insufficient. The golden test experience revealed:

- Band rule mismatches weren't caught
- Missing category mappings can still pass "enabled" scoring  
- Invalid weights (0, negative, nonsense) don't throw errors
- Questions missing `scorable`, `optionScores`, or `scoringCategory` don't error during build

This allows broken templates to reach production and break dashboards.

---

## Requirements

### 1. Full Validation of Every Unit in scoreConfig

```typescript
interface ScoreConfigValidation {
  // Validate all required fields exist
  validateCategories(): ValidationResult;
  validateBands(): ValidationResult;
  validateWeights(): ValidationResult;
  validateQuestions(): ValidationResult;
}
```

### 2. Strict Category → Dimension → Index Dependency Checks

- Every category must map to exactly one dimension
- Every dimension must have at least one category
- Index calculations must have all required dimensions
- No orphan categories or dimensions

### 3. Template-Level Scoring Sanity Rules

- Weights must be positive numbers (> 0)
- Weights should sum to reasonable total (warning if > 2x expected)
- Band thresholds must be non-overlapping
- Band thresholds must cover full 0-100 range
- optionScores must match option count
- scoringCategory must reference existing category

---

## Acceptance Criteria

- [ ] Validator catches all issues found in golden test
- [ ] Validator runs on template save (builder)
- [ ] Validator runs on template import
- [ ] Clear error messages with specific fix instructions
- [ ] No false positives on valid 5D templates
- [ ] Integrates with existing validation pipeline

---

## Implementation Notes

### Files to Modify
- `shared/schema.ts` - Add validation types
- `client/src/utils/surveyValidator.ts` - Extend validation
- `server/routes/surveys.ts` - Add server-side validation
- `docs/scoring/VALIDATION.md` - Document validation rules

### Test Coverage
- Unit tests for each validation rule
- Integration tests with golden fixtures
- Edge case tests (empty, partial, malformed configs)

---

## Related Tickets
- EW-004: Template Scoring Auto-Heal
- ANAL-QA-010: Golden Fixtures Unit Tests

