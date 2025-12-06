---
description: Ensure LogicEditor and LogicV3 engine are fully integrated: validation, evaluation, and builder wiring all aligned, with tests and invariants protected.
---

Ticket ID: LOGIC-001
Title: LogicEditor → LogicV3 integration coverage

Context:
LogicV3 is the newer logic engine, but:
- LogicEditor and runtime may still depend on older LogicV2 paths.
- Validation, evaluation, and builder wiring may be partially out of sync.

Goal (definition of done):
- LogicEditor uses LogicV3-compatible schema.
- Runtime evaluation uses LogicV3 where configured.
- Validation (logicValidator) aligned with LogicV3.
- Tests cover typical branching patterns.

Flows affected:
- Builder logic editing.
- Logic engine registry.
- Runtime navigation.

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Locate:
   - Logic engines registry (logicEngines, defaultLogicEngineId).
   - LogicEditor / LogicView components.
   - Runtime evaluator.

2. Document:
   - Current engine selection logic.
   - Where LogicV3 is used vs LogicV2.
   - Any feature toggles.

3. Identify:
   - Any mismatches between editor schema and LogicV3 evaluator expectations.

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Preserve existing LogicV2 behaviour for surveys that still target it.
- Keep evaluation deterministic and pure.

You MUST NOT:
- Change base LogicRule schema unless absolutely required.
- Introduce AI or non-deterministic logic at runtime.

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Ensure builder logic editor emits LogicV3-compatible rules when engine is LogicV3.
- Ensure runtime picks the correct engine for a given survey.
- Ensure validator supports V3 semantics.

List files:
- logic engine registry.
- LogicEditor/LogicView.
- logicValidator.
- Runtime evaluator.

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
Implement:
- Engine selection:
  - Confirm default engine and how per-survey engine is stored.
  - Ensure SurveyView uses that engine.

- Editor:
  - Map editor UI fields to LogicV3’s condition/action structure.
  - Avoid creating invalid combinations for V3.

- Validator:
  - Extend logicValidator to understand LogicV3 specifics if needed.

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
Add tests:
1) Editor round-trip:
   - Edit rules in builder → save → runtime evaluates using V3.

2) Typical patterns:
   - Skip, show/hide, end-of-survey.

3) Regression:
   - Existing LogicV2 surveys unaffected.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While here:
- Check for any silent fallbacks (e.g., unrecognized engine IDs).
- Ensure errors are surfaced during validation, not at runtime.

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
BUILD_LOG entry:

- Ticket ID: LOGIC-001
- How LogicV3 is now wired.
- Guarantees around V2 compatibility.
- Tests added.
