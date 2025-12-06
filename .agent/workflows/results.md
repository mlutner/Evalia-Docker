---
description: Fix runtime ResultsScreen vs ThankYou branching logic (RESULTS-001)
---

# RESULTS-001: Fix ResultsScreen vs ThankYou Branching

## Context
Evalia has a canonical runtime rule:
- If `resultsScreen.enabled === true` AND a scoring payload exists → show ResultsScreen.
- Otherwise → show the ThankYou screen.

Architecture docs state this as a hard invariant, but there are signs of drift:
- A regression test for this behaviour was skipped or left stale.
- Some scored surveys with resultsScreen enabled do not consistently show ResultsScreen.
- Some non-scored surveys or misconfigured templates behave inconsistently.

## Goal (Definition of Done)
- Runtime branching strictly follows the canonical rule
- Behaviour is covered by integration tests so this cannot silently regress again

## Steps

### STEP 1 – Architect Analysis (read-only)
1. Locate SurveyView component that handles post-submit branching
2. Find any helper/hook for branching logic
3. Find tests mentioning ResultsScreen/ThankYou (including skipped)
4. Review docs: ARCHITECTURE-SCORING-RESULTS.md
5. Document current behaviour in 3-6 bullets
6. Compare against canonical rule and list mismatches

### STEP 2 – Constraints
**MUST NOT:**
- Change scoring computation
- Modify scoring/logic engines
- Alter AI behaviour
- Change ResultsScreen/ThankYou design

**MUST:**
- Keep branching explicit and simple
- Base branching only on: `resultsScreen.enabled` + scoring payload presence

### STEP 3 – Implementation Plan
- Introduce helper: `shouldShowResultsScreen({ resultsScreen, scoringPayload })`
- Remove branching based on template IDs, tags, or heuristics
- Ensure error paths fall back to ThankYou

### STEP 4 – Code Changes
- Centralize branching: `const showResults = resultsScreen?.enabled && !!scoringPayload;`
- Minimal diffs only

### STEP 5 – Tests
Cover:
1. Scoring enabled + resultsScreen.enabled → ResultsScreen
2. Scoring disabled + resultsScreen.enabled → ThankYou
3. Scoring enabled + resultsScreen.disabled → ThankYou
4. Scoring throws/null → ThankYou (no crash)

### STEP 6 – Bug Hunter
- Search for redundant branching code
- Consolidate or add TODO comments

### STEP 7 – Build Log Entry
Add dated entry to docs/BUILD_LOG.md
