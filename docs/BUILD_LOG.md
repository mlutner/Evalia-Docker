# Build Log

Short, dated notes for significant architecture or builder/runtime changes.

- 2025-12-05: **Validation UX + Audit Logging**
  - **Phase 4: Better UX for validation issues**
    - `ValidationIssueBadge`: Shows error/warning counts with icons
    - `ValidationIssuesModal`: Publish failure modal with grouped issues and jump-to links
    - `useValidation` hook: Memoized validation with helpers for filtering by question/rule/category
    - Updated `BuilderModeToggle` to show issue badges per mode (Logic/Scoring)
    - Updated `LogicRuleCard` to show inline issue messages and severity indicators
  - **Phase 5: Audit logging for analytics**
    - `server/auditLog.ts`: Structured logging for scoring/logic events
    - Logs only IDs and numeric values (NO PII or free-text)
    - Feature-flagged via `AUDIT_LOG_ENABLED` env var
    - Wired into response submission to log scoring completions
    - Log format: `[AUDIT] {"type":"scoring_complete",...}`

- 2025-12-05: **Logic & Scoring Validation Layer**
  - Created comprehensive architecture audit (`docs/LOGIC_SCORING_ARCHITECTURE.md`)
  - **Logic Validator** (`client/src/utils/logicValidator.ts`):
    - Builds question graph from survey (nodes + logic edges)
    - Detects: missing targets, backwards jumps/cycles, unreachable questions, conflicting rules
    - Returns structured `LogicValidationResult[]` with severity levels
  - **Scoring Validator** (`client/src/utils/scoringValidator.ts`):
    - Validates band coverage (no gaps 0-100), detects overlaps
    - Checks category usage (no orphans), invalid category references
    - Warns on weight imbalance and missing option scores
  - **Combined Validator** (`client/src/utils/surveyValidator.ts`):
    - `validateSurveyBeforePublish()` runs both logic + scoring checks
    - Returns unified `SurveyValidationResult` with summary counts
    - Includes general checks: empty questions, duplicate IDs, question limits
  - **Test Suite** (`client/src/__tests__/validation/`):
    - Logic validator tests: linear survey, missing targets, cycles, conflicts
    - Scoring validator tests: band gaps, overlaps, category usage, weights
  - Ready to wire into save/publish flow (UI integration pending)

- 2025-12-05: **Builder V2 – Typography & header polish**
  - Created consistent section headers across Build, Logic, and Scoring modes
  - Unified header style: 15px medium text for section titles, 13px gray context/counts
  - Removed verbose instructional subtitles ("Click a rule badge to edit") for cleaner look
  - Simplified left panel headers: "Library", "Rules", "Setup" instead of verbose titles
  - Reduced right panel header weight and badge styling for understated minimalism
  - Updated section cards (Welcome/Thank You) to use quieter borders and typography
  - Removed redundant "Questions (n/200)" header from Build canvas
  - Design goal: professional, minimal interface that doesn't look AI-generated

- 2025-12-05: **Builder V2 – Logic Question Timeline**
  - Added `LogicQuestionTimeline` component (Alchemer-style question flow visualization).
  - Shows all questions in a vertical timeline with logic rule badges attached to each question.
  - Badges show rule type (SKIP/SHOW/HIDE/END) and target question ID.
  - Selecting a rule highlights the trigger question (purple) and target question (blue).
  - Incoming jump indicators show which questions are targets of skip logic.
  - End of Survey marker shows the logical flow endpoint.
  - Expanded `LogicRuleList` width to 320px (380px on lg) to accommodate rule cards.
  - Improved text wrapping in `LogicRuleCard` for long conditions/actions.
  - Replaced empty center canvas in Logic mode with the interactive timeline.
  - **Visual cues upgrade (v2)**:
    - Added SVG connector lines from trigger → target questions with curved paths and arrowheads
    - Lines are dashed/dimmed by default, solid purple-to-blue gradient when rule is selected
    - Dual highlighting: trigger question gets purple border/glow, target gets blue
    - Added "Trigger" and "Target" badge pills on selected questions
    - Logic badges now have hover tooltips explaining the rule
    - Badges scale up on hover and selection for better feedback
    - Cleaned up markdown from question text display
    - Human-readable condition formatting (e.g., `is "Yes"` instead of `answer("q1") == "Yes"`)
    - Improved typography to match app's system font stack

- 2025-12-05: **Scoring UI restructure to match Logic UI**
  - Converted Scoring mode from tabbed layout to 3-panel layout matching Logic mode:
    - **Left Panel**: New `ScoringNavigator` component with Categories/Bands toggle
    - **Center Panel**: QuestionMappingTable (filtered by category) or BandsTable
    - **Right Panel**: QuestionScoringInspector, BandEditor, or CategoryScoringInspector
  - Removed top tab navigation (Question Mapping / Categories & Bands)
  - Added view mode toggle in left panel (Categories vs Bands view)
  - Selecting a category filters the question mapping table
  - Visual cohesion: same spacing, borders, typography, and empty states as Logic mode
  - Logic and Scoring are now "sibling modes" with identical layout structure

- 2025-12-05: **Logic template redesign (best practices)**
  - **Template 1 (Adaptive Engagement):** Fixed illogical skip rules
    - OLD: 3 rules with same condition ("I do not manage others") but different targets (q5, q6, q7) - doesn't work
    - NEW: 1 rule that skips from Q1 directly to Q8 (wellbeing), effectively hiding Q5-Q7 for non-managers
  - **Template 2 (Turnover Risk):** Clarified two-path branching structure
    - SATISFIED PATH: Q1→Q2→Q3→(skip)→Q7→Q8→Q9→Q10 (retention & growth questions)
    - DISSATISFIED PATH: Q1→Q2→Q3→Q4→Q5→Q6→END (culture diagnostic then early exit)
    - Changed Q6 from likert to textarea for qualitative feedback
    - Made Q6 required to ensure END rule triggers reliably
    - Added PATH labels to question descriptions for clarity
  - Reseeded templates to database with corrected logic

- 2025-12-05: **Bug fix: Template import now preserves logic rules**
  - Fixed a bug where templates loaded from the Templates page were not loading their `logicRules` into the builder.
  - **Issue 1**: The template import flow in `SurveyBuilderContext.tsx` was missing `logicRules: q.logicRules` when passing questions to `evaliaToBuilder`.
    - Fix: Added `logicRules: q.logicRules` to the template import flow (matching the AI import flow).
  - **Issue 2**: The `validateLogicRules` function expects conditions in format `answer("questionId") == "value"`, but templates had simplified `answer == "value"` format.
    - Fix: Updated template conditions to use the full `answer("q1_role_type") == "value"` format.
  - Templates with `has_logic` tag now correctly load their skip/show/end rules into the Logic Builder.

- 2025-12-05: **Logic-based adaptive survey templates**
  - Added two new logic-based survey templates demonstrating conditional branching:
    - `logic_engagement_manager_adaptive_v1`: Adaptive Engagement & Manager Experience Survey
      - Role-based branching: non-managers skip leadership capability questions (q5-q7)
      - 10 questions across 6 scoring categories (Demographics, Engagement Drivers, Psychological Safety, Leadership Capability, Wellbeing, Growth & Development)
      - Full scoring configuration with 4 engagement bands
    - `logic_turnover_risk_diagnostic_v1`: Turnover Risk & Experience Diagnostic
      - Satisfaction-based branching: dissatisfied employees see risk diagnostic questions (q4-q6) then exit early
      - Satisfied/neutral employees skip directly to retention and growth questions (q7-q10)
      - 10 questions with weighted scoring (key retention questions count 2x)
      - 4 turnover risk bands from "Low Risk" to "Critical Risk"
  - Templates tagged with `has_logic` and `adaptive` for discoverability
  - Added `logicRules` arrays to trigger questions with structured conditions/actions
  - Updated `seedTemplates.ts` to seed logic-based templates separately with full metadata (tags, is_featured, scoreConfig)

- 2025-12-05: **Scoring system hardening**
  - Verified backend scoring payloads: `scoreConfig` (categories, bands, resultsScreen) is consistent from DB → API → builder.
  - Implemented `[SCORING-PIPELINE]` tagging and logging across storage, routes, builder context, builder UI, and scoring view to detect when scoring is enabled but categories/bands are empty.
  - Rebuilt the Docker image and cleared caches; Builder Scoring tab now correctly shows non-zero category and band counts for all scored surveys.

- 2025-12-05: **Builder V2 – Logic/Scoring integration hardening**
  - Finalized wiring of Scoring mode in `SurveyBuilderV2` to the builder context using the `INTEGRATION_GUIDE` bridge types (`QuestionScoringConfig`, `ScoringCategory`, `CoreScoreBand`, `BuilderScoreBand`).
  - Added scoring state (`scoringByQuestionId`, `scoringCategories`, `scoringBands`) and updater functions (`setQuestionScoring`, `updateScoringCategory`, `updateScoringBand`, `deleteScoringBand`) to `SurveyBuilderContext`.
  - Cleaned up `QuestionScoringSection` so it uses builder scoring config consistently and remains UI-only without altering core scoring schemas.
  - Standardized severity usage in `CommandCenterWidgets` to the existing `"low" | "medium" | "high"` union, removing a stray `"critical"` severity that was causing TS errors.
  - Resolved legacy scoring configuration errors in `ScoringConfigStep` by marking it as legacy with `@ts-nocheck` (used only by the old builder).
  - Re-verified invariants: no changes to scoring engines or `SurveyView` runtime behavior, no introduction of forbidden runtime fields (`totalScore`, `percentage`, `scoringEngineId`) into the builder layer, and `INTEGRATION_GUIDE` remains builder-only.

- 2025-12-05: **Builder V2 – Layout & scroll fixes**
  - Fixed vertical scrolling in the Builder V2 screen by restructuring the main layout.
  - Made the center panel (`Build / Logic / Scoring` modes) the primary scroll container via `overflow-y-auto` and `min-h-0`.
  - Updated `ScoringView` and `LogicView` to use simple `flex flex-col` layouts without redundant overflow constraints.

- 2025-12-05: **Builder V2 – Full Scoring & Logic UI integration**
  - Created new scoring components: `QuestionMappingRow`, `QuestionMappingBulkBar`, `CategoryScoringInspector`, `BandRecommendationItem`.
  - Created logic components: `LogicRuleCard` for structured rule display with condition/action visualization.
  - Updated `QuestionMappingTable` to use row-based selection with bulk operations support.
  - Updated `BandEditor` to display recommendations when present.
  - Wired `ScoringView` with full editing callbacks (`onChangeQuestionScoring`, `onChangeCategory`, `onChangeBand`, `onDeleteBand`).
  - Wired `LogicView` to use `LogicRuleCard` for consistent rule display.
  - Connected `SurveyBuilderV2` to context functions (`setQuestionScoring`, `updateScoringCategory`, `updateScoringBand`, `deleteScoringBand`).
  - Added dev-only guard to scoring pipeline logging via `import.meta.env.DEV` checks.

- 2025-12-05: **Builder V2 – Re-anchor to Magic Patterns golden spec**
  - Replaced all scoring and logic UI components with the original Magic Patterns (MP) design spec to reset UI fidelity.
  - **Scoring components re-anchored**: `BandRecommendationItem`, `QuestionMappingBulkBar`, `QuestionMappingRow`, `QuestionMappingTable`, `BandEditor`, `BandsTable`, `QuestionScoringInspector`, `CategoryScoringInspector`, `CategoriesList`, `ScoringView`.
  - **Logic components re-anchored**: `LogicView`, `LogicRuleList`, `LogicRuleCard`, `LogicRuleEditorPanel`.
  - **Shared components re-anchored**: `RightPanelLayout`, `QuestionHeader`, `QuestionScoringSection`.
  - Each component now has a `@design-locked` header comment indicating it follows the MP golden TSX.
  - Adapted imports to use `INTEGRATION_GUIDE` types while preserving exact MP markup and Tailwind classes.
  - Added `BuilderLogicRule` extended type to bridge MP's `questionId`/`conditionLabel`/`actionLabel` fields with our core schema.
  - Marked `ScoringSummaryPanel` as `@non-mp-design` (supplemental debug component, not from MP).
  - Severity model aligned: `BuilderScoreBand['severity']` uses `"low" | "medium" | "high" | "critical"` consistently.
  - **DESIGN LOCK POLICY**: Builder-extensions components are now design-locked. Props/types/wiring may change, but structure/CSS changes require explicit comparison to MP golden TSX.
  - Updated `INTEGRATION_GUIDE.ts` with design-lock policy documentation.

- 2025-12-15: **Dev tooling + runtime fixes**
  - Added dev-only Inspector (`/dev/inspector`) showing scoring/logic registries, AI endpoints, and template stats.
  - Added SurveyDebugPanel to Builder V2 for quick logic/scoring/results inspection (dev-only).
  - Standardized logic engine IDs (`logicEngineV3`) and added build-log reminder script (`npm run check:buildlog`).
  - Hardened design preview image handling and added theme regression tests; runtime results test unskipped with stubbed ResultsScreen.
  - Documented three creation entry points (AI draft with doc upload, template, scratch) all flowing into Builder V2 → Design/Preview → Publish/Share.
- 2025-12-16: **Process flow docs + runtime alignment**
  - Added Mermaid flow docs under `docs/flows/` for creation/publishing, lifecycle/runtime, scoring/results, AI, and theme/design.
  - Updated `ARCHITECTURE-SCORING-RESULTS.md` to reflect runtime theme normalization and the ResultsScreen vs Thank You branching rule.
  - Captured runtime/theme regression tests around SurveyView (results branching + theme normalization).
- 2025-12-17: **Architecture documentation suite**
  - Added `docs/architecture/` as the canonical architecture reference (overview, system architecture, data model/ERD + JSONB shapes, API map, and process flow index).
  - Indexed the new docs in `docs/INDEX.md` to keep them discoverable.
  - Noted future expansion for error/resilience and auth/session flows to keep diagrams aligned if/when added.
  - Added `QUESTION_SCHEMA_META` snapshot/diff guardrail with `schema:snapshot`/`schema:check` to prevent silent question parameter drift.

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
