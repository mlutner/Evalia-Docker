# ANAL-DASH-020: Basic Analytics Dashboard (Non-Scored)

**Status:** ✅ Implemented  
**Phase:** Analytics UX / Implementation  
**Type:** Feature  
**Parent:** ANAL-DASH-001  
**Created:** 2025-12-05  
**Completed:** 2025-12-05  

---

## Intent

Provide a lightweight analytics view for surveys with **no scoring configuration**, focusing on participation and item-level insights only.

### Example Surveys
- Quick feedback forms
- Event satisfaction surveys (without scoring)
- Open-ended research surveys
- Simple polls
- Legacy surveys without scoreConfig

---

## Routing Rule

Applied when:
```typescript
!survey.scoreConfig 
  || survey.scoreConfig?.enabled !== true 
  || !survey.scoreConfig?.categories?.length
```

This is the **fallback** mode when neither Insight Dimensions nor Generic Scoring apply.

---

## In Scope

### Components

| Component | Type | Description |
|-----------|------|-------------|
| `BasicAnalyticsPage` | Page | Simplified container |
| `ParticipationMetricsCard` | Reuse | Response count, completion rate, avg time |
| `QuestionSummaryTable` | Reuse | Per-question statistics |
| `TopBottomItemsCard` | New | Top 5 / Bottom 5 items by avg rating |
| `NoScoringBanner` | New | Clear messaging about non-scored status |

### Metrics Used

| Metric | Source | Notes |
|--------|--------|-------|
| Participation | `computeParticipationMetrics` | Already built |
| Question Summary | `computeQuestionSummary` | Already built |
| Top/Bottom Items | Derived from Question Summary | Sort by avgValue |

### UI Requirements

- **Clear messaging:** "This survey does not have a scoring model; results are shown at question level only."
- **No score visuals:** No bands, indices, percentages, or score-related charts
- **Simple layout:** Single-page view, no complex tab structure
- **Helpful focus:** Emphasize what IS available (participation, question breakdown)

---

## Out of Scope

- Any score bands, indices, or dimensions
- ResultsScreen integration changes
- Category or dimension analytics
- Trend comparisons (no scoring versions to compare)

---

## Component Specs

### NoScoringBanner

Informational banner at top of page:

```tsx
<div className="bg-slate-100 border-l-4 border-slate-400 p-4 mb-6">
  <div className="flex items-center">
    <InfoIcon className="h-5 w-5 text-slate-500 mr-2" />
    <div>
      <h4 className="text-sm font-medium text-slate-800">
        Question-Level Analytics
      </h4>
      <p className="text-sm text-slate-600">
        This survey does not have a scoring model configured. 
        Results are shown at the question level only.
      </p>
    </div>
  </div>
</div>
```

### TopBottomItemsCard

Derived from QuestionSummary data:

```tsx
interface TopBottomItemsCardProps {
  questionSummary: QuestionSummaryData;
  topN?: number; // default 5
}

// Logic:
// 1. Filter to numeric questions only (rating, likert, NPS)
// 2. Sort by avgValue descending
// 3. Take top N and bottom N
// 4. Display with question text, avg score, mini bar
```

### BasicAnalyticsPage Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]  Survey Title - Analytics                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ℹ️ Question-Level Analytics                          │   │
│  │  This survey does not have a scoring model...        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Participation       │  │  Response Overview   │        │
│  │  ─────────────────   │  │  ─────────────────   │        │
│  │  142 Responses       │  │  95% Completion      │        │
│  │  85% Response Rate   │  │  4.2 min Avg Time    │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 Top & Bottom Items (by Average Rating)           │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │  ▲ "I feel supported by my team" ████████████ 4.5   │   │
│  │  ▲ "My work is meaningful" ███████████ 4.3          │   │
│  │  ...                                                  │   │
│  │  ▼ "I have work-life balance" ████ 2.1              │   │
│  │  ▼ "Meetings are productive" ███ 1.8                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 Question Summary                                  │   │
│  │  [Full QuestionSummaryTable component]               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Dependencies

| Ticket | Description | Status |
|--------|-------------|--------|
| ANAL-010 | Participation metrics backend | ✅ Implemented |
| ANAL-006 | Question Summary backend | ✅ Implemented |
| ANAL-011 | ParticipationMetricsCard | ✅ Implemented |

---

## Acceptance Criteria

1. **Routing Works**
   - [x] Survey without scoreConfig routes to Basic Analytics
   - [x] Survey with `enabled: false` routes to Basic Analytics
   - [x] Survey with empty categories routes to Basic Analytics

2. **Components Render**
   - [x] ParticipationMetricsCard shows correctly
   - [x] QuestionSummaryTable works with all question types
   - [x] TopBottomItemsCard shows top/bottom 5 items
   - [x] NoScoringBanner displays appropriate message

3. **No Score Visuals**
   - [x] No band colors or labels
   - [x] No percentage scores
   - [x] No dimension/category references
   - [x] No trend charts

4. **Clear Messaging**
   - [x] User understands why view is limited
   - [x] Helpful explanation of what IS available
   - [x] No confusing empty states

---

## Test Surveys

| Survey | Expected Result |
|--------|-----------------|
| No scoreConfig at all | Basic Analytics |
| scoreConfig.enabled = false | Basic Analytics |
| scoreConfig.categories = [] | Basic Analytics |
| scoreConfig.categories = [...] | NOT Basic (Generic or 5D) |

---

## Implementation Plan

1. **Create `BasicAnalyticsPage`**
   - Simple single-page layout
   - Reuse ParticipationMetricsCard
   - Reuse QuestionSummaryTable

2. **Create `NoScoringBanner`**
   - Informational component
   - Consistent with other alert/banner patterns

3. **Create `TopBottomItemsCard`**
   - Derive from question summary data
   - Filter to numeric questions
   - Sort and display top/bottom

4. **Update routing in AnalyticsPage**
   - Check dashboard mode
   - Render BasicAnalyticsPage for 'basic' mode

---

## Files to Create/Modify

### New Files
- `client/src/pages/BasicAnalyticsPage.tsx`
- `client/src/components/analytics/NoScoringBanner.tsx`
- `client/src/components/analytics/TopBottomItemsCard.tsx`

### Modified Files
- `client/src/pages/AnalyticsPage.tsx` (routing)
- `client/src/components/analytics/index.ts` (exports)

---

## Notes

- This is intentionally minimal - resist adding "score-like" features
- TopBottomItems is optional but adds value for basic surveys
- Consider adding "Enable Scoring" CTA for survey owners
- Could add simple export (CSV) for basic analytics in future

---

## Implementation Notes (2025-12-05)

### Files Created

| File | Purpose |
|------|---------|
| `client/src/components/analytics/NoScoringBanner.tsx` | Informational banner for basic mode |
| `client/src/components/analytics/TopBottomItemsCard.tsx` | Top/bottom 5 questions by rating |

### Files Modified

| File | Changes |
|------|---------|
| `client/src/pages/AnalyticsPage.tsx` | Added basic mode conditional rendering |
| `client/src/components/analytics/index.ts` | Added NoScoringBanner, TopBottomItemsCard exports |
| `client/src/__tests__/analytics/AnalyticsPage.integration.test.tsx` | Updated test for basic mode |

### Basic Mode UI

When `dashboardMode.mode === 'basic'`:

```
┌──────────────────────────────────────────────┐
│ ← Back to Dashboard                          │
│                                              │
│ Survey Title - Analytics                     │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 📊 Question-Level Analytics              │ │
│ │ This survey does not have a scoring...   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Participation Metrics                    │ │
│ │ Total Responses: 142 | Completion: 95%   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Top & Bottom Items                       │ │
│ │ ▲ Highest rated questions                │ │
│ │ ▼ Lowest rated questions                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Question Summary (Full Table)            │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Key Differences from Scored Modes

| Feature | Basic Mode | Scored Modes |
|---------|------------|--------------|
| Tabs | ❌ None | 5-7 tabs |
| Score distribution | ❌ No | ✅ Yes |
| Band charts | ❌ No | ✅ Yes |
| Dimension/Category leaderboard | ❌ No | ✅ Yes |
| Trends | ❌ No | ✅ Yes |
| Top/Bottom Items | ✅ Yes | ❌ No |
| NoScoringBanner | ✅ Yes | ❌ No |

### Tests

- 71 tests passing
- Updated integration test to expect "Question-Level Analytics" text

