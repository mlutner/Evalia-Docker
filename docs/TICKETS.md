# Evalia - Upcoming Tickets & Priorities

> Generated: 2025-12-06

## 🔴 CRITICAL PRIORITY (Must Fix for Builder Cohesion)

| Ticket | Description | Effort | Source |
|--------|-------------|--------|--------|
| **RES-RESULTS-MODES-001** | Introduce results modes for index vs self-assessment vs non-scored surveys | Medium | Test suite completion |
| **RESULTS-001** | Fix runtime ResultsScreen vs ThankYou branching logic | Medium | ARCHITECTURE_SNAPSHOT.md |
| **THEME-001** | Normalize theme usage across runtime and builder preview | Medium | ARCHITECTURE_SNAPSHOT.md |
| **SCORING-002** | Validate scoring config on save (warn-only mode) | Low | ARCHITECTURE_SNAPSHOT.md |
| **WEBHOOK-001** | Implement webhook firing on response submission | Medium | UI_ENHANCEMENT_ROADMAP |

---

## 🟠 HIGH PRIORITY (Builder Improvements)

| Ticket | Description | Effort | Source |
|--------|-------------|--------|--------|
| **DND-001** | Improve drag-and-drop visual feedback (handles, insertion indicator) | Low | UI_ENHANCEMENT_ROADMAP |
| **BUILDER-001** | Add undo/redo in builder | Medium | UI_ENHANCEMENT_ROADMAP |
| **KEYBOARD-001** | Add keyboard navigation (Enter to advance) | Low | UI_ENHANCEMENT_ROADMAP |
| **AUTOSAVE-001** | Add progress auto-save (localStorage fallback) | Low | UI_ENHANCEMENT_ROADMAP |
| **LOGIC-001** | LogicEditor → LogicV3 integration coverage | Medium | ARCHITECTURE_SNAPSHOT.md |

---

## 🟡 MEDIUM PRIORITY (Analytics & AI Features)

| Ticket | Description | Effort | Source |
|--------|-------------|--------|--------|
| **AI-ANALYTICS-001** | AI Response Summary Card (themes, sentiment) | Medium | AI_ANALYTICS_ENHANCEMENT_ROADMAP |
| **AI-TEST-001** | Add more AI route sanity tests | Low | ARCHITECTURE_SNAPSHOT.md |
| **ANALYTICS-001** | Create analytics API with aggregations | Medium | UI_ENHANCEMENT_ROADMAP |
| **EXPORT-001** | Add export endpoints (CSV, PDF, Excel) | Medium | UI_ENHANCEMENT_ROADMAP |
| **RESPONDENT-001** | Fetch respondent/completed counts | Low | TODO in RespondentsListPage.tsx |

---

## 🟢 LOW PRIORITY (Future Enhancements)

| Ticket | Description | Effort | Source |
|--------|-------------|--------|--------|
| **QUESTION-LIB-001** | Question library database + UI | High | UI_ENHANCEMENT_ROADMAP |
| **PREVIEW-001** | Real-time preview improvements | Medium | UI_ENHANCEMENT_ROADMAP |
| **FLOW-BUILDER-001** | Visual flow builder (ReactFlow integration) | Very High | UI_ENHANCEMENT_ROADMAP |
| **ADMIN-001** | AI Monitoring Dashboard | Medium | AI_ANALYTICS_ENHANCEMENT_ROADMAP |
| **STREAM-001** | Streaming AI Responses (like ChatGPT) | Medium | AI_ANALYTICS_ENHANCEMENT_ROADMAP |

---

## Recommended Execution Order

1. **RES-RESULTS-MODES-001** - Results modes abstraction (enables proper index vs self-assessment differentiation) ← **NEXT**
2. **RESULTS-001** - Fix ResultsScreen vs ThankYou branching (regression test unskip)
3. **THEME-001** - Theme normalization prevents preview/runtime inconsistencies
4. **DND-001** - Quick win for builder UX
5. **KEYBOARD-001** - Low effort, high value for power users
6. **SCORING-002** - Validation prevents broken surveys from being published

---

## Detailed Ticket Specifications

### RES-RESULTS-MODES-001: Introduce results modes for index vs self-assessment vs non-scored surveys

**Intent:**  
Add a small abstraction that lets ResultsScreen and analytics render correctly for three cases:
1. **Index-based surveys** (engagement, 5D) - show index-style UI with "Engagement Index" wording
2. **Self-assessments** (leadership, burnout, confidence, etc.) - show personal band + narrative, no "index" wording
3. **Non-scored surveys** - existing behavior: Thank You screen only

**In Scope:**
- ResultsScreen rendering logic (React)
- A small helper (e.g., `resolveResultsMode`) to classify survey scoring mode
- Analytics view: respect mode when deciding which widgets to show
- Tests for:
  - scored index survey → ResultsScreen (index mode)
  - scored self-assessment → ResultsScreen (self_assessment mode)
  - non-scored survey → Thank You screen only

**Out of Scope:**
- Any changes to core scoring algorithms
- Any changes to golden tests (5D, engagement, non-scored) beyond wiring in mode if needed
- New database fields (derive mode from existing scoreConfig/engineId/tags)

**Acceptance Criteria:**

1. **Helper Function**
   - Create pure function: `resolveResultsMode(scoreConfig, surveyMeta)` returns:
     - `"index"` for engagement/5D surveys
     - `"self_assessment"` for other scored surveys
     - `"none"` when `scoreConfig.enabled !== true`
   - Location: `shared/` or `src/core/results/`

2. **SurveyView Branching (MUST NOT CHANGE)**
   - Existing invariant preserved:
     ```typescript
     if (resultsScreen.enabled && scoringPayload !== null) {
       return <ResultsScreen />;
     } else {
       return <ThankYouScreen />;
     }
     ```

3. **ResultsScreen Updates**
   - Call `resolveResultsMode()` inside ResultsScreen
   - Branch on mode:
     - `mode === "index"` → keep existing index-style layout ("Engagement Index", 5D widgets)
     - `mode === "self_assessment"` → introduce variant:
       - Emphasize personal band and narrative (self-assessment copy)
       - Do NOT render "Engagement Index" or 5D index-specific widgets
       - Show: "Your Score", "Your Band", "Personal Insights"
   - Keep changes minimal and localized

4. **Analytics View Updates**
   - Use `resolveResultsMode()` logic to:
     - Show index dashboards only when `mode === "index"`
     - Show self-assessment analytics (band distributions, category averages) when `mode === "self_assessment"`
     - Avoid index widgets for self-assessment surveys

5. **Tests**
   - **Runtime tests:**
     - Engagement survey (scored + resultsScreen.enabled) → ResultsScreen renders in index mode
     - Self-assessment survey (scored + resultsScreen.enabled) → ResultsScreen renders in self_assessment mode (assert no "index" wording)
     - Non-scored survey → Thank You screen; ResultsScreen never rendered
   - **Analytics tests:**
     - Self-assessment survey does NOT surface engagement/5D index IDs in analytics payload

**Constraints:**
- Do NOT change core scoring algorithms
- Do NOT break existing golden tests (5D, engagement, non-scored)
- Keep diffs small and focused
- Update BUILD_LOG.md under ticket RES-RESULTS-MODES-001

**Files Expected to Change:**
- `shared/resultsMode.ts` (new) - helper function
- `client/src/components/surveys/ResultsScreen.tsx` - mode branching
- `client/src/pages/AnalyticsPage.tsx` - mode-aware widget rendering
- `client/src/__tests__/runtime/resultsMode.test.ts` (new) - mode resolution tests
- `client/src/__tests__/runtime/SurveyView.results.test.tsx` - add mode assertions
- `docs/BUILD_LOG.md` - ticket summary

**Effort:** Medium (4-6 hours)
**Priority:** Critical (blocks proper self-assessment UX)
