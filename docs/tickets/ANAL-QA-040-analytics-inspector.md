# Ticket ANAL-QA-040: Analytics Inspector (Dev Only)

> **Status:** ✅ Implemented  
> **Phase:** Quality Assurance  
> **Priority:** Medium  
> **Parent Epic:** ANAL-QA-001  
> **Created:** 2025-12-06  
> **Completed:** 2025-12-05

---

## Goal

Create a dev-only Analytics Inspector page at `/dev/analytics-inspector` that shows raw JSON payloads for all analytics metrics. Enables quick debugging by comparing:
- Raw API response
- Chart rendering
- Expected values

---

## Route

**Path:** `/dev/analytics-inspector`  
**Access:** Dev-only (only rendered when `import.meta.env.DEV`)

---

## UI Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Analytics Inspector                                    [Survey: ▼]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─── Participation Metrics ─────────────────────────────────────────┐  │
│ │ {                                                                  │  │
│ │   "totalResponses": 5,                                             │  │
│ │   "responseRate": null,                                            │  │
│ │   "completionRate": 100,                                           │  │
│ │   "avgCompletionTime": 245                                         │  │
│ │ }                                                                  │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─── Index Distribution (engagement) ───────────────────────────────┐  │
│ │ {                                                                  │  │
│ │   "buckets": [...],                                                │  │
│ │   "totalResponses": 5,                                             │  │
│ │   ...                                                              │  │
│ │ }                                                                  │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─── Band Distribution (engagement) ────────────────────────────────┐  │
│ │ { ... }                                                            │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─── Question Summary ──────────────────────────────────────────────┐  │
│ │ { ... }                                                            │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─── Manager Index Summary ─────────────────────────────────────────┐  │
│ │ { ... }                                                            │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─── Index Trends Summary ──────────────────────────────────────────┐  │
│ │ { ... }                                                            │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─── Before/After Comparison ───────────────────────────────────────┐  │
│ │ { ... }                                                            │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Component: `client/src/pages/dev/AnalyticsInspectorPage.tsx`

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useParticipationMetrics,
  useIndexDistribution,
  useIndexBandDistribution,
  useQuestionSummary,
  useManagerIndexSummary,
  useIndexTrendsSummary,
  useBeforeAfterComparison,
} from '@/components/analytics';

export default function AnalyticsInspectorPage() {
  const [surveyId, setSurveyId] = useState<string>('');
  
  // Fetch all surveys for dropdown
  const { data: surveys } = useQuery({
    queryKey: ['/api/surveys'],
  });

  // Fetch all analytics data
  const participation = useParticipationMetrics({ surveyId, enabled: !!surveyId });
  const indexDist = useIndexDistribution({ surveyId, metricId: 'engagement_index_distribution', enabled: !!surveyId });
  const bandDist = useIndexBandDistribution({ surveyId, metricId: 'engagement_index_band_distribution', enabled: !!surveyId });
  const questionSummary = useQuestionSummary({ surveyId, enabled: !!surveyId });
  const managerSummary = useManagerIndexSummary({ surveyId, enabled: !!surveyId });
  const trendsSummary = useIndexTrendsSummary({ surveyId, enabled: !!surveyId });
  // ... etc

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics Inspector</h1>
      
      {/* Survey selector */}
      <select 
        value={surveyId} 
        onChange={(e) => setSurveyId(e.target.value)}
        className="mb-6 p-2 border rounded"
      >
        <option value="">Select a survey...</option>
        {surveys?.map((s) => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>

      {surveyId && (
        <div className="space-y-6">
          <MetricCard title="Participation Metrics" data={participation.metrics} loading={participation.isLoading} />
          <MetricCard title="Index Distribution" data={indexDist.data} loading={indexDist.isLoading} />
          <MetricCard title="Band Distribution" data={bandDist.data} loading={bandDist.isLoading} />
          <MetricCard title="Question Summary" data={questionSummary.data} loading={questionSummary.isLoading} />
          <MetricCard title="Manager Index Summary" data={managerSummary.data} loading={managerSummary.isLoading} />
          <MetricCard title="Index Trends Summary" data={trendsSummary.data} loading={trendsSummary.isLoading} />
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, data, loading }: { title: string; data: any; loading: boolean }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 font-semibold">{title}</div>
      <pre className="p-4 overflow-auto text-xs bg-gray-50 max-h-80">
        {loading ? 'Loading...' : JSON.stringify(data, null, 2) || 'No data'}
      </pre>
    </div>
  );
}
```

### Route Registration

```typescript
// client/src/App.tsx (inside Router, dev-only)
{import.meta.env.DEV && (
  <Route path="/dev/analytics-inspector" component={AnalyticsInspectorPage} />
)}
```

---

## Features

### Must Have
- [x] Survey dropdown selector
- [x] Raw JSON display for all 6+ analytics metrics
- [x] Loading states per metric
- [x] Collapsible/expandable sections

### Nice to Have
- [x] Copy JSON button
- [x] Error display (not just "No data")
- [x] Derived analyticsState display
- [ ] Search/filter JSON (not implemented)

---

## Acceptance Criteria

- [x] Route only accessible in dev mode
- [x] All current analytics hooks displayed
- [x] Can select any survey from dropdown
- [x] JSON is valid and matches API responses
- [x] Useful for debugging discrepancies

---

## Implementation Notes (2025-12-05)

### File Created: `client/src/pages/dev/AnalyticsInspectorPage.tsx`

**Features:**
- **Survey Selector:** Dropdown with all surveys, loads from `/api/surveys`
- **Survey Info Panel:** Shows survey ID, scoring enabled, categories count, score ranges count
- **Analytics State Panel:** Shows derived mode, showScoring, showTrends flags, and state message
- **Metric Panels (8 total):**
  1. Participation Metrics
  2. Index Distribution (Engagement)
  3. Band Distribution (Engagement)
  4. Question Summary
  5. Manager Index Summary
  6. Index Trends Summary
  7. Versions
  8. scoreConfig (Raw)
- **UI Features:**
  - Collapsible sections (click to expand/collapse)
  - Status indicators (OK=green, Loading=yellow, Error=red)
  - Copy JSON button per panel
  - Refresh All button
  - Dark code theme for JSON display

### Route Added: `client/src/App.tsx`

```typescript
{isDev && (
  <Route path="/dev/analytics-inspector">
    {() => <ProtectedRoute component={AnalyticsInspectorPage} />}
  </Route>
)}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `client/src/pages/dev/AnalyticsInspectorPage.tsx` | Create |
| `client/src/App.tsx` | Add dev route |

---

**End of Ticket**

