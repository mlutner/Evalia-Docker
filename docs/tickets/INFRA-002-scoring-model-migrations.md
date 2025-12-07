# INFRA-002: Migrations for Scoring Model Updates

## Priority: LOW (Future)
## Status: Backlog - Structural Gap
## Category: Scoring Infrastructure

---

## Problem Statement

Dynamic scoring models must be snapshot-based. We need structured migrations so a breaking scoring model change doesn't break historical analytics.

Currently:
- Scoring config is versioned per-survey
- But global model changes (band definitions, dimension weights) have no migration path
- A change to `INDEX_BAND_DEFINITIONS` affects all historical data interpretation

---

## Proposed Solution

### Model Version Snapshots

```typescript
interface ScoringModelVersion {
  version: string;                  // "1.0.0"
  effectiveDate: Date;              // When this became active
  bandDefinitions: IndexBandDefinition[];
  dimensionWeights: Record<string, number>;
  calculationRules: CalculationRules;
}

// Version history
const SCORING_MODEL_VERSIONS: ScoringModelVersion[] = [
  {
    version: "1.0.0",
    effectiveDate: new Date("2024-01-01"),
    // ... original definitions
  },
  {
    version: "1.1.0",
    effectiveDate: new Date("2024-06-01"),
    // ... updated definitions with migration
  }
];
```

### Migration Scripts

```typescript
interface ScoringMigration {
  fromVersion: string;
  toVersion: string;
  
  // How to migrate a response's scores
  migrateScores(oldScores: ScoreResult): ScoreResult;
  
  // How to migrate band assignments
  migrateBands(oldBands: BandResult): BandResult;
}
```

---

## Use Cases

### 1. Band Threshold Change

**Scenario**: "Thriving" threshold changes from 80 to 75

**Without migration**: Historical "Performing" scores suddenly become "Thriving"

**With migration**: 
- Scores calculated before change date use old thresholds
- Scores after change date use new thresholds
- Export/reports indicate which model version

### 2. New Dimension Added

**Scenario**: Add "Growth" as 6th dimension

**Migration**:
- Old surveys continue with 5D calculation
- New surveys can opt into 6D
- Analytics handles both gracefully

---

## Acceptance Criteria

- [ ] Model versions are tracked
- [ ] Scores store which model version they used
- [ ] Historical analytics use original model version
- [ ] Migration path defined for breaking changes
- [ ] Documentation for model updates

---

## Implementation Notes

### Files to Create
- `shared/scoring/modelVersions.ts` - Version definitions
- `shared/scoring/migrations/*.ts` - Migration scripts
- `server/jobs/scoringMigration.ts` - Background migration runner

### Data Schema Changes
```sql
ALTER TABLE survey_responses 
ADD COLUMN scoring_model_version VARCHAR(20);
```

---

## Related Tickets
- INFRA-001: Scoring Engine Registry
- SCORE-001: Scoring Versioning

