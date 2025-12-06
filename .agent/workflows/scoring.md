---
description: Validate scoring config on save (warn-only mode)
---

Ticket ID: SCORING-002
Title: Validate scoring config on save (warn-only mode)

Context:
- Evalia has scoring and survey validators:
  - logicValidator.ts
  - scoringValidator.ts
  - surveyValidator.ts
- Validation is wired into publish/save in some capacity (e.g., validateSurveyBeforePublish).
- For scoring configuration specifically, we want:
  - Validation to run when saving a survey from the builder.
  - Non-fatal scoring issues (e.g., missing optionScores, slightly odd weights) to show as warnings, not hard blockers.
  - Fatal scoring issues (e.g., band coverage gaps, invalid categories) to at least be clearly surfaced.

Goal (definition of done):
- When the user saves or publishes a survey with scoring enabled:
  - scoringValidator runs.
  - Results are surfaced in the builder UI (ideally the same ValidationIssuesModal / badges).
  - For this ticket: scoring validation is *warn-only* (does not block save) unless the existing system already has a clear concept of “errors vs warnings”.
- Behaviour remains consistent with existing validation UX.

Flows affected:
- SurveyBuilderContext save/publish flow.
- Validation UI (modal, badges).
- Scoring configuration editing (ScoringView, Bands, Categories).

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Locate:
   - scoringValidator.ts
   - surveyValidator.ts and logicValidator.ts
   - SurveyBuilderContext saveSurvey() / publishSurvey() (or equivalents).
   - Validation UI components:
     - ValidationIssuesModal
     - Validation badges or sidebars.

2. Document current scoring validation behaviour:
   - When does scoringValidator currently run (if at all)?
   - How do its results flow into surveyValidator and then into the UI?
   - Does save currently:
     - Block on any validation errors?
     - Show warnings but still save?

3. Identify the gap relative to this ticket:
   - Is scoring validation not run at all on save?
   - Is it run but not surfaced?
   - Is it blocking save when it should be warn-only?

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Use existing validators; do not invent a second scoring validator.
- Respect existing severity concepts (error vs warning) if already defined.
- Keep behaviour backwards compatible where sensible.

You MUST NOT:
- Change scoring algorithms or engines.
- Change how responses are scored at runtime.
- Alter score_config_versions or versioning logic.

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Ensure that when saveSurvey() is invoked:
  - scoring validation is executed as part of a single validation pipeline.
  - results are surfaced in the UI with clear severity.

For this ticket:
- Treat Scoring issues as:
  - Warnings by default (shown to user but do not block save),
  - Unless scoringValidator already labels some as “errors”–then keep that semantics but ensure they are visible.

List the files you will touch (e.g.):
- client/src/utils/scoringValidator.ts
- client/src/utils/surveyValidator.ts
- client/src/contexts/SurveyBuilderContext.tsx
- Validation UI components (only wiring, not design).

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
- Ensure scoringValidator is integrated into the validation pipeline used by saveSurvey().
- Ensure the returned structure contains:
  - scoring issues grouped by severity.
- In the save flow:
  - Persist the survey even if there are only scoring warnings.
  - Surface a non-blocking UI indicator (e.g., toast, badge, or note in ValidationIssuesModal) that scoring has warnings.
- Keep the UX consistent with existing validation patterns:
  - If the rest of the app uses ValidationIssuesModal, reuse it.

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
Add/update tests to cover:

1) Saving a survey with valid scoring config:
   - Validation passes with no scoring issues.
   - Save succeeds.

2) Saving a survey with scoring warnings (e.g., missing optionScores for some choices):
   - scoringValidator returns warnings.
   - Save still succeeds.
   - Warnings are surfaced (test for state or UI text where possible).

3) If scoringValidator defines hard errors (e.g., band coverage gap):
   - Behaviour should match existing semantics (either block or clearly warn).
   - Do not silently swallow these.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While in this code:
- Look for places where scoring can be “enabled” but left structurally broken (categories empty, bands missing).
- Confirm that SCORING-002’s warn-only behaviour does not allow hopelessly broken scoring to sneak into production without at least a clear warning.
- If you find larger design issues, note them as follow-up tickets rather than trying to fix them all here.

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
Produce a ready-to-paste docs/BUILD_LOG.md entry:

- Date
- Ticket ID: SCORING-002
- Short title
- 3–7 bullets:
  - When scoring validation runs.
  - How warnings vs errors are treated on save.
  - Which components/files were touched.
  - Tests updated/added.
