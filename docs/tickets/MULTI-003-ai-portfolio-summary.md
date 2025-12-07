# Ticket MULTI-003: AI Portfolio Summary for Consultants (Foundation)

> **Status:** Roadmap  
> **Phase:** Consultant Mode / Multi-Tenant  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Intent

Allow AI to summarize patterns across all of a consultant's clients. Provides cross-client insights, emerging themes, and service recommendations.

---

## In Scope (Allowed)

### Backend Endpoint
- `POST /api/ai/portfolio_summary`
- Aggregate by:
  - Indices (across all orgs)
  - Band distributions
  - Participation metrics
  - Time trends

### AI Output
```typescript
{
  keyPatterns: string[];
  opportunities: string[];
  risks: string[];
  consultantInsights: {
    commonThemes: string[];
    outlierOrgs: string[];
    recommendedServices: string[];
  };
}
```

### Data Aggregation
- Collect anonymized stats from all consultant's orgs
- Compute cross-org comparisons
- Identify patterns and anomalies

---

## Out of Scope (Forbidden)

- UI dashboard (future MULTI-004)
- Auto-generated pitch decks
- Cross-consultant data sharing
- Individual respondent data exposure
- Changes to scoring engine

---

## Acceptance Criteria

- [ ] API returns summary with keyPatterns, opportunities, risks, consultantInsights
- [ ] Works with real aggregated data
- [ ] Respects data privacy (no individual responses)
- [ ] Response time < 5 seconds
- [ ] Handles consultants with 1-50 orgs
- [ ] Graceful handling when no data available

---

## Technical Notes

### Aggregation Query
```typescript
async function aggregatePortfolioStats(consultantId: string) {
  const orgs = await getConsultantOrgs(consultantId);
  
  const stats = await Promise.all(orgs.map(async (org) => ({
    orgId: org.id,
    orgName: org.name,
    indices: await getOrgIndexAverages(org.id),
    bandDistribution: await getOrgBandDistribution(org.id),
    participation: await getOrgParticipationMetrics(org.id),
    recentTrend: await getOrgTrend(org.id, '90d'),
  })));
  
  return stats;
}
```

### AI Prompt Structure
```
You are a consultant advisor analyzing a portfolio of client organizations.

Portfolio Overview:
- Total organizations: {orgCount}
- Total responses: {totalResponses}
- Date range: {dateRange}

Per-Organization Summary:
{orgSummaries}

Identify:
1. Key patterns across the portfolio
2. Opportunities for consultant services
3. Risks or concerns to address
4. Common themes that suggest bundled solutions
```

---

## Required Files to Modify

1. `server/routes/ai.ts` (add endpoint)
2. `server/services/aiService.ts` (add portfolio summary function)
3. `server/services/portfolioAggregation.ts` (new)
4. `shared/consultant.ts` (add types)
5. `docs/BUILD_LOG.md`

---

## Dependencies

- MULTI-001 (Consultant Hierarchy) must be complete first
- Existing AI service infrastructure
- Analytics data available per org

---

**End of Ticket**

