# HARDEN-006: Analytics Graceful Degradation

## Priority: HIGH
## Status: Ready
## Time Estimate: 2 days
## Category: Error Handling
## Epic: HARDEN-000

---

## Objective

Every analytics hook and component should degrade gracefully when data is missing, malformed, or API calls fail. Never crash - show helpful fallback UI instead.

---

## Implementation Instructions

### Step 1: Create Safe Data Defaults

**Create:** `client/src/utils/analyticsDefaults.ts`

```typescript
/**
 * Analytics Safe Defaults
 * 
 * Default values for analytics data when APIs fail or data is missing.
 * Ensures components never receive undefined/null.
 * 
 * [HARDEN-006]
 */

import type {
  ParticipationMetrics,
  CategoryScore,
  IndexDistribution,
  DimensionTrend,
  BandDistribution
} from '@/types/analytics';

export const DEFAULT_PARTICIPATION: ParticipationMetrics = {
  totalInvited: 0,
  totalStarted: 0,
  totalCompleted: 0,
  completionRate: 0,
  averageTimeMinutes: 0,
  responsesByDay: []
};

export const DEFAULT_CATEGORY_SCORES: CategoryScore[] = [];

export const DEFAULT_INDEX_DISTRIBUTION: IndexDistribution = {
  indexType: 'engagement-5d',
  buckets: [],
  mean: 0,
  median: 0,
  standardDeviation: 0,
  totalResponses: 0
};

export const DEFAULT_BAND_DISTRIBUTION: BandDistribution = {
  indexType: 'engagement-5d',
  bands: [],
  totalResponses: 0
};

export const DEFAULT_DIMENSION_TRENDS: DimensionTrend[] = [];

// ============================================================================
// SAFE ACCESSORS
// ============================================================================

export function safeNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  return fallback;
}

export function safeArray<T>(value: any, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

export function safeString(value: any, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function safePercent(value: any): number {
  const num = safeNumber(value, 0);
  return Math.min(100, Math.max(0, num));
}
```

### Step 2: Update Analytics Hooks with Fallbacks

**Modify:** `client/src/components/analytics/useParticipationMetrics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PARTICIPATION, safeNumber } from '@/utils/analyticsDefaults';

export function useParticipationMetrics(surveyId: string | undefined) {
  return useQuery({
    queryKey: ['participation', surveyId],
    queryFn: async () => {
      if (!surveyId) return DEFAULT_PARTICIPATION;
      
      const response = await fetch(`/api/analytics/${surveyId}/participation`);
      if (!response.ok) {
        console.warn(`[Analytics] Participation fetch failed: ${response.status}`);
        return DEFAULT_PARTICIPATION;
      }
      
      const data = await response.json();
      
      // Sanitize response
      return {
        totalInvited: safeNumber(data.totalInvited, 0),
        totalStarted: safeNumber(data.totalStarted, 0),
        totalCompleted: safeNumber(data.totalCompleted, 0),
        completionRate: safeNumber(data.completionRate, 0),
        averageTimeMinutes: safeNumber(data.averageTimeMinutes, 0),
        responsesByDay: Array.isArray(data.responsesByDay) ? data.responsesByDay : []
      };
    },
    
    // KEY: Return defaults on error instead of throwing
    placeholderData: DEFAULT_PARTICIPATION,
    
    // Don't retry too aggressively
    retry: 1,
    retryDelay: 1000,
    
    // Stale data is better than no data
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Enable when we have a survey ID
    enabled: !!surveyId
  });
}
```

**Modify:** `client/src/components/analytics/useIndexDistribution.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_INDEX_DISTRIBUTION, safeNumber, safeArray } from '@/utils/analyticsDefaults';

export function useIndexDistribution(surveyId: string | undefined, indexType: string = 'engagement-5d') {
  return useQuery({
    queryKey: ['indexDistribution', surveyId, indexType],
    queryFn: async () => {
      if (!surveyId) return DEFAULT_INDEX_DISTRIBUTION;
      
      try {
        const response = await fetch(`/api/analytics/${surveyId}/index-distribution?type=${indexType}`);
        
        if (!response.ok) {
          console.warn(`[Analytics] Index distribution fetch failed: ${response.status}`);
          return DEFAULT_INDEX_DISTRIBUTION;
        }
        
        const data = await response.json();
        
        return {
          indexType: data.indexType || indexType,
          buckets: safeArray(data.buckets, []),
          mean: safeNumber(data.mean, 0),
          median: safeNumber(data.median, 0),
          standardDeviation: safeNumber(data.standardDeviation, 0),
          totalResponses: safeNumber(data.totalResponses, 0)
        };
      } catch (error) {
        console.error('[Analytics] Index distribution error:', error);
        return DEFAULT_INDEX_DISTRIBUTION;
      }
    },
    
    placeholderData: DEFAULT_INDEX_DISTRIBUTION,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!surveyId
  });
}
```

### Step 3: Create Wrapper Component for Safe Rendering

**Create:** `client/src/components/analytics/SafeAnalyticsCard.tsx`

```typescript
/**
 * Safe Analytics Card Wrapper
 * 
 * Wraps analytics components to handle loading, error, and empty states.
 * 
 * [HARDEN-006]
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafeAnalyticsCardProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  errorMessage?: string;
  className?: string;
}

export function SafeAnalyticsCard({
  title,
  children,
  isLoading,
  isError,
  isEmpty,
  onRetry,
  emptyMessage = 'No data available yet',
  errorMessage = 'Unable to load data',
  className
}: SafeAnalyticsCardProps) {
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{errorMessage}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (isEmpty) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Data will appear after responses are collected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Normal render
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Update Analytics Components to Use Safe Wrapper

**Example:** `client/src/components/analytics/ParticipationMetricsCard.tsx`

```typescript
import { SafeAnalyticsCard } from './SafeAnalyticsCard';
import { useParticipationMetrics } from './useParticipationMetrics';

interface ParticipationMetricsCardProps {
  surveyId: string;
}

export function ParticipationMetricsCard({ surveyId }: ParticipationMetricsCardProps) {
  const { data, isLoading, isError, refetch } = useParticipationMetrics(surveyId);
  
  const isEmpty = !isLoading && !isError && data?.totalCompleted === 0;
  
  return (
    <SafeAnalyticsCard
      title="Participation"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onRetry={() => refetch()}
      emptyMessage="No responses yet"
    >
      <div className="grid grid-cols-2 gap-4">
        <MetricItem label="Completed" value={data?.totalCompleted || 0} />
        <MetricItem label="Completion Rate" value={`${data?.completionRate || 0}%`} />
        <MetricItem label="Started" value={data?.totalStarted || 0} />
        <MetricItem label="Avg. Time" value={`${data?.averageTimeMinutes || 0} min`} />
      </div>
    </SafeAnalyticsCard>
  );
}

function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
```

### Step 5: Create Analytics Page Error Recovery

**Modify:** `client/src/pages/AnalyticsPage.tsx`

Add at the top of the component:

```typescript
// Check for fatal issues that would prevent analytics from working
const { data: survey, isError: surveyError } = useSurvey(surveyId);
const { data: health } = useQuery({
  queryKey: ['survey-health', surveyId],
  queryFn: () => checkSurveyHealth(survey!),
  enabled: !!survey
});

// Show guidance if survey has no scoring
if (survey && !survey.scoreConfig?.enabled) {
  return (
    <div className="container mx-auto py-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analytics Not Available</AlertTitle>
        <AlertDescription>
          This survey doesn't have scoring enabled. Analytics require scored responses.
          <Button variant="link" asChild className="p-0 h-auto ml-2">
            <a href={`/builder/${surveyId}`}>Configure Scoring →</a>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Show guidance if no responses
const { data: participation } = useParticipationMetrics(surveyId);
if (participation?.totalCompleted === 0) {
  return (
    <div className="container mx-auto py-8">
      <Alert>
        <BarChart3 className="h-4 w-4" />
        <AlertTitle>Waiting for Responses</AlertTitle>
        <AlertDescription>
          Analytics will appear once respondents complete the survey.
          Share the survey link to start collecting responses.
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

---

## Testing Instructions

### Manual Test 1: API Failure Handling

1. Open browser DevTools → Network
2. Block `/api/analytics/*` requests
3. Navigate to Analytics page
4. Verify: Cards show error state with "Try Again"
5. Unblock requests
6. Click "Try Again"
7. Verify: Data loads

### Manual Test 2: Empty Data Handling

1. Create new survey with scoring enabled
2. Don't submit any responses
3. Navigate to Analytics
4. Verify: Empty states show "No data available yet"

### Manual Test 3: Malformed Data Handling

1. Temporarily modify API to return `{ totalCompleted: "invalid" }`
2. Navigate to Analytics
3. Verify: Component doesn't crash
4. Verify: Shows 0 instead of "invalid"

---

## Acceptance Criteria

- [ ] All analytics hooks have default/fallback values
- [ ] API failures show error state, not crash
- [ ] Empty data shows helpful empty state
- [ ] Loading state uses skeletons
- [ ] "Try Again" button allows recovery
- [ ] Malformed data is sanitized
- [ ] No console errors for expected empty states

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/utils/analyticsDefaults.ts` | CREATE |
| `client/src/components/analytics/SafeAnalyticsCard.tsx` | CREATE |
| `client/src/components/analytics/useParticipationMetrics.ts` | MODIFY |
| `client/src/components/analytics/useIndexDistribution.ts` | MODIFY |
| `client/src/components/analytics/*.tsx` | MODIFY (all cards) |
| `client/src/pages/AnalyticsPage.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-007: User-Friendly Empty States

