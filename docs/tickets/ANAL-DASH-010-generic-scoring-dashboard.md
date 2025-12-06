# ANAL-DASH-010: Generic Scoring Dashboard (Category-Based)

**Status:** ✅ Implemented  
**Phase:** Analytics UX / Implementation  
**Type:** Feature  
**Parent:** ANAL-DASH-001  
**Created:** 2025-12-05  
**Completed:** 2025-12-05  

---

## Intent

Provide a reusable analytics dashboard for any survey that has scoring categories but is **not** using the Evalia 5D Insight Dimensions model.

### Example Surveys
- Training Readiness Assessment
- Learning Culture Health Check
- Manager Capability Survey
- Custom client-specific scored surveys

---

## Routing Rule

Applied when:
```typescript
survey.scoreConfig?.enabled === true
  && survey.scoreConfig.categories?.length > 0
  && !isCanonical5DDashboard(survey.scoreConfig.categories)
```

Where `isCanonical5DDashboard` checks if category IDs match the canonical 5D set defined in `INSIGHT_DIMENSIONS`.

---

## In Scope

### Components

| Component | Type | Description |
|-----------|------|-------------|
| `GenericScoringAnalyticsPage` | Page | Main container with tab structure |
| `CategoryLeaderboardTable` | New | Ranked list of categories by score |
| `CategoryScoreCard` | New | Summary card showing overall/avg category score |
| `CategoryDistributionChart` | Adapted | Histogram of scores by band (reuse existing) |
| `CategoryTrendChart` | Adapted | Score trends over versions (if available) |
| `QuestionSummaryTable` | Reuse | Per-question statistics |

### Metrics Used

| Metric | Source | Notes |
|--------|--------|-------|
| Overall Index Score | `calculateSurveyScores` | Synthetic average if no explicit overall |
| Category Scores | `calculateSurveyScores` | Per-category from scoreConfig |
| Category Distribution | Existing bucket logic | Reuse `computeIndexDistribution` |
| Category Trends | `score_config_versions` | If multiple versions exist |
| Question Summary | `computeQuestionSummary` | Already built |

### UI Requirements

- **Header:** "Category Analytics" (distinct from "Insight Dimensions")
- **No dimension-specific language:** No "burnout inversion", no 5D leaderboard
- **Generic band labels:** Use scoreConfig's band labels, not hardcoded EID bands
- **Tab structure:** Simplified version of 7-tab IA
  - Overview | Categories | Questions | Responses

---

## Out of Scope

- 5D-specific logic (dimensions, burnout inversion, dimension leaderboard)
- Manager-specific analytics (can be added in ANAL-DASH-011)
- New backend scoring engines
- Custom band theming beyond scoreConfig

---

## Component Specs

### CategoryLeaderboardTable

Similar to `DimensionLeaderboardTable` but:
- Uses `scoreConfig.categories` for labels
- No burnout inversion logic
- Generic performance ranking (highest score = #1)
- Shows band from `scoreConfig.scoreRanges` if category-specific

```tsx
interface CategoryLeaderboardProps {
  categories: Array<{
    categoryId: string;
    categoryName: string;
    score: number;
    maxScore: number;
    interpretation: string;
  }>;
  scoreRanges: ScoreBandConfig[];
}
```

### CategoryScoreCard

Simple summary card:
- Overall average score across categories
- Overall band (if scoreRanges defined)
- Response count
- Completion rate

---

## Dependencies

| Ticket | Description | Status |
|--------|-------------|--------|
| SCORE-002 | Band property alignment | ✅ Fixed |
| ANAL-IA-001 | Tab structure patterns | ✅ Implemented |
| ANAL-006 | Question Summary backend | ✅ Implemented |

---

## Acceptance Criteria

1. **Routing Works**
   - [x] Non-5D scored survey routes to Generic Scoring Dashboard
   - [x] 5D survey still routes to Insight Dimensions Dashboard
   - [x] No runtime errors when switching between survey types

2. **Components Render**
   - [x] CategoryLeaderboardTable shows all categories ranked
   - [x] Distribution chart shows correct band distribution
   - [x] Question Summary table works correctly
   - [x] Trend chart shows version comparison (if versions exist)

3. **Labeling Correct**
   - [x] Tab says "Overview" / "Categories" (not "Insights Home" / "Dimensions")
   - [x] No references to "Engagement Energy", "Burnout Risk", etc.
   - [x] Uses category names from `scoreConfig.categories`

4. **Bands Correct**
   - [x] Uses bands from `scoreConfig.scoreRanges`
   - [x] Correctly matches scores to bands using `min/max`
   - [x] Shows interpretation text if available

---

## Test Surveys

| Survey | Expected Dashboard | Notes |
|--------|-------------------|-------|
| 5D Smoke Test | Insight Dimensions | Has canonical 5D categories |
| Wellbeing Pulse (fixed) | Generic Scoring | Has 4 categories, not full 5D |
| Training Readiness | Generic Scoring | L&D template with custom categories |
| Quick Feedback Form | Basic Analytics | No scoring enabled |

---

## Implementation Plan

1. **Create `useDashboardMode` hook**
   - Determine mode from survey scoreConfig
   - Export mode type for components

2. **Create `GenericScoringAnalyticsPage`**
   - Copy structure from AnalyticsPage
   - Remove 5D-specific components
   - Add generic category components

3. **Create `CategoryLeaderboardTable`**
   - Adapt from DimensionLeaderboardTable
   - Remove burnout inversion
   - Use generic band resolution

4. **Update AnalyticsPage routing**
   - Add mode check at top of page
   - Render appropriate dashboard based on mode

5. **Test with mixed surveys**
   - Verify correct dashboard selection
   - Verify no cross-contamination of labels

---

## Files to Create/Modify

### New Files
- `client/src/pages/GenericScoringAnalyticsPage.tsx`
- `client/src/components/analytics/CategoryLeaderboardTable.tsx`
- `client/src/components/analytics/CategoryScoreCard.tsx`
- `client/src/hooks/useDashboardMode.ts`

### Modified Files
- `client/src/pages/AnalyticsPage.tsx` (add routing)
- `client/src/components/analytics/index.ts` (exports)

---

## Notes

- Consider extracting shared tab components to avoid duplication
- CategoryLeaderboardTable can be 80% copy of DimensionLeaderboardTable
- May want to create `useGenericScores` hook similar to `useIndexTrendsSummary`

---

## Implementation Notes (2025-12-05)

### Dev Tools Navigation Added to Sidebar

Added "Dev Tools" section to `AppSidebar.tsx`:
- Only visible when `import.meta.env.DEV`
- Links to `/dev/inspector` and `/dev/analytics-inspector`

### Files Created

| File | Purpose |
|------|---------|
| `client/src/hooks/useDashboardMode.ts` | Dashboard mode detection hook |
| `client/src/components/analytics/CategoryLeaderboardTable.tsx` | Category ranking table |
| `client/src/components/analytics/CategoryScoreCard.tsx` | Overall score summary card |

### Dashboard Mode Detection

```typescript
type DashboardMode = 'insight-dimensions' | 'generic-scoring' | 'basic';

// Detection logic:
// - basic: scoring disabled OR no categories
// - insight-dimensions: has ≥3 canonical 5D category IDs
// - generic-scoring: has categories but not 5D
```

### UI Adaptations

| Feature | 5D Mode | Generic Mode |
|---------|---------|--------------|
| Tab 1 label | "Insights Home" | "Overview" |
| Tab 2 label | "Dimensions" | "Categories" |
| Managers tab | ✓ Shown | ✗ Hidden |
| Benchmarks tab | ✓ Shown | ✗ Hidden |
| Trends tab | ✓ Shown | ✓ Shown (if scoring enabled) |
| Leaderboard | DimensionLeaderboardTable | CategoryLeaderboardTable |
| Score card | — | CategoryScoreCard |

### Tests

All 71 existing analytics tests continue to pass. Dashboard mode routing tested manually.

