---
trigger: always_on
---

lwaysApply: true
---
# Evalia – Cursor Project Rules (Compact v2025-12)

You are editing **Evalia**, an AI-assisted survey platform (React + Express) with deterministic scoring, logic, analytics dashboards, and strict AI/security guardrails.

Goal: **small, safe, targeted diffs** that respect existing architecture.

---

## 0. Workflow for Every Ticket

1. **Understand**
   - Skim ticket + relevant docs (`docs/architecture/`, `docs/flows/`, `docs/scoring/SCORING_MODEL_OVERVIEW.md`, `docs/LOGIC_SCORING_ARCHITECTURE.md`, analytics docs).
   - Identify affected flow(s): Builder, Runtime, Scoring, Logic, Analytics, Theme, Admin, Dev tools.

2. **Plan (in chat)**
   - List: files to touch, data shapes, tests/docs to update.
   - Keep scope narrow (1–3 files if possible).

3. **Implement**
   - Make the **smallest diff** that satisfies the ticket.
   - Do not reformat or “clean up” unrelated code.

4. **Validate**
   - Run relevant tests when touching:
     - `src/core/scoring/*`, `src/core/logic/*`
     - `shared/schema.ts`, `shared/analytics*.ts`
     - `server/utils/analytics.ts`, `server/routes/analytics.ts`
     - `client/src/pages/AnalyticsPage.tsx`
     - `client/src/contexts/SurveyBuilderContext.tsx`
     - `client/src/components/builder-extensions/*`
     - `client/src/utils/*Validator.ts`
   - If tests aren’t run, say so explicitly.

5. **Document**
   - Update `docs/BUILD_LOG.md` with ticket + summary + key files.
   - Add TODO notes if flow/UX diagrams or analytics docs need future updates.

6. **Summarize**
   - What changed / **did not** change (invariants).
   - Tests run / not run.
   - Any follow-ups needed.

---

## 1. Core Invariants (Do Not Break)

### 1.1 Scoring

- Deterministic, **non-AI**.
- Engines live in `src/core/scoring/strategies.ts` (e.g. `engagement_v1`).
- If `scoreConfig.enabled !== true` → **no scoring**.
- Do **not** introduce:
  - Randomness, adaptive runtime scoring, or AI-generated scores.

### 1.2 Logic

- Driven only by `LogicRule` in `src/core/logic/*` (e.g. logicEngineV2/V3).
- No side effects in evaluation, no AI modifying runtime branching.

### 1.3 SurveyView Results Branching

**Never change this:**

- In `SurveyView`:
  - If `resultsScreen.enabled` **and** scoring payload exists → show ResultsScreen.
  - Else → ThankYou screen.

### 1.4 AI Guardrails

AI may **generate**:

- Questions, templates.
- Scoring **config shapes** (categories, bands, narratives) – not scores.
- Welcome/thank-you/results text.
- Tag suggestions (canonical tags only).

AI may **NOT** generate/modify:

- `score`, `scores`, `totalScore`, `percentage`, `band`, `bands`, `scoringEngineId`, or any respondent score fields.

All AI endpoints:

- Use Zod schemas + forbidden-field scan.
- Must not bypass existing guards.

---

## 2. ScoreConfig Versioning (SCORE-001/002)

- `score_config_versions` is the **only** source of truth for historical scoring configs.
- On publish (status → Active, scoring enabled):
  - Create new `score_config_versions` row if config changed.
  - Auto-increment per survey.
  - Previous versions immutable.

Each **scored response**:

- Must reference a `score_config_version_id` valid at submission time.
- Must **not** be reinterpreted with new configs.

Band schema:

- Uses `min` / `max` (not `minScore` / `maxScore`).
- Scoring/analytics must respect this.

Any change to versioning or band semantics:

- Requires a `SCORE` ticket + tests proving old responses still resolve correctly.

---

## 3. Scoring Model & Insight Dimensions

### 3.1 Two-Layer Model

Conceptual pipeline:

```txt
Categories (builder) → Dimensions (configurable) → Indices (fixed) → Bands
Indices & dimensions are first-class, per SCORING_MODEL_OVERVIEW.md.

MODEL-001 (Scoring Model Registry) will be future source of truth.

Until then, do not invent new index IDs or repurpose existing ones.

3.2 Evalia Insight Dimensions
Canonical 5 Insight Dimensions:

leadership-effectiveness

team-wellbeing

burnout-risk

psychological-safety

engagement

Burnout rules:

Lower score = better outcome.

Raw scores/bands normal; trend/performance interpretation must invert sign for burnout only.

4. Analytics & Dashboards
4.1 Modes & Routing
useDashboardMode() chooses between:

Insight Dimensions (5D surveys)

7 tabs: Insights Home | Dimensions | Managers | Trends | Questions | Responses | Benchmarks.

Generic Scoring

Category-based analytics for non-5D scored surveys.

Basic

No scoring → participation + question-level analytics only (no tabs).

Mode is derived from scoreConfig.enabled + categories (including canonical IDs). Do not hard-code mode in random components.

4.2 Analytics State / Confidence
analyticsState.ts:

deriveAnalyticsScoringState() → no-responses, no-scoring, misconfigured-scoring, single-version, healthy.

AnalyticsPage uses this to:

Show banners / “scoring disabled” / “misconfigured” messages.

Avoid rendering misleading charts.

Do not “hide” misconfigurations or fake data for pretty charts.

4.3 Security
All /api/analytics/* endpoints:

Must be behind existing auth middleware.

Must enforce survey ownership/tenant rules.

No anonymous analytics endpoints.

4.4 Golden Fixtures
Analytics golden fixtures live under server/__tests__/fixtures/analyticsFixtures.ts.

Tests count on exact expected values.

If fixtures change:

Update expectations and document in BUILD_LOG.md.

5. Validation & Publish Flow
5.1 Validators
logicValidator.ts: graph-based checks (missing targets, cycles, unreachable questions, conflicts).

scoringValidator.ts: band coverage (0–100), overlaps, category usage, weights, option scores.

surveyValidator.ts: validateSurveyBeforePublish() → unified result.

Validators:

Must report, not silently mutate or “fix” data.

5.2 Save/Publish Behaviour
SurveyBuilderContext.saveSurvey():

Calls validateSurveyBeforePublish().

Blocks save on errors (unless skipValidation: true).

BuilderActionBar:

Shows ValidationIssuesModal.

“Save anyway” only for warnings.

Do not bypass or weaken this gating behaviour.

6. Protected Areas (Surgical Only)
Do not change behaviour here without explicit ticket naming the file:

Scoring core:

src/core/scoring/*, computeSurveyScore, resolveBand.

Logic core:

src/core/logic/*, logic engine registry.

Schema & theme:

shared/schema.ts, shared/theme.ts.

Versioning & responses:

score_config_versions schema/migrations.

Response score_config_version_id fields.

server/storage.ts, server/routes/surveys.ts, server/routes/responses.ts.

Validation:

client/src/utils/*Validator.ts

client/src/contexts/SurveyBuilderContext.tsx (load/save/publish).

client/src/components/builder-v2/BuilderActionBar.tsx.

Runtime branching:

The ResultsScreen vs ThankYou logic in SurveyView.

You may fix obvious bugs or types here, but not alter core semantics.

7. Builder Extensions & Design-Locked UI
Design-locked (Magic Patterns) components:

Shared: QuestionHeader, RightPanelLayout.

Scoring: QuestionScoringSection, ScoringView, QuestionMappingTable, QuestionMappingRow, QuestionMappingBulkBar, QuestionScoringInspector, CategoriesList, CategoryScoringInspector, BandsTable, BandEditor, BandRecommendationItem, ScoringSummaryPanel.

Logic: LogicView, LogicRuleList, LogicRuleCard, LogicRuleEditorPanel, LogicQuestionTimeline.

You may:

Wire new props/callbacks.

Adjust copy and labels.

You may not:

Change layout/structure/spacing or Tailwind scaffolding without a design-specific ticket.

Builder scoring state:

Lives in SurveyBuilderContext as:

scoringByQuestionId, scoringCategories, scoringBands.

Updaters: setQuestionScoring, updateScoringCategory, updateScoringBand, deleteScoringBand.

Use these instead of inventing new stores.

INTEGRATION_GUIDE.ts:

Bridge types between builder and shared schema (e.g. QuestionScoringConfig, BuilderScoreBand).

Keep aligned; do not invent new shapes casually.

8. Dev Tools & Security
Dev-only tooling includes:

/dev/inspector

/dev/analytics-inspector

/dev/scoring-debug (/api/dev/scoring-trace)

SurveyDebugPanel, ScoringDebugSection

Dev-only analytics inspector pages

Rules:

Gated by VITE_ENABLE_DEV_TOOLS or import.meta.env.DEV and auth in any shared environment.

Production: dev tools disabled by default.

Dev endpoints must not expose PII/free-text in logs.

You can:

Improve debug UX.

Fix unused imports/dead code.

You cannot:

Move dev features into public routes without a ticket + security review.

9. Env & Deployment Hygiene
.env must be gitignored; only .env.example (or similar) is committed.

Dockerfile:

Default VITE_ENABLE_DEV_TOOLS=false.

Prefer npm ci --omit=dev in production images unless tests require otherwise (then use multi-stage builds).

10. “Stop and Ask” Triggers
Before implementing, pause and propose a design in chat if the change needs:

New DB tables or migrations.

New question types.

New scoring or logic engines.

New public API endpoints.

Changes in shared/schema.ts.

Changes to SurveyView results branching or results runtime.

Keep proposals short, tied to the ticket, and aiming for the smallest viable implementation. When unsure, be conservative and reversible.