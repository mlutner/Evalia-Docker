---
description: Implement autosave for survey progress with localStorage fallback: periodically save answers, restore on reload, and avoid interfering with final submission.
---

Ticket ID: AUTOSAVE-001
Title: Add progress auto-save with localStorage fallback

Context:
Respondents may abandon or refresh the survey. Currently, progress is lost. We want:
- Autosave of in-progress answers.
- LocalStorage fallback for anonymous flows.
- Non-interference with final submission.

Goal (definition of done):
- Answers auto-saved periodically or on change.
- On reload, user can resume from where they left off.
- Autosave does not cause double submissions or corrupt server state.

Flows affected:
- Runtime SurveyView answer handling.
- Possibly response submission controller (for server-backed drafts, if applicable).

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Identify:
   - Where answer state lives in the client.
   - Where submits are triggered.
   - Whether a drafts concept already exists in backend.

2. Decide scope:
   - For this ticket, default to client-side localStorage-based autosave unless a drafts API already exists.

3. Map:
   - Key to use in localStorage (e.g., surveyId + maybe user fingerprint).
   - When to clear it (on successful submission).

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Avoid interfering with final submission.
- Ensure autosaved data is not treated as a completed response.

You MUST NOT:
- Introduce server-side drafts unless explicitly required.
- Store sensitive PII longer than needed (be mindful but practical).

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Add a hook/useEffect in SurveyView that:
  - Watches answer state.
  - Writes to localStorage throttled/debounced.

- On mount:
  - Check for existing saved data.
  - Prompt user to restore or start fresh (if appropriate).

- On successful submit:
  - Clear saved progress.

List files:
- SurveyView.
- Any runtime hooks that manage answers.

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
Implement:
- Autosave:
  - Debounce writes (e.g., 1–3 seconds after last change).
  - Store minimal data (answers + current step/page).

- Restore:
  - On mount, detect saved state.
  - If present, restore into answer state and navigation state.

- Clear:
  - On full submission success, clear the localStorage key.

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
Add tests where practical (or at least unit tests for helper functions):
- Save/load round-trip of answers.
- Clear on submit.

Manual tests:
- Partially complete survey → reload → confirm answers restored.
- Complete survey → confirm no stale autosave remains.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
Watch for:
- Schema changes: old autosaved shape vs new question set.
- Handle mismatch gracefully (ignore unknown question IDs).

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
BUILD_LOG entry:

- Ticket ID: AUTOSAVE-001
- Behaviour summary.
- Storage key format.
- Safety considerations (e.g., PII, expiry if added).
