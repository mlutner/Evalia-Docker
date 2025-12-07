# System Architecture

High-level container view of Evalia: client, API, AI, core engines, and data store.

## Container diagram

```mermaid
flowchart TD
  Client[Client Application\nReact: SurveyBuilderV2, PreviewV2, SurveyView\n(client/src/pages)]
  API[API / Backend\nExpress routes\n(server/routes/*)]
  AI[AI Service Layer\naiService.ts + server/schemas/ai.ts\n(model calls)]
  Core[Core Engines\nScoring strategies, Logic engines, Results\n(src/core/scoring, src/core/logic)]
  DB[(Postgres / JSONB)\nSurveys, SurveyResponses, Templates]
  ExtAI[External AI Provider]

  Client --> API
  API --> Core
  API --> AI
  API --> DB
  AI --> ExtAI
  Core --> DB
```

## Node → files mapping
- Client Application: `client/src/pages/SurveyBuilderV2.tsx`, `client/src/pages/PreviewV2.tsx`, `client/src/pages/SurveyView.tsx`, supporting components in `client/src/components/builder-v2/*` and `client/src/components/surveys/*`.
- API / Backend: `server/routes/*.ts` (surveys, responses, ai, etc.), `server/index.ts`.
- AI Service Layer: `server/aiService.ts`, `server/schemas/ai.ts`, routes in `server/routes/ai.ts`.
- Core Engines: `src/core/scoring/*`, `src/core/logic/*`, band resolver `src/core/scoring/resolveBand.ts`.
- Database: `shared/schema.ts` defines tables; `server/db.ts` connection; `server/storage.ts` data access.
- External AI Provider: upstream model calls from `aiService.ts`.
