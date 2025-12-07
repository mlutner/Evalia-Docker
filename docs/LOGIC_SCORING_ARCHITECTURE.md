# Logic & Scoring Engine – Architecture Audit

> Generated: 2025-12-05  
> Scope: Type definitions, data flow, guardrails, and identified gaps

---

## 1. Type Definitions

### Logic Types

| Type | Location | Description |
|------|----------|-------------|
| `LogicRule` | `shared/schema.ts:140-145` | Core schema: `{ id, condition, action, targetQuestionId? }` |
| `BuilderLogicRule` | `client/src/components/builder-extensions/INTEGRATION_GUIDE.ts:26-32` | UI extension: adds `questionId`, `conditionLabel`, `actionLabel`, `validity`, `validityMessage` |
| `LogicEvaluationContext` | `src/core/logic/logicEngineV2.ts:20-23` | Runtime context: `{ questions, answers }` |
| `LogicResult` | `src/core/logic/logicEngineV2.ts:25-29` | Evaluation result: `{ nextQuestionId?, action?, matchedRule? }` |

### Scoring Types

| Type | Location | Description |
|------|----------|-------------|
| `SurveyScoreConfig` | `shared/schema.ts:294-308` | Config: `{ enabled, version, categories, scoreRanges, resultsScreen }` |
| `ScoreBandConfig` | `shared/schema.ts` (via `scoreBandSchema`) | Band: `{ id, label, min, max, color?, narrative? }` |
| `ScoringCategory` | `INTEGRATION_GUIDE.ts:36-38` | Derived from `SurveyScoreConfig.categories[number]` |
| `QuestionScoringConfig` | `INTEGRATION_GUIDE.ts:43-50` | Builder-only: `{ scorable, scoreWeight, scoringCategory?, scoreValues?, reverse? }` |
| `ScoreInput` | `src/core/scoring/scoringEngineV1.ts:23-27` | Engine input: `{ questions, responses, scoreConfig? }` |
| `ScoringResult` | `src/core/scoring/scoringEngineV1.ts:29-34` | Engine output: `{ totalScore, maxScore, percentage, byCategory }` |

---

## 2. File Map

### Logic Engine

```
shared/logicEngine.ts           # Re-exports, facade for LogicV2/V3
src/core/logic/logicEngineV2.ts # Default evaluator (production)
src/core/logic/logicEngineV3.ts # Optional/experimental evaluator
client/src/utils/validateLogicRules.ts  # Builder-side sanitizer
```

### Scoring Engine

```
src/core/scoring/scoringEngineV1.ts  # Main scoring implementation
src/core/scoring/strategies.ts      # Engine registry (engagement_v1)
src/core/scoring/resolveBand.ts     # Band resolution from percentage
server/utils/scoring.ts             # Server wrapper (computeSurveyScore)
shared/scoringEngine.ts             # Re-exports for isomorphic usage
```

### Builder UI (Logic)

```
client/src/components/builder-extensions/LogicView.tsx
client/src/components/builder-extensions/logic/LogicRuleList.tsx
client/src/components/builder-extensions/logic/LogicRuleCard.tsx
client/src/components/builder-extensions/logic/LogicRuleEditorPanel.tsx
client/src/components/builder-extensions/logic/LogicQuestionTimeline.tsx
```

### Builder UI (Scoring)

```
client/src/components/builder-extensions/ScoringView.tsx
client/src/components/builder-extensions/scoring/ScoringNavigator.tsx
client/src/components/builder-extensions/scoring/QuestionMappingTable.tsx
client/src/components/builder-extensions/scoring/QuestionScoringInspector.tsx
client/src/components/builder-extensions/scoring/BandEditor.tsx
client/src/components/builder-extensions/scoring/CategoriesList.tsx
```

---

## 3. Data Flow

### Logic Engine – Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ BUILDER (Config Time)                                               │
├─────────────────────────────────────────────────────────────────────┤
│ LogicView → LogicRuleEditor → updateQuestion(id, { logicRules })    │
│                                     │                                │
│                                     ▼                                │
│                       validateLogicRules() sanitizes                │
│                       - Drops rules with invalid questionIds        │
│                       - Normalizes condition format                 │
│                       - Prevents self-skip                          │
│                                     │                                │
│                                     ▼                                │
│                       question.logicRules stored in state           │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ saveSurvey() → API
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE                                                            │
├─────────────────────────────────────────────────────────────────────┤
│ surveys.questions (JSONB) → each question has logicRules[]         │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ GET /api/surveys/:id
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ RUNTIME (SurveyView)                                                │
├─────────────────────────────────────────────────────────────────────┤
│ On answer submit:                                                   │
│   1. evaluateLogicRules(question.logicRules, { questions, answers })│
│   2. Returns { nextQuestionId, action }                             │
│   3. If action='skip' → jump to nextQuestionId                      │
│   4. If action='end' → end survey immediately                       │
│   5. If action='show' → conditionally show question                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Scoring Engine – Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ BUILDER (Config Time)                                               │
├─────────────────────────────────────────────────────────────────────┤
│ ScoringView → Inspector → setQuestionScoring(id, config)           │
│                                     │                                │
│                                     ▼                                │
│                       Updates question.scorable, scoreWeight,       │
│                       scoringCategory, optionScores                 │
│                                     │                                │
│ ScoringNavigator → BandEditor → updateScoringBand(band)            │
│                                     │                                │
│                                     ▼                                │
│                       Updates scoreConfig.scoreRanges[]             │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ saveSurvey() → API
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE                                                            │
├─────────────────────────────────────────────────────────────────────┤
│ surveys.questions (JSONB) → scorable, scoreWeight, optionScores    │
│ surveys.score_config (JSONB) → categories, scoreRanges, enabled    │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ POST /api/surveys/:id/responses
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ RESPONSE SUBMISSION                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ 1. If scoreConfig.enabled:                                          │
│      score = computeSurveyScore({ survey, responses })              │
│      band = resolveBand(score.percentage, scoreRanges)              │
│ 2. Store response with scoring metadata                             │
│ 3. Return { ...response, scoring, band } to client                  │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ RESULTS DISPLAY                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ If resultsScreen configured → show ResultsScreen with band/scores  │
│ Otherwise → show ThankYouScreen                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Current Guardrails

### Logic Guardrails

| Guardrail | Location | Description |
|-----------|----------|-------------|
| `validateLogicRules()` | `client/src/utils/validateLogicRules.ts` | Sanitizes rules on question update |
| Condition parsing | Same | Validates `answer("qId") op value` format |
| Self-skip prevention | Same | Drops rules where targetQuestionId === questionId |
| Invalid target check | Same | Drops rules targeting non-existent questions |
| Duplicate rule ID check | Same | Deduplicates by rule.id |

### Scoring Guardrails

| Guardrail | Location | Description |
|-----------|----------|-------------|
| `clampScoreWeight()` | `SurveyBuilderContext.tsx` | Limits weight to 0-10 range |
| `sanitizeOptionScores()` | `SurveyBuilderContext.tsx` | Clamps option scores to 0-100 |
| `normalizeScoringConfig()` | `client/src/utils/normalizeScoringConfig.ts` | Sets defaults for missing fields |
| Engine fallback | `scoringEngineV1.ts:141-143` | Falls back to engagement_v1 if unknown engine |

---

## 5. Identified Risks & Gaps

### 🔴 Critical Gaps

| Gap | Risk | Recommendation |
|-----|------|----------------|
| **No loop detection** | Skip rules could create infinite loops (Q2→Q1→Q2) | Add graph-based cycle detection |
| **No unreachable question check** | Questions may never be shown due to logic | Build question graph, detect isolated nodes |
| **No dead-end detection** | Survey may not reach completion | Verify all paths lead to final question or END |
| **No band coverage validation** | Score ranges may have gaps (0-60, 80-100 missing 61-79) | Validate bands cover 0-100 without gaps |
| **No band overlap check** | Two bands may claim same score range | Detect overlapping min/max ranges |
| **Score config versioning missing** | Historical scores can change if admin edits config | Snapshot config version per response |

### 🟡 Medium Gaps

| Gap | Risk | Recommendation |
|-----|------|----------------|
| **No conflict detection** | Multiple rules on same trigger with different actions | Warn if same condition leads to different outcomes |
| **No backwards jump warning** | Skip to earlier question could confuse users | Tag backwards jumps; decide if allowed |
| **Missing category validation** | Scorable questions without category assignment | Warn if question.scorable but no scoringCategory |
| **Unused category detection** | Categories defined but no questions mapped | Warn if category has 0 mapped questions |

### 🟢 Minor Gaps

| Gap | Risk | Recommendation |
|-----|------|----------------|
| **No max questions per survey** | Surveys with 1000+ questions could slow runtime | Add soft/hard limit (e.g., 200) |
| **Weight imbalance warning** | One question with weight=10, rest weight=1 skews results | Flag suspicious weight distributions |
| **Condition syntax validation** | Malformed conditions silently fail | Surface parse errors to user |

---

## 6. Next Steps

1. **Logic Validator Module** (`client/src/utils/logicValidator.ts`)
   - Build question graph from survey
   - Detect cycles, unreachable nodes, dead ends
   - Return structured `LogicValidationResult[]`

2. **Scoring Validator Module** (`client/src/utils/scoringValidator.ts`)
   - Validate band coverage (no gaps, no overlaps)
   - Check category usage (no orphans)
   - Warn on weight imbalance

3. **Pre-Save Validation Hook**
   - Call both validators before `saveMutation`
   - Surface errors in builder UI

4. **Score Config Versioning** (future)
   - Snapshot `scoreConfig` on publish
   - Link responses to version ID
   - Immutable historical scores

---

## Appendix: Condition Syntax

The logic engine parses conditions in this format:

```
answer("questionId") operator value
```

| Operator | Meaning |
|----------|---------|
| `==` | Equals |
| `!=` | Not equals |
| `<` | Less than |
| `<=` | Less than or equal |
| `>` | Greater than |
| `>=` | Greater than or equal |

**Example:** `answer("q1_role") == "Manager"`

