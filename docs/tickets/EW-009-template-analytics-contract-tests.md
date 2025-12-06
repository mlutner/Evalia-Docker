# EW-009: Template → Analytics Contract Mapping Test Suite

## Priority: HIGH
## Status: Planned
## Category: Testing Infrastructure

---

## Problem Statement

Golden fixtures caught issues, but templates will be the real battlefield. For every template, we need automated verification that the template → analytics contract is valid.

---

## Test Suite Requirements

### For Every Template, Auto-Generate:

1. **Dry-Run Scoring Calculation**
   - Use `calculateSurveyScores` with mock responses
   - Verify no runtime errors

2. **Verify Categories Exist**
   - All referenced categories in scoreConfig
   - All scoringCategory values on questions

3. **Verify Bands Exist**
   - Band definitions for each index type
   - Thresholds are valid (0-100, non-overlapping)

4. **Verify Scoring Engine Assigned**
   - scoreConfig.scoringEngineId is set
   - Engine ID is valid/known

5. **Verify Dashboard Mode Determinable**
   - Can infer or read dashboardMode
   - Mode is appropriate for categories

6. **Verify Analytics Helpers Respond**
   - `useParticipationMetrics` returns valid data
   - `useIndexDistribution` returns valid data
   - All hooks handle template correctly

---

## Implementation

### Test Generator

```typescript
// Generate tests for a template
function generateTemplateContractTests(template: Template): TestSuite {
  return {
    name: `Template Contract: ${template.name}`,
    tests: [
      {
        name: "scoring calculation succeeds",
        fn: () => testScoringCalculation(template)
      },
      {
        name: "all categories exist",
        fn: () => testCategoriesExist(template)
      },
      {
        name: "all bands exist", 
        fn: () => testBandsExist(template)
      },
      // ... etc
    ]
  };
}
```

### CI Integration

```yaml
# .github/workflows/template-contracts.yml
jobs:
  template-contracts:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Template Tests
        run: npm run generate:template-tests
      
      - name: Run Template Contract Tests
        run: npm run test:template-contracts
```

---

## Acceptance Criteria

- [ ] Test generator creates tests for any template
- [ ] All 6 verification categories covered
- [ ] CI runs on PR for template changes
- [ ] Clear failure messages
- [ ] Prevents broken templates from merging
- [ ] Runs in < 30 seconds

---

## Implementation Notes

### Files to Create
- `scripts/generate-template-tests.ts` - Test generator
- `shared/__tests__/templateContracts.test.ts` - Generated tests
- `shared/utils/templateContractValidator.ts` - Validation logic

### Test Data
- Use existing seeded templates
- Generate mock responses programmatically
- Cover edge cases (empty, single question, 100 questions)

---

## Related Tickets
- EW-003: Scoring Config Validator v2
- ANAL-QA-010: Golden Fixtures Unit Tests

