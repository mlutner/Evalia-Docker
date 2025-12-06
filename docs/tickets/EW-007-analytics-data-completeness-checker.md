# EW-007: Analytics Data Completeness Checker

## Priority: MEDIUM
## Status: Planned
## Category: Analytics Infrastructure

---

## Problem Statement

Analytics is now complex with versioning, scoring configurations, and multi-mode dashboards. We need a maintenance utility to proactively identify data issues before they affect users.

---

## Utility Requirements

### Quick Scan Capabilities

The checker should scan surveys and flag:

1. **No Scoring**
   - Survey has responses but no scoreConfig
   - Dashboard would fail to render

2. **Partial Scoring**
   - Some questions have scoring, others don't
   - Results would be incomplete

3. **Invalid Mappings**
   - scoringCategory references non-existent category
   - Dimension mappings incomplete

4. **Missing Scoring Version**
   - Response doesn't have scoring version snapshot
   - Historical analytics would fail

5. **Version Count Mismatch**
   - Analytics expects N versions but found M
   - Trend charts would be incorrect

---

## Implementation

### CLI Interface

```bash
# Scan all surveys
npm run analytics:check

# Scan specific survey
npm run analytics:check --survey-id=abc123

# Output formats
npm run analytics:check --format=json
npm run analytics:check --format=table
```

### API Endpoint (Dev Only)

```
GET /api/dev/analytics/health-check
GET /api/dev/analytics/health-check/:surveyId
```

### Output Format

```json
{
  "surveyId": "abc123",
  "status": "warning",
  "issues": [
    {
      "type": "partial-scoring",
      "severity": "warning",
      "message": "3 of 10 questions missing scoringCategory",
      "affectedQuestions": ["q1", "q5", "q7"]
    }
  ],
  "recommendations": [
    "Run auto-heal to fix missing categories"
  ]
}
```

---

## Acceptance Criteria

- [ ] Detects all 5 issue types
- [ ] Clear severity levels (error/warning/info)
- [ ] Actionable recommendations
- [ ] CLI and API interfaces
- [ ] Can run on single survey or all surveys
- [ ] Performance: < 5s for full scan
- [ ] Integrates with dev tools panel

---

## Implementation Notes

### Files to Create
- `server/utils/analyticsHealthCheck.ts` - Core logic
- `server/routes/devAnalytics.ts` - API endpoint
- `scripts/analytics-check.ts` - CLI script
- `client/src/pages/dev/AnalyticsHealthPage.tsx` - UI (optional)

### Integration Points
- Run automatically on analytics page load (dev only)
- Show warnings in builder if issues detected
- Include in CI/CD pipeline

---

## Related Tickets
- EW-003: Scoring Config Validator v2
- ANAL-QA-040: Analytics Inspector

