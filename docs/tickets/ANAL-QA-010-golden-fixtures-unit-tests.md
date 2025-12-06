# Ticket ANAL-QA-010: Golden Fixtures & Analytics Unit Tests

> **Status:** ✅ Implemented  
> **Phase:** Quality Assurance  
> **Priority:** High  
> **Parent Epic:** ANAL-QA-001  
> **Created:** 2025-12-06  
> **Completed:** 2025-12-05

---

## Goal

Create a small, deterministic test dataset and write unit tests for all analytics helpers to prove mathematical correctness.

---

## Part A: Golden Fixtures

### Create Synthetic Dataset

Create a test fixture file with:
- 2 managers (`mgr-001`, `mgr-002`)
- 8-10 survey responses with known answers
- Scores that produce easy-to-hand-calculate results (0, 25, 50, 75, 100)

**Location:** `server/__tests__/fixtures/analyticsFixtures.ts`

```typescript
export const ANALYTICS_TEST_SURVEY = {
  id: 'test-survey-001',
  title: 'Analytics Test Survey',
  questions: [...], // 5-10 questions
  scoreConfig: {
    enabled: true,
    categories: [
      { id: 'leadership', name: 'Leadership', weight: 1.0 },
      { id: 'wellbeing', name: 'Wellbeing', weight: 1.0 },
      // ... maps to 5 dimensions
    ],
    scoreRanges: [...],
  },
};

export const ANALYTICS_TEST_RESPONSES = [
  {
    id: 'resp-001',
    surveyId: 'test-survey-001',
    metadata: { managerId: 'mgr-001', managerName: 'Manager One' },
    answers: { q1: 5, q2: 4, q3: 5, ... }, // Maps to score = 75
    // ... expected dimension scores: leadership=75, wellbeing=80, burnout=20, ...
  },
  // ... 8-10 responses
];

// Hand-calculated expected values
export const EXPECTED_RESULTS = {
  participationMetrics: {
    totalResponses: 10,
    completionRate: 100,
    // ...
  },
  dimensionAverages: {
    leadershipEffectiveness: 72.5,
    teamWellbeing: 68.0,
    burnoutRisk: 35.0, // Lower is better
    psychologicalSafety: 70.0,
    engagement: 74.0,
  },
  managerSummaries: {
    'mgr-001': { avgScore: 75.0, respondentCount: 5, band: 'effective' },
    'mgr-002': { avgScore: 65.0, respondentCount: 5, band: 'developing' },
  },
  // ...
};
```

---

## Part B: Unit Tests

### Test File: `server/__tests__/utils/analytics.test.ts`

Write tests for each analytics helper:

#### 1. `computeParticipationMetrics()`
```typescript
describe('computeParticipationMetrics', () => {
  it('returns correct counts for test dataset', async () => {
    const result = await computeParticipationMetrics('test-survey-001');
    expect(result.totalResponses).toBe(EXPECTED_RESULTS.participationMetrics.totalResponses);
    expect(result.completionRate).toBe(EXPECTED_RESULTS.participationMetrics.completionRate);
  });
  
  it('returns zeros for survey with no responses', async () => { ... });
  it('filters by version when provided', async () => { ... });
});
```

#### 2. `computeQuestionSummary()`
```typescript
describe('computeQuestionSummary', () => {
  it('calculates correct average for numeric questions', async () => { ... });
  it('computes correct distribution for choice questions', async () => { ... });
  it('handles missing answers correctly', async () => { ... });
});
```

#### 3. `computeIndexSummaryByManager()`
```typescript
describe('computeIndexSummaryByManager', () => {
  it('groups responses correctly by manager', async () => { ... });
  it('calculates correct average scores per manager', async () => { ... });
  it('assigns correct bands based on scores', async () => { ... });
});
```

#### 4. `computeIndexTrendsSummary()`
```typescript
describe('computeIndexTrendsSummary', () => {
  it('returns scores for all 5 dimensions', async () => { ... });
  it('calculates correct averages across responses', async () => { ... });
  it('handles single version correctly', async () => { ... });
});
```

#### 5. `computeBeforeAfterIndexComparison()`
```typescript
describe('computeBeforeAfterIndexComparison', () => {
  it('calculates correct change values', async () => { ... });
  it('assigns correct trend direction', async () => { ... });
  it('handles missing previous version', async () => { ... });
});
```

---

## Implementation Notes

### Test Database Setup

Option A: Use in-memory fixtures with mocked DB calls
Option B: Use test database with seed/teardown

**Recommended:** Option A for speed; mock the DB layer and test pure computation logic.

### Mocking Strategy

```typescript
// Mock db module
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    // ... return fixtures
  },
}));
```

---

## Acceptance Criteria

- [ ] Golden fixture file created with hand-calculated expected values
- [ ] Tests pass for all 5 major analytics helpers
- [ ] Tests cover: happy path, empty data, edge cases
- [ ] Tests assert exact numeric values (not just "truthy")
- [ ] CI/CD runs these tests on every PR

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `server/__tests__/fixtures/analyticsFixtures.ts` | Create |
| `server/__tests__/utils/analytics.test.ts` | Create |
| `package.json` | Add test script if needed |

---

**End of Ticket**

