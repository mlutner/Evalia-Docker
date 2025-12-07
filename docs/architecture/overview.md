# Evalia Architecture Overview

Evalia is a survey platform with a React client, an Express API, versioned scoring/logic engines in `@core`, and AI-assisted configuration layered on top. This page is the entry point to the architecture docs.

## Primary references
- [System Architecture](system-architecture.md)
- [Data Model](data-model.md)
- [API Map](api-map.md)
- [Process Flows](process-flows.md)

## Big Picture

```mermaid
flowchart LR
  Browser[Browser] --> Client[React Client\n(client/src/pages)]
  Client --> API[API Layer (Express)\nserver/routes]
  API --> Storage[storage.ts + db.ts]\n
  API --> AI[AI Service\naiService.ts + server/schemas/ai.ts]
  AI --> Model[External AI Provider]

  API --> Core[Scoring/Logic Engines\n@core/scoring @core/logic]
  Core --> DB[(Postgres / JSONB)]
  Storage --> DB
  Client --> Results[ResultsScreen/SurveyView]
  Results --> Client
```

### Components referenced
- React client: `client/src/pages` (SurveyBuilderV2, PreviewV2, SurveyView, etc.)
- API layer: `server/routes/*`
- AI service: `server/aiService.ts`
- Core engines: `src/core/scoring`, `src/core/logic`
- Shared schema: `shared/schema.ts`
- DB access: `server/db.ts`, `server/storage.ts`
