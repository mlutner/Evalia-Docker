# EW-005: Template Classification for Dashboard Mode

## Priority: MEDIUM
## Status: Planned
## Category: Template Infrastructure

---

## Problem Statement

Currently, dashboard mode detection works based on presence of 5D categories. This is fragile and can lead to wrong dashboards being shown by mistake.

We need to formalize dashboard mode as explicit template metadata.

---

## Proposed Solution

### Add `dashboardMode` Metadata to Templates

```typescript
type DashboardMode = 
  | "insight-dimensions"  // Full 5D analytics
  | "generic-scoring"     // Simple score + bands
  | "basic";              // No scoring, just responses

interface SurveyTemplate {
  // ... existing fields
  dashboardMode: DashboardMode;
}
```

### Dashboard Mode Definitions

| Mode | Description | Analytics Features |
|------|-------------|-------------------|
| `insight-dimensions` | Full 5D engagement model | All 5 dimensions, category leaderboard, dimension trends, index distribution |
| `generic-scoring` | Custom scoring categories | Category scores, overall score, custom bands |
| `basic` | No scoring | Response counts, question summaries only |

---

## Migration Strategy

1. **Auto-detect** existing templates based on category presence
2. **Add field** to template schema
3. **Validate** on template save
4. **Enforce** dashboard routing based on mode

### Auto-Detection Rules

```typescript
function inferDashboardMode(template: Template): DashboardMode {
  const categories = template.scoreConfig?.categories || [];
  
  // Check for 5D categories
  const has5D = ['purpose', 'autonomy', 'mastery', 'belonging', 'wellbeing']
    .every(dim => categories.some(c => c.dimension === dim));
  
  if (has5D) return "insight-dimensions";
  if (categories.length > 0) return "generic-scoring";
  return "basic";
}
```

---

## Acceptance Criteria

- [ ] `dashboardMode` field added to template schema
- [ ] Migration script for existing templates
- [ ] Builder shows/enforces dashboard mode
- [ ] Analytics routing uses explicit mode
- [ ] Prevents insight-dimensions dashboard for non-5D surveys
- [ ] Admin can override mode if needed

---

## Implementation Notes

### Files to Modify
- `shared/schema.ts` - Add DashboardMode type
- `server/routes/templates.ts` - Validate on save
- `client/src/pages/AnalyticsPage.tsx` - Use explicit mode
- `shared/utils/dashboardMode.ts` - Detection/validation logic

---

## Related Tickets
- ANAL-DASH-001: Multi-Mode Dashboards Epic
- ANAL-DASH-010: Generic Scoring Dashboard

