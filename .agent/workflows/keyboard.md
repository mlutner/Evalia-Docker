---
description: Add keyboard navigation to Builder V2: Enter to advance, arrow navigation between questions, and accessible focus handling without breaking existing mouse interaction
---

Ticket ID: KEYBOARD-001
Title: Add keyboard navigation (Enter to advance) in Builder/Runtime

Context:
Users want faster navigation via keyboard:
- Enter to move to next question or field.
- Arrow keys to move between questions where appropriate.
Accessibility also benefits from clear focus management.

Goal (definition of done):
- Enter key advances to the next logical input/question.
- Arrow keys (or Tab) allow moving through questions predictably.
- No keyboard traps.
- Mouse UX unchanged.

Flows affected:
- Runtime survey form.
- Possibly Builder preview / in-place edit fields.

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Locate:
   - Runtime question rendering (QuestionRenderer / SurveyView).
   - Input components for text, rating, choice types.

2. Document current focus behaviour:
   - How focus is initially set.
   - How Tab currently behaves.
   - Any custom key handlers.

3. Identify:
   - Where “next question” is determined (order field, array index).

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Respect browser-native accessibility as much as possible (Tab order).
- Not break screen reader or basic keyboard navigation.

You MUST NOT:
- Override Tab in strange ways.
- Make Enter submit the entire survey unexpectedly (unless on last question and already designed that way).

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Implement a small helper that moves focus to the next question input given current question ID.
- For input components, add onKeyDown handlers for Enter that:
  - Prevent default only if safe.
  - Call “focus next question”.

List files:
- QuestionRenderer or equivalent.
- Specific input components.
- Possibly a small utility for focus management.

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
Implement:
- Focus registry (lightweight):
  - Track question order in runtime.
  - Map questionId → DOM ref.

- Keyboard handler:
  - On Enter in an input:
    - If not last question → focus next.
    - If last question → optionally submit (if current flow expects that).

- Ensure:
  - Radio/checkbox groups behave sensibly.
  - Rating widgets handle Enter in a reasonable way (select vs advance).

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
If keyboard-focused tests exist:
- Add tests for:
  - Enter moves focus correctly.
  - Enter on last question does not crash or double-submit.

If not:
- Document a manual test script:
  - Complete survey using only keyboard.
  - Try all question types.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While working:
- Make sure the focus helper does not rely on brittle querySelector chains.
- Handle hidden/logic-skipped questions gracefully (skip them in “next” resolution).

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
Add BUILD_LOG entry:

- Ticket ID: KEYBOARD-001
- Summary of behaviours.
- Any limitations (e.g., not yet applied to certain complex widgets).
