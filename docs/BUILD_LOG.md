# Build Log

Short, dated notes for significant architecture or builder/runtime changes.

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
