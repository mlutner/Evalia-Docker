# Process Flows (Index)

Quick links to the process/behavior flow diagrams in `docs/flows/`.

- `docs/flows/survey-creation-and-publishing.md` – Entry points (AI/template/scratch) → BuilderV2 → Design/Preview → Publish/runtime.
- `docs/flows/survey-lifecycle-runtime.md` – Builder save → PreviewV2 → runtime SurveyView submit → results vs thank-you branch.
- `docs/flows/scoring-and-results.md` – Submit → scoring engine → band resolver → persist → ResultsScreen vs Thank You.
- `docs/flows/ai-assistants.md` – Client AI calls → ai routes → aiService → model → Zod/guardrails → back to client.
- `docs/flows/theme-and-design.md` – DesignV2/PreviewV2 normalization → save design_settings → runtime SurveyView normalization.

Future coverage to add: error/resilience and auth/session flows (e.g., failed AI calls, submit errors, inactive surveys, login/logout boundaries).
