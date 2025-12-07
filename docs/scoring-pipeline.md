# Scoring Pipeline (Source of Truth)

// [SCORING-PIPELINE] See docs/scoring-pipeline.md

## Where scoring lives
- **DB**: `surveys.score_config` JSONB (camel-cased as `scoreConfig` in code via Drizzle).
- **API**: `GET /api/surveys/:id` returns `scoreConfig: SurveyScoreConfig | null` alongside questions and design settings.
- **Frontend**:
  - Builder: `SurveyBuilderContext.scoreConfig` is the single source of truth for categories and bands.
  - UI: `ScoringView` consumes `scoreConfig.categories` and `scoreConfig.scoreRanges`.
  - Runtime: scoring engine (`src/core/scoring`) consumes the same `scoreConfig` when `enabled`.

## Invariants (enforced/guarded)
- If `scoreConfig.enabled === true`:
  - `categories.length > 0`
  - `scoreRanges.length > 0`
  - Builder uses `scoreConfig` as the single source for categories & bands.
- AI endpoints may *suggest* configs but never compute scores or bands (see AI guardrails).

## Debug/trace tag
- The string `[SCORING-PIPELINE]` is placed in the key hop files so you can `rg`/search to follow the chain end-to-end.
