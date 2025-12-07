# Survey Lifecycle & Runtime Flow

This flow covers how a survey moves from Builder V2 through save/preview into the runtime `/survey/:id` experience, including submission.

## Key invariants / decisions
- Builder state lives in `SurveyBuilderProvider` / `useSurveyBuilder`; save calls `/api/surveys` POST/PUT.
- Preview uses builder state (`/preview-v2/:id`); runtime fetches from API (`/survey/:id`).
- Submit posts to `/api/surveys/:id/responses` with answers and timestamps.
- Runtime shows ResultsScreen only if `resultsScreen.enabled === true` and a scoring payload exists; otherwise Thank You.

```mermaid
flowchart LR
  A[SurveyBuilderV2 edit] --> B[saveSurvey -> /api/surveys POST/PUT]
  B --> C[DB: surveys saved]
  A --> D[PreviewV2 /preview-v2/:id]
  D --> E[Render welcome/questions/results preview]
  F[Runtime /survey/:id] --> G[Fetch survey via useQuery]
  G --> H[User submits answers]
  H --> I[POST /api/surveys/:id/responses]
  I --> J[Server persists response (+ scoring/band if enabled)]
  J --> K{resultsScreen.enabled && scoring?}
  K -- yes --> L[Render ResultsScreen]
  K -- no --> M[Render Thank You]
```
