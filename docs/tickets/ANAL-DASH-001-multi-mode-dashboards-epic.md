# ANAL-DASH-001: Multi-Mode Analytics Dashboards (Epic)

**Status:** Roadmap  
**Phase:** Analytics UX / Runtime Routing  
**Type:** Epic  
**Created:** 2025-12-05  

---

## Intent

Introduce multiple analytics dashboard modes and a runtime router so each survey sees an appropriate analytics experience based on its scoring configuration.

### Dashboard Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Insight Dimensions** | Full 5D Evalia view with dimension leaderboard, burnout inversion, trends | EID-enabled templates (5D Smoke Test, etc.) |
| **Generic Scoring** | Category-based view with category leaderboard, distributions | Custom scored surveys (Training Readiness, etc.) |
| **Basic Analytics** | Participation + question-level only | Non-scored surveys, simple feedback forms |

---

## Architecture: Dashboard Router

```
┌─────────────────────────────────────────────────────────────┐
│                    /analytics/:surveyId                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  useDashboardMode │
                    │    (hook)         │
                    └─────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  InsightDimensions │ │ GenericScoring  │ │ BasicAnalytics  │
│  AnalyticsPage     │ │ AnalyticsPage   │ │ Page            │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Routing Logic (Pseudocode)

```typescript
function useDashboardMode(surveyId: string): DashboardMode {
  const { data: survey } = useSurvey(surveyId);
  
  // No scoring config → Basic
  if (!survey?.scoreConfig?.enabled) {
    return 'basic';
  }
  
  // No categories → Basic
  if (!survey.scoreConfig.categories?.length) {
    return 'basic';
  }
  
  // Check if categories match canonical 5D dimensions
  const categoryIds = survey.scoreConfig.categories.map(c => c.id);
  const is5DDashboard = CANONICAL_5D_IDS.every(id => categoryIds.includes(id));
  
  return is5DDashboard ? 'insight-dimensions' : 'generic-scoring';
}

const CANONICAL_5D_IDS = [
  'engagement',
  'leadership-effectiveness', 
  'psychological-safety',
  'team-wellbeing',
  'burnout-risk'
];
```

---

## In Scope

- [ ] High-level routing logic based on `scoreConfig` + survey metadata
- [ ] UX definition for all three dashboard modes
- [ ] Mapping rules between survey types and dashboards
- [ ] Component map for each dashboard mode
- [ ] Shared infrastructure (hooks, routing, error states)

## Out of Scope

- New analytics metrics/endpoints (reuse existing)
- AI insights / text analytics
- Admin configuration of scoring models (see MODEL-001)
- Manager analytics for Generic/Basic modes (future enhancement)

---

## Dependencies

| Ticket | Description | Status |
|--------|-------------|--------|
| SCORE-001 | scoreConfig versioning | ✅ Implemented |
| SCORE-002 | Band property alignment bugfix | ✅ Implemented |
| ANAL-IA-001 | 7-tab analytics IA | ✅ Implemented |
| ANAL-QA-001 | Analytics hardening epic | 🔲 In Progress |

---

## Sub-Tickets

| Ticket | Title | Status |
|--------|-------|--------|
| ANAL-DASH-010 | Generic Scoring Dashboard (Category-Based) | 🔲 Roadmap |
| ANAL-DASH-020 | Basic Analytics Dashboard (Non-Scored) | 🔲 Roadmap |
| ANAL-DASH-030 | Dashboard Router Implementation | 🔲 Roadmap |

---

## Acceptance Criteria

1. **Design Doc Complete**
   - [ ] Three dashboard modes fully described
   - [ ] Routing rules documented and reviewed
   - [ ] Component map for each mode

2. **Component Inventory**
   - [ ] Identify which existing components are reusable
   - [ ] List new components needed per mode
   - [ ] Define shared vs. mode-specific logic

3. **Mapping Rules Defined**
   - [ ] Clear criteria for each dashboard mode
   - [ ] Templates mapped to appropriate dashboards
   - [ ] Edge cases documented (partial configs, legacy surveys)

---

## Component Mapping (Draft)

### Insight Dimensions Dashboard (Current AnalyticsPage)
- ParticipationMetricsCard
- DimensionLeaderboardTable
- IndexDistributionChart
- BandDistributionChart  
- ManagerIndexSummaryTable
- IndexTrendChart
- BeforeAfterComparisonCard
- QuestionSummaryTable
- ResponsesTable

### Generic Scoring Dashboard (New)
- ParticipationMetricsCard (reuse)
- CategoryLeaderboardTable (new - similar to DimensionLeaderboard)
- CategoryDistributionChart (reuse IndexDistributionChart with different labels)
- CategoryTrendChart (reuse IndexTrendChart)
- QuestionSummaryTable (reuse)

### Basic Analytics Dashboard (New)
- ParticipationMetricsCard (reuse)
- QuestionSummaryTable (reuse)
- TopBottomItemsCard (new - derived from QuestionSummary)
- EmptyStateMessaging (no scores message)

---

## Notes

- The existing `AnalyticsPage.tsx` becomes the "Insight Dimensions" mode
- Generic Scoring can share 70%+ of existing component code
- Basic mode is intentionally minimal - no "score-like" visuals
- Consider a `DashboardModeContext` for component-level mode awareness

