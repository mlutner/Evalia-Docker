# Evalia - Upcoming Tickets & Priorities

> Generated: 2025-12-06

## 🔴 CRITICAL PRIORITY (Must Fix for Builder Cohesion)

| Ticket | Description | Effort | Source |
|--------|-------------|--------|--------|
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

1. **RESULTS-001** - Fix ResultsScreen vs ThankYou branching (regression test unskip)
2. **THEME-001** - Theme normalization prevents preview/runtime inconsistencies
3. **DND-001** - Quick win for builder UX
4. **KEYBOARD-001** - Low effort, high value for power users
5. **SCORING-002** - Validation prevents broken surveys from being published
