# INFRA-001: Scoring Engine Registry

## Priority: LOW (Future)
## Status: Backlog - Structural Gap
## Category: Scoring Infrastructure

---

## Problem Statement

We have the versioning infrastructure from SCORE-001, but no registry allowing multiple scoring engines:

- `engagement_v1` - Current 5D engagement model
- `wellbeing_v1` - Future wellbeing-focused surveys
- Future domain-specific engines

Without a proper registry, adding new scoring models requires ad-hoc code changes.

---

## Proposed Registry Interface

```typescript
interface ScoringEngineDefinition {
  id: string;                    // "engagement_v1"
  name: string;                  // "Engagement Model v1"
  version: string;               // "1.0.0"
  
  // What this engine produces
  indexTypes: string[];          // ["engagement-5d"]
  dimensions: string[];          // ["purpose", "autonomy", ...]
  
  // How to calculate
  calculateScore: (survey: Survey, response: Response) => ScoreResult;
  
  // Band definitions
  bandDefinitions: IndexBandDefinition[];
  
  // Dashboard compatibility
  compatibleDashboards: DashboardMode[];
}

// Registry singleton
const ScoringEngineRegistry = {
  register(engine: ScoringEngineDefinition): void;
  get(id: string): ScoringEngineDefinition | null;
  list(): ScoringEngineDefinition[];
  getDefault(): ScoringEngineDefinition;
};
```

---

## Use Cases

### 1. Adding a New Scoring Domain

```typescript
// Define new wellbeing engine
const wellbeingEngine: ScoringEngineDefinition = {
  id: "wellbeing_v1",
  name: "Wellbeing Assessment",
  dimensions: ["physical", "mental", "social", "financial"],
  // ...
};

// Register it
ScoringEngineRegistry.register(wellbeingEngine);
```

### 2. Survey Template Association

```typescript
interface SurveyScoreConfig {
  scoringEngineId: string;  // "engagement_v1" | "wellbeing_v1"
  // ... other config
}
```

### 3. Analytics Routing

```typescript
function getAnalyticsComponents(engineId: string) {
  const engine = ScoringEngineRegistry.get(engineId);
  return engine?.compatibleDashboards || ["basic"];
}
```

---

## Acceptance Criteria

- [ ] Registry interface defined
- [ ] engagement_v1 migrated to registry
- [ ] Template builder shows engine selector
- [ ] Analytics uses registry for dashboard routing
- [ ] Documentation for adding new engines

---

## Implementation Notes

### Files to Create
- `shared/scoring/registry.ts` - Registry implementation
- `shared/scoring/engines/engagement_v1.ts` - Current engine
- `docs/scoring/ADDING_ENGINES.md` - Developer guide

### Migration Path
1. Define registry interface
2. Wrap existing logic in engagement_v1 engine
3. Register as default
4. Update consumers to use registry
5. Document extension pattern

---

## Related Tickets
- SCORE-001: Scoring Versioning
- EW-005: Dashboard Mode Classification

