# Ticket ANAL-QA-050: Confidence/Empty-State Rules

> **Status:** ✅ Implemented  
> **Phase:** Quality Assurance  
> **Priority:** Medium  
> **Parent Epic:** ANAL-QA-001  
> **Created:** 2025-12-06  
> **Completed:** 2025-12-05

---

## Goal

Ensure all analytics components show clear, helpful messages when:
- Data is missing or insufficient
- Response counts are too low for meaningful analysis
- API returns nulls/errors

**No heavy statistics** – just clear guardrails and messaging.

---

## Current State

| Component | Empty State | Quality |
|-----------|-------------|---------|
| `ParticipationMetricsCard` | Shows 0s | ⚠️ Could be clearer |
| `IndexDistributionChart` | "Loading..." or error | ⚠️ Needs empty state |
| `BandDistributionChart` | "Loading..." or error | ⚠️ Needs empty state |
| `QuestionSummaryTable` | "No questions" | ✅ OK |
| `ManagerComparisonTable` | "No managers" | ✅ OK |
| `DimensionTrendsChart` | "No trend data" | ✅ OK |
| `DimensionLeaderboardTable` | "No dimension data" | ✅ OK |
| `BeforeAfterComparisonChart` | "Select versions" | ✅ OK |

---

## Rules to Implement

### Rule 1: Minimum Response Threshold

If a metric has < N responses, show a warning instead of (or alongside) the chart.

```typescript
const MIN_RESPONSES_FOR_MEANINGFUL_DATA = 5;

if (data.totalResponses < MIN_RESPONSES_FOR_MEANINGFUL_DATA) {
  return (
    <ConfidenceWarning>
      Only {data.totalResponses} responses. Results may not be representative.
      We recommend at least {MIN_RESPONSES_FOR_MEANINGFUL_DATA} responses.
    </ConfidenceWarning>
  );
}
```

### Rule 2: All-Null Dimension Scores

If `indexTrendsSummary` returns all null scores:

```typescript
if (Object.values(scores).every(s => s === null)) {
  return (
    <EmptyState>
      No dimension data available.
      This survey may not have scoring categories that map to Insight Dimensions.
    </EmptyState>
  );
}
```

### Rule 3: Single Version for Trends

If `trends.length === 1`:

```typescript
return (
  <InfoMessage>
    Single scoring version available. Create additional versions to see trends over time.
  </InfoMessage>
);
```

### Rule 4: No Managers for Manager Comparison

Already handled, but ensure message is helpful:

```typescript
<EmptyState>
  No manager data available.
  Ensure survey responses include manager metadata.
</EmptyState>
```

---

## Shared Components

### Create: `ConfidenceWarning`

```typescript
// client/src/components/analytics/ConfidenceWarning.tsx
interface ConfidenceWarningProps {
  children: React.ReactNode;
  severity?: 'info' | 'warning';
}

export function ConfidenceWarning({ children, severity = 'info' }: ConfidenceWarningProps) {
  const bgColor = severity === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
  const iconColor = severity === 'warning' ? 'text-amber-500' : 'text-blue-500';
  
  return (
    <div className={`p-3 rounded-lg border ${bgColor} flex items-start gap-2 text-sm`}>
      <Info className={`w-4 h-4 mt-0.5 ${iconColor}`} />
      <span className="text-gray-700">{children}</span>
    </div>
  );
}
```

### Create: `DataEmptyState`

```typescript
// client/src/components/analytics/DataEmptyState.tsx
interface DataEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export function DataEmptyState({ title, description, icon: Icon = AlertTriangle }: DataEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md">{description}</p>
    </div>
  );
}
```

---

## Components to Update

### IndexDistributionChart

Add empty state for when `buckets` is empty or all zeros:

```typescript
if (!data?.buckets?.some(b => b.count > 0)) {
  return (
    <DataEmptyState 
      title="No Score Data"
      description="No responses have been scored yet."
    />
  );
}
```

### BandDistributionChart

Add empty state for when `bands` is empty:

```typescript
if (!data?.bands?.some(b => b.count > 0)) {
  return (
    <DataEmptyState 
      title="No Band Data"
      description="No responses have been assigned to performance bands."
    />
  );
}
```

### ParticipationMetricsCard

Add low-confidence warning:

```typescript
{metrics.totalResponses > 0 && metrics.totalResponses < 5 && (
  <ConfidenceWarning severity="warning">
    Low response count ({metrics.totalResponses}). Results may not be statistically meaningful.
  </ConfidenceWarning>
)}
```

---

## Backend Logging

Add logging in analytics routes for debugging:

```typescript
// server/routes/analytics.ts
case METRIC_IDS.PARTICIPATION_METRICS: {
  console.log(`[Analytics] participation_metrics for survey=${surveyId}, version=${versionParam}`);
  
  const metrics = await computeParticipationMetrics(surveyId, effectiveVersionId);
  
  console.log(`[Analytics] participation_metrics result: responses=${metrics.totalResponses}`);
  
  // Warn if data looks suspicious
  if (metrics.totalResponses === 0) {
    console.warn(`[Analytics] Survey ${surveyId} has 0 responses`);
  }
  
  return res.json({ meta, data: metrics });
}
```

---

## Acceptance Criteria

- [x] Analytics state classification helper created (`deriveAnalyticsScoringState`)
- [x] Empty state components created (`AnalyticsStateBanner`, `SingleVersionIndicator`, `ScoringDisabledCard`)
- [x] All chart components have meaningful empty states based on analytics mode
- [x] Dev-mode invariant logging for broken states (`checkAnalyticsInvariants`)
- [x] No charts show misleading data (zeros presented as real data)
- [x] Frontend tests cover: non-scored survey, misconfigured scoring, no responses, single-version trends

### Implementation Notes (2025-12-05)

**Created `client/src/utils/analyticsState.ts`:**
- `deriveAnalyticsScoringState(input)` - returns state with:
  - `state`: 'no-responses' | 'no-scoring' | 'misconfigured-scoring' | 'single-version' | 'healthy'
  - `showScoring`, `showTrends`, `showParticipation`, `showQuestionSummary` flags
  - `title`, `message`, `severity` for UX messaging
- `checkAnalyticsInvariants()` - logs `[ANALYTICS-INVARIANT]` warnings in dev mode
- `isDistributionEmpty()` - helper for checking empty distributions

**Updated `client/src/pages/AnalyticsPage.tsx`:**
- Uses `useMemo` to derive analytics state from survey config and data
- `AnalyticsStateBanner` - shows warnings for non-healthy states
- `SingleVersionIndicator` - displayed in Trends tab when only one version
- `ScoringDisabledCard` - replaces scoring charts when scoring unavailable
- Conditional rendering in Insights Home, Dimensions, and Trends tabs
- `useEffect` hook calls `checkAnalyticsInvariants` in dev mode

**Tests:** 21 new tests in `client/src/utils/__tests__/analyticsState.test.ts`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `client/src/components/analytics/ConfidenceWarning.tsx` | Create |
| `client/src/components/analytics/DataEmptyState.tsx` | Create |
| `client/src/components/analytics/IndexDistributionChart.tsx` | Add empty state |
| `client/src/components/analytics/BandDistributionChart.tsx` | Add empty state |
| `client/src/components/analytics/ParticipationMetricsCard.tsx` | Add low-N warning |
| `server/routes/analytics.ts` | Add logging |

---

**End of Ticket**

