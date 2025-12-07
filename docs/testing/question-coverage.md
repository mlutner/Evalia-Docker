# Question Coverage & Tests

This page maps automated coverage for question schemas, parameters, adapters, and runtime rendering.

## Fixture source
- `tests/fixtures/all-question-types.ts` – canonical list covering **every question type**, including media (image_choice, file_upload, signature, video, audio_capture) and all text/choice/rating/matrix/ranking/date/datetime/structural types with realistic params.

## Automated checks (implemented)
- **Schema parsing**: `client/src/__tests__/questions/normalize-question.test.ts` calls `normalizeQuestion` on every fixture (guards against schema drift).
- **Builder round-trip**: `client/src/__tests__/questions/roundtrip.test.ts` does `evaliaToBuilder -> builderToEvalia -> normalizeQuestion` for each fixture (ensures adapters preserve type/params).
- **Renderer smoke**: `client/src/__tests__/questions/renderers.test.tsx` mounts `QuestionRenderer` for every fixture (catches renderer crashes, incl. media).
- **Renderer after round-trip**: `client/src/__tests__/questions/roundtrip.renderers.test.tsx` renders questions after builder round-trip.
- **Runtime end-to-end**: `client/src/__tests__/questions/runtime-all.test.tsx` builds a synthetic survey with **all** fixtures, runs through `SurveyView`, and completes (ensures runtime wiring handles every type).
- **Template validation**: `npm run audit:questions` runs `QuestionSchema.safeParse` against all shared templates.
- **Schema snapshot**: `npm run schema:check` compares `QUESTION_SCHEMA_META` to the recorded snapshot.

## Commands
- Full suite: `npm test`
- Schema drift check: `npm run schema:check`
- Template validation: `npm run audit:questions`
- Update snapshot after intentional schema changes: `npm run schema:snapshot` (commit snapshot diff) — required alongside updating `QUESTION_SCHEMA_META` and, if params change, the Question Parameter Matrix doc.
