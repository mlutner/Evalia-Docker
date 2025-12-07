# Scoring & Results Flow

This flow describes what happens when a respondent submits a runtime survey: scoring computation, band resolution, persistence, and the UI branch between Results and Thank You.

## Key invariants / decisions
- Scoring runs only when `scoreConfig.enabled === true`; engine defaults to `engagement_v1` unless overridden on the survey.
- Bands are resolved via `resolveBand` using `resultsScreen.scoreRanges`.
- Client shows ResultsScreen only when `resultsScreen.enabled === true` AND a scoring payload is present; otherwise shows the Thank You screen.
- AI never computes per-response scores; all scoring is deterministic in `@core`.

```mermaid
flowchart LR
  A[User submits answers in SurveyView] --> B[POST /api/surveys/:id/responses]
  B --> C[Load survey + status check]
  C --> D{scoreConfig.enabled?}
  D -- no --> E[No scoring computed]
  D -- yes --> F[computeSurveyScore (engagement_v1)]
  F --> G[resolveBand(scoreRanges)]
  E & G --> H[storage.createResponse in DB]
  H --> I[201 response with optional scoring/band]
  I --> J[Client updates resultsState]
  J --> K{resultsScreen.enabled && scoring?}
  K -- yes --> L[Render ResultsScreen]
  K -- no --> M[Render Thank You]
```
