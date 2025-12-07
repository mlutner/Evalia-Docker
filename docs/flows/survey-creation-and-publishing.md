# Survey Creation & Publishing Flow

This flow covers how a new survey is created from the three entry points (AI draft with doc upload/prompt, template, or scratch) and moves through Builder V2, Design/Preview, to publishing and runtime usage.

## Key invariants / decisions
- Three entry points: AI Draft (`/ai-generate`, supports PDF/Doc/PPT ingestion), Use Template (`/templates`), Build from Scratch (`/builder-v2/new`).
- All paths funnel into `SurveyBuilderV2` with `SurveyBuilderProvider`.
- Design/Preview (DesignV2/PreviewV2) happens before publish/share; runtime lives at `/survey/:id`.
- Saving uses `/api/surveys` (POST/PUT) to persist questions, scoreConfig, design_settings, etc.

```mermaid
flowchart LR
  A[CreateSurveyModal] --> B1[AI Draft (/ai-generate)\nDoc upload or prompt]
  A --> B2[Use Template (/templates)]
  A --> B3[Build from Scratch (/builder-v2/new)]
  B1 --> C[SurveyBuilderV2 (builder)]
  B2 --> C
  B3 --> C
  C --> D[DesignV2 / PreviewV2\n(optional preview at /preview-v2/:id)]
  D --> E[Save via /api/surveys]
  E --> F[Publish/Share\nruntime /survey/:id]
```
