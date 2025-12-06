---
description: Add undo/redo to Builder V2 using a command history for question, logic, and scoring edits. Use minimal snapshots, avoid performance regressions, and integrate with keyboard shortcuts.
---

Ticket ID: BUILDER-001
Title: Add undo/redo support in Builder V2

Context:
Builder V2 allows complex edits (questions, logic, scoring, theme). Users need a safe way to undo/redo changes. Current behaviour has no history stack; misclicks are costly and hard to recover from.

Goal (definition of done):
- Undo and redo stacks for Builder V2.
- Support for key operations: add/delete/reorder questions, text edits, logic edits, scoring edits.
- Keyboard shortcuts (Ctrl+Z / Cmd+Z, Ctrl+Shift+Z / Cmd+Shift+Z) if appropriate.
- No major performance regressions.

Flows affected:
- SurveyBuilderContext state management.
- Builder V2 UI (toolbar/menu).
- Possibly logic/scoring panels (depending on implementation detail).

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Identify:
   - SurveyBuilderContext (core builder state).
   - Current update functions (addQuestion, updateQuestion, setLogicRules, etc.).
   - Any existing time-travel / history attempts.

2. Document:
   - What constitutes “one atomic change” in Builder.
   - How often state updates are triggered.
   - Current constraints on state size.

3. Decide early:
   - Snapshot entire state vs command-based diffs.
   - For this ticket: prefer minimal snapshot strategy that is simple and safe.

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Keep history logic inside builder layer (no impact on runtime).
- Avoid touching scoring engine or logic engine code.
- Respect protected components (design-locked UI).

You MUST NOT:
- Introduce complex global stores without explicit reason.
- Change question IDs or schema.

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Add undoStack and redoStack to builder context.
- Wrap state update functions so they push a snapshot before applying changes.
- Provide undo() and redo() functions that:
  - Pop/push from stacks.
  - Replace current state atomically.

List exact files to touch:
- SurveyBuilderContext.
- Builder V2 shell (to render buttons / handle hotkeys).
- Tests for context.

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
Implement:
- History state:
  - undoStack: Array<BuilderStateSnapshot>.
  - redoStack: Array<BuilderStateSnapshot>.

- Snapshot strategy:
  - Snapshot only builder state needed for undo (questions, logic, scoring, theme).
  - Avoid including large derived/ephemeral fields if unnecessary.

- Wrap critical mutations:
  - On each meaningful change, push current snapshot to undoStack, clear redoStack.

- Expose:
  - undo(): pops from undoStack, pushes current state to redoStack.
  - redo(): inverse operation.

- UI:
  - Add Undo/Redo actions in Builder V2 header or toolbar.
  - Optionally bind Ctrl+Z / Ctrl+Shift+Z.

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
Add tests for:
1) Single undo:
   - Make a change → undo → state matches before-change snapshot.

2) Multi-step undo/redo:
   - Apply 3 changes.
   - Undo 3 times, then redo 3 times.

3) Complex operations:
   - Reorder + delete + edit text: verify history does not corrupt IDs or logic mappings.

Manual testing:
- Verify logic and scoring UIs remain in sync after undo/redo.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While implementing:
- Watch for derived state that shouldn’t be stored in snapshots (e.g., transient UI selection).
- Ensure that undo/redo doesn’t trigger unintended API saves unless explicitly desired.
- If risk is high, limit scope to builder-local state only (no auto-save during undo/redo).

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
Add BUILD_LOG entry:

- Ticket ID: BUILDER-001
- Short description.
- Brief explanation of snapshot strategy.
- Tests added.
- Known limitations (e.g., undo doesn’t span across page reloads unless persisted).
