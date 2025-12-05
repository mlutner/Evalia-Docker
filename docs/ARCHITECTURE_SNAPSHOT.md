# Architecture Snapshot (AI, Logic, Scoring, Results)

Concise summary of the recent architecture hardening and feature work across AI, logic, scoring, results, builder, and templates.

## 1) AI System (Restored + Hardened)
- `server/aiService.ts` restored with guardrails and canonical tag enforcement; blocks forbidden scoring fields.
- All AI endpoints validate with Zod schemas (`schemas/ai.ts`) and are limited to configuration/narrative (no score/band computation).
- Prompts reuse guardrail fragments and canonical tag fragment; scoring config generation validates forbidden keys.

## 2) Logic Engine
- `LogicV3` added (supports AND/OR and `contains()`); `logicEngineV2` remains the default wiring.
- Unit tests cover LogicV3 rule matching and safety.

## 3) Scoring Architecture
- Scoring registry with versioned strategies (frozen `engagement_v1`); backend stores `scoringEngineId` on surveys/responses.
- Deterministic band resolution runs in submit flow; scores/bands returned only when scoring is enabled.

## 4) Results System
- `resultsScreen` config implemented (categories, bands, narrative blocks, CTA).
- Runtime switches between Thank You and ResultsScreen (pending final cleanup); tests added with one skip for branch behavior.

## 5) Builder Enhancements
- `ScoringPanel`, `LogicEditor`, and `ResultsConfigPanel` wired into Builder V2 to manage scorable flag, category mapping, option scores/weights, and band definitions.
- Major refactors landed; UI stable in 3-panel flow.
- Three creation entry points all funnel into Builder V2: (a) AI draft with doc upload/prompt → builder, (b) Use Template → builder, (c) Build from scratch → builder → design/preview → publish/share.

## 6) Theme & Design Preview
- DesignV2 preview hardened for header/background image combinations; normalizes image shape and avoids undefined `.url` crashes.
- Regression tests cover scenarios with missing/partial/both images.

## 7) Template Library
- Canonical tag taxonomy added (Pulse, Engagement, Feedback, Onboarding, Exit).
- Templates normalized to canonical tags; Leadership/Public Sector assessment seeded with scoring.

## 8) Test Coverage
- AI route test for valid suggestion + forbidden key rejection; LogicV3 tests; theme preview regression tests.
- More AI route tests planned.

## 9) Documentation
- `ARCHITECTURE-SCORING-RESULTS.md` expanded with AI guardrails and architecture notes; general docs cleanup.

## 10) Outstanding Items / Next Up
- Normalize theme usage across runtime and builder preview.
- Fix runtime ResultsScreen vs ThankYou branching and unskip the regression test.
- Add more AI route sanity tests and LogicEditor → LogicV3 integration coverage.
- Validate scoring config on save (warn-only) and clean old preview routes.
