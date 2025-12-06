---
description: Improve Builder V2 drag-and-drop UX: add drag handles, clear insertion indicators, reduce jitter, and keep ordering predictable with minimal layout changes. Add tests for reorder behaviour.
---

Ticket ID: DND-001
Title: Improve drag-and-drop visual feedback in Builder V2

Context:
Builder V2 uses drag-and-drop for question ordering, but current UX is jittery and unclear:
- No explicit drag handles.
- Insertion position is ambiguous.
- Occasional flicker or unexpected reordering.

Goal (definition of done):
- Clear drag handles on question cards.
- Obvious insertion indicator during drag.
- Smooth, predictable reorder behaviour.
- No regressions to question order persistence.

Flows affected:
- Builder V2 main canvas.
- Question list/QuestionCard.
- Any DnD provider configuration.

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Locate:
   - Builder V2 screen/component (main layout).
   - Question list rendering (QuestionCard / list wrapper).
   - DnD provider setup (e.g., @dnd-kit or similar).
   - Current reorder handler.

2. Document in 5–8 bullets:
   - How DnD context is configured (sensors, sortable context, collision strategy).
   - How ordering is stored (e.g., order field vs array index).
   - Where reorder is persisted to builder state.

3. Identify UX issues:
   - Where jitter occurs.
   - Where insertion is unclear.

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Preserve core Builder layout (design-locked components remain structurally intact).
- Use existing Builder state shape for question ordering.
- Keep minimal changes to visuals (only handles/indicators, no redesign).

You MUST NOT:
- Change question schema.
- Change BuilderQuestion IDs or persistence model.
- Introduce heavy new libraries.

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Add a drag handle region to each QuestionCard (icon or grip).
- Adjust DnD configuration if necessary (collision strategy, activation constraints).
- Add a clear “drop line” insertion indicator.

List files to touch:
- Builder V2 screen.
- Question list/QuestionCard component.
- DnD setup configuration.

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
Implement:
- Drag handle:
  - Add a handle icon inside QuestionCard but outside main content.
  - Wire handle to the sortable drag listeners.

- Insertion indicator:
  - Use DnD “active” + “over” item to render a line or shadow between cards.
  - Ensure indicator does not shift layout.

- Jitter reduction:
  - Confirm correct collision strategy (e.g., closestCenter or closestY).
  - Avoid unnecessary state updates on hover.

Keep styling consistent with existing builder design.

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
Add/update tests:
- If there are existing DnD tests or Cypress tests, extend:
  - Drag question A below question B.
  - Assert final order matches expectation.

If no automation exists:
- Add at least a unit/integration test for reorder handler logic.

Document manual test steps:
- Reorder multiple questions quickly.
- Reorder first↔last positions.
- Save, reload builder, confirm order persisted.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While here:
- Check for any hard-coded assumptions about order (e.g., index-based logic).
- Ensure reorder does not break logic-rule targets or scoring mappings.
- If risk is found, call it out and keep changes conservative.

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
Add a BUILD_LOG entry:
- Ticket ID: DND-001
- Summary of UX improvements.
- Notes about any limitations (e.g., mobile drag behaviour).
- Tests added/updated.
