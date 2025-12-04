# Scoring & Results Architecture (Evalia)

## End-to-end flow
- Respondent submits answers → backend calls the scoring engine (`scoreSurvey` in ScoringV1) → overall/category scores → band resolution (`resolveBand`) → ResultsScreenConfig drives the ResultsScreen UI.
- Scoring is deterministic and pure. Backend owns the numeric scoring; frontend renders the stored outcome + config.
- ResultsScreen is a view layer over stored scores and the configured ResultsScreenConfig (bands, narratives, visibility).

## Invariants (non-negotiable)
- Backend is the source of truth for scoring; no client-side overrides.
- All scores are deterministic/reproducible for a given input.
- Scoring engines are versioned (e.g., `engagement_v1`); breaking changes must use a new version id.
- AI may propose configurations (bands/narratives/actions) but must **never** compute or override numeric scores.
- Each stored response should carry: scoring_engine_id, calculator_version (if present), band_id/label, and category-level scores.

## Versioning strategy
- `scoringEngineV1` and `logicEngineV2` are frozen contracts. Breaking behavior goes into a new versioned module and is selected via the scoring registry.
- ResultsScreenConfig is schema-based (Zod/TS) and should evolve additively when possible.
- Use the scoring registry (`ScoringStrategies`) to add new engines without altering existing behavior.

## Golden tests
- Golden scoring tests live in `src/core/scoring/__tests__/scoringEngineV1.golden.test.ts`.
- Purpose: catch any accidental scoring changes. If scoring intentionally changes, bump the engine id, update golden expectations, and adjust docs.

## AI usage
- AI may: suggest ResultsScreenConfig structures, propose bands and narratives, generate insight text/CTAs.
- AI may **not**: run its own scoring logic, overwrite stored scoring results, or change core engine contracts.

## Future extensions
- Add account/workspace-level `scoring_engine_id` override once an account model exists (current engine selection is per-survey only).

## AI guardrails
- AI assists with configuration and narratives only; deterministic scoring/logic live in `@core` (ScoringStrategies + LogicV2/V3).
- Valid tags for AI template selection/filtering are canonical and must not be invented.
- AI endpoints must never emit per-respondent numeric scores, bands, or `scoringEngineId`. Suggestions are validated and rejected if forbidden fields appear.

## Active AI endpoints (summary)
- /api/parse-document, /api/generate-survey, /api/enhance-prompt, /api/chat, /api/generate-text, /api/adjust-tone, /api/questions/analyze, /api/generate-scoring-config, /api/ai-chat, plus /api/ai/test/*.
- AI returns survey content, config suggestions, or narrative text only.
- All numeric scoring and banding are handled by versioned engines in `@core/scoring`; AI cannot compute or alter them.
- Canonical tags enforced in prompts; valid tags: engagement, pulse, feedback, onboarding, exit, leadership, wellbeing, mental_health, burnout, psychological_safety, public_sector, self-assessment, hybrid_work, manager, equity. Only use these; do not invent new tags or synonyms.

## AI Guardrails, Architecture & Testing Roadmap
- **AI surface area**: Routes include document parsing, survey generation/refinement, prompt enhancement, text generation, tone/quality analysis, scoring-config suggestions, and general AI chat. They return survey content, configs, or narratives only.
- **Guardrails**:
  - Deterministic scoring/logic lives in `@core` (versioned engines). AI cannot compute per-respondent scores, bands, or `scoringEngineId`.
  - Canonical tags only (see above); prompts instruct models not to invent tags.
  - AI responses validated with Zod; forbidden key scan rejects numeric scoring fields.
- **Testing strategy**:
  - Golden scoring tests keep engines frozen.
  - AI route tests ensure forbidden fields are rejected and valid configs parse.
  - Builder/runtime regression tests (e.g., theme/image handling, results screen) protect UI paths that render AI-assisted configs.
- **Next steps**:
  - Expand AI route coverage with schema/forbidden-key tests for every endpoint.
  - Keep prompts centralized (tag/guardrail fragments) to avoid drift.
  - Add integration tests around builder logic/scoring panels to ensure AI-suggested configs stay schema-valid end-to-end.
