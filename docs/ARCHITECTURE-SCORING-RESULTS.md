# Scoring & Results Architecture

Reference notes on scoring, logic usage, and results rendering flows.

## Scoring Engine
- Registry in `client/src/core/scoring/strategies.ts` with active `engagement_v1` strategy (frozen for compatibility).
- Surveys/responses carry `scoringEngineId`; scores and bands are computed deterministically during submit when scoring is enabled.
- Scoring config validation guards against forbidden fields; scoring remains server-deterministic (no AI scoring).

## Logic Engine
- Default wiring uses `logicEngineV2`; `LogicV3` adds `AND/OR` and `contains()` support and is available for builder integration.
- Tests cover LogicV3 rule evaluation and safety cases.

## Results Screen
- `resultsScreen` supports categories, bands, narrative blocks, and CTA content.
- Runtime branches between Thank You and ResultsScreen; further cleanup planned to finalize the switch logic.

## AI Guardrails (Context)
- `server/aiService.ts` restored with schema-driven validation (`schemas/ai.ts`), canonical tag enforcement, and forbidden scoring field detection.
- AI endpoints are constrained to configuration/narrative generation; scoring and banding remain deterministic.
