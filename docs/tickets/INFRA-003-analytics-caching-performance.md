# INFRA-003: Analytics Caching / Performance

## Priority: LOW (Future)
## Status: Backlog - Structural Gap
## Category: Performance Infrastructure

---

## Problem Statement

At scale, analytics queries will be expensive:
- Aggregating 10,000+ responses per survey
- Complex dimension calculations
- Multiple chart types on single page load

Current implementation is real-time calculation. This won't scale.

---

## Proposed Solutions

### 1. Nightly Aggregations

Pre-compute common metrics during off-peak hours:

```typescript
interface PrecomputedAnalytics {
  surveyId: string;
  computedAt: Date;
  
  // Pre-aggregated data
  participationMetrics: ParticipationMetrics;
  categoryScores: CategoryScore[];
  indexDistribution: IndexDistribution;
  dimensionTrends: DimensionTrend[];
}

// Nightly job
async function runNightlyAggregations() {
  const surveys = await getActiveSurveys();
  for (const survey of surveys) {
    await computeAndStoreAnalytics(survey.id);
  }
}
```

### 2. Caching Layer

```typescript
// Redis or in-memory cache
const analyticsCache = {
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, data: T, ttl: number): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
};

// Cache invalidation triggers
// - New response submitted
// - Scoring config changed
// - Manual refresh requested
```

### 3. Pagination for Responses

```typescript
interface PaginatedResponses {
  data: Response[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
  };
}

// For large surveys
GET /api/surveys/:id/responses?page=1&pageSize=100
```

---

## Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| Analytics page load | ~2s | <500ms |
| Response fetch (10k) | ~5s | <1s |
| Chart render | ~500ms | <200ms |

---

## Acceptance Criteria

**Note: Don't implement yet - just capture requirements**

- [ ] Nightly aggregation job defined
- [ ] Cache invalidation strategy documented
- [ ] Pagination API designed
- [ ] Performance benchmarks established
- [ ] Monitoring/alerting for slow queries

---

## Implementation Notes (Future)

### Infrastructure Needs
- Redis for caching (or similar)
- Background job runner (Bull, Agenda)
- Performance monitoring (DataDog, etc.)

### Migration Path
1. Add caching layer with fallback to real-time
2. Implement nightly aggregations
3. Migrate analytics to use cached data
4. Add cache warming on deploy
5. Monitor and tune

---

## Related Tickets
- ANAL-QA-030: Shared Helpers Refactor
- ANAL-001: Analytics Data Model Registry

