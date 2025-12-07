# AI Assistants Flow

This flow covers how builder AI actions call server AI endpoints, apply guardrails, and return sanitized payloads to the client.

## Key invariants / decisions
- Client calls specific AI endpoints (e.g., `/api/parse-document`, `/api/generate-survey`, `/api/generate-scoring-config`, `/api/generate-text`, `/api/adjust-tone`, `/api/questions/analyze`, `/api/ai-chat`).
- aiService adds canonical tag + scoring guardrail fragments to prompts.
- Responses are parsed with Zod schemas; forbidden scoring fields (`score`, `scores`, `band`, `bands`, `scoringEngineId`, etc.) cause a 400.
- AI suggestions only produce config/narrative; numeric scoring is deterministic in `@core`.

```mermaid
flowchart LR
  A[Client AI request (/api/...)] --> B[Route handler in server/routes/ai.ts]
  B --> C[aiService builds prompt + calls model]
  C --> D[Zod parse (server/schemas/ai.ts)]
  D --> E{Forbidden keys?}
  E -- yes --> F[400 error]
  E -- no --> G[Return sanitized payload]
  G --> H[Client applies to builder state\n(saved later via /api/surveys)]
```
