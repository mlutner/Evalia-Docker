# Build Log

Short, dated notes for significant architecture or builder/runtime changes.

- 2025-12-06 (PM): **ANAL-REG-001 – Restore 5D Analytics Dashboard**
  - **Ticket**: ANAL-REG-001
  - **Branch**: `feature/5d-analytics-restore` (from `main`, donor: `feature/builder-scoring-logic-modes`)
  - **Change**: Restored full 5D analytics infrastructure from donor branch.
  - **Files added** (45+ files):
    - **Shared types**: `analytics.ts`, `analyticsBands.ts`, `analyticsConfidence.ts`
    - **Server**: `routes/analytics.ts`, `utils/analytics.ts`
    - **Client hooks**: `useDashboardMode.ts`, `analyticsState.ts`
    - **Analytics components** (28 files): `DimensionLeaderboardTable`, `IndexDistributionChart`, `BandDistributionChart`, `DimensionTrendsChart`, `BeforeAfterComparisonChart`, `ManagerComparisonTable`, `QuestionSummaryTable`, `TopBottomItemsCard`, etc.
    - **AnalyticsPage.tsx**: Replaced with 7-tab IA + 3-mode dashboard
  - **Routes wired**: `/api/analytics/:surveyId/:metricId`
  - **Dashboard modes**: `insight-dimensions` (5D), `generic-scoring`, `basic`
  - **Build status**: ✅ Passed
  - **Tests**: Pre-existing vitest setup path issue prevents test execution


- 2025-12-06 (PM): **RESULTS-001 – ResultsScreen vs ThankYou Branching Fix**
  - **Ticket**: RESULTS-001
  - **Change**: Fixed runtime branching to follow canonical rule: show ResultsScreen only when `scoreConfig.enabled` AND scoring calculation succeeds (produces valid results).
  - **File changed**: `client/src/pages/SurveyView.tsx`
    - Added `scoringPayload` state to store calculated results
    - Scoring computed in `onSuccess` callback with error handling
    - Branching condition: `showResults = scoreConfig?.enabled && scoringPayload !== null`
  - **Scenarios covered by tests** (in `SurveyView.results.test.tsx`):
    1. Scoring enabled + valid results → ResultsScreen
    2. Scoring disabled → ThankYou
    3. Scoring enabled + null results → ThankYou
    4. Scoring throws error → ThankYou (graceful fallback)
  - **TODO**: Fix pre-existing vitest path configuration issue to run tests.

- 2025-12-06 (PM): **Docker Production + Security Hardening**
  - Fixed Docker production build: separated `vite.ts` from `static.ts` to avoid bundling vite in production; updated Dockerfile paths.
  - Security: added `isAuthenticated` + `devToolsGate` middleware to all `/api/ai/test/*` routes; routes now require auth and are disabled in production unless `ENABLE_AI_MONITORING=true`.
  - Environment: added `VITE_ENABLE_DEV_TOOLS=false` and `ENABLE_AI_MONITORING=false` to Dockerfile defaults and `.env`.
  - Documentation: created `docs/TICKETS.md` with prioritized backlog of 18 upcoming tickets extracted from roadmaps.
  - Docker running on `localhost:4000` with PostgreSQL.

- 2025-12-09: **Evalia Build Log – Major Update Summary**
  - Core architecture: unified rendering pipeline (Builder → Runtime → QuestionRenderer) plus refactored adapters with validation/normalization.
  - Logic V2: logicRules schema, structured QuestionLogicEditor UI, deterministic evaluator, and AI suggestion hooks scaffolded.
  - Scoring V1: pure scoring engine (weights, optionScores, categories, synthetic max previews) and new ScoringPanel wiring.
  - Results: ResultsScreen + ResultsConfigPanel with bands/narratives/category configs and Preview flow switching to Results → Thank You.
  - Builder robustness: undo/redo stack, validation/normalization guards, integrity checks, safe defaults, audit logging flag, infinite-loop protection.
  - Testing: scoring, adapter round-trip, and results integration coverage.
  - Templates: flagship 31-item Canada Engagement Survey and Pulse variant seeded.
  - Backend prep: designed scoring controller/response schema/band resolver for server integration.

- 2025-12-08: **Evalia – Recent Updates (Build Log Summary)**
  - Scoring engine: versioned `engagement_v1` with category weights, optionScores, bands, and deterministic pipeline; scores/bands stored on submit.
  - Results framework: layouts (simple/bands/dashboard), category breakdowns, band narratives, CTA config, and runtime branch to ResultsScreen.
  - Builder scoring panel: enables scoring, category mappings, weights, and band configuration in the V2 flow.
  - Template library: 31 templates normalized with canonical categories/tag taxonomy; leadership assessment template validated with scoring narratives.
  - Data + ops: DB seeds/migrations verified (JSON parsing fixes) and Docker environment stabilized for database access/app rebuilds.

- 2025-12-06: Captured the logic/scoring engine architecture (default `logicEngineV2`, optional `LogicV3`, and active `engagement_v1` scorer) and documented the AI endpoint surface plus template tag stats via the dev inspector so the current engines and catalog signals stay discoverable.
- 2025-12-07: Snapshot of the recent architecture hardening: AI guardrails/restoration (`aiService` with canonical tags + schema enforcement), LogicV3 added alongside default V2, scoring registry frozen (`engagement_v1`), deterministic resultsScreen/scoring flow, builder wiring for scoring/logic/results, design preview hardening, canonical template tags, expanded tests, and outstanding cleanup tasks captured in `ARCHITECTURE_SNAPSHOT.md`.
- 2025-12-05: Added a development-only `/dev/inspector` with snapshots of scoring engines, logic engines, AI endpoints, and template catalog stats; introduced scoring/logic registry modules for reuse.
- 2025-12-04: Added architecture index, builder-v2/core READMEs, and a dev-only Survey Debug panel that exposes survey state, scoring config, thank-you/results settings, and logic for quick inspection.
- 2025-12-03: Captured a comprehensive CHANGELOG plus a SurveyBuilderV2 snapshot of current flows and contracts to stabilize the 3-panel builder baseline.
- 2025-12-02: Hardened builder/preview flows: ensured design settings persist across pages, moved context sync outside setState to avoid runtime errors, set rating defaults, improved slider and NPS labels, and standardized preview sizing with auto-save.
- 2025-11-28: Logged completion of the AI integration program (expert personas, chain-of-thought refinement, JSON schema enforcement, and model routing for generation/refinement/analysis endpoints) to anchor the current AI architecture baseline.
- 2025-11-25: Initial marketing/insights experience refresh with optimized images, card slider for platform features, and analytics mockups showcased across the landing surfaces.
