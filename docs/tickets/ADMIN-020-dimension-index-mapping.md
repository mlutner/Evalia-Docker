# Ticket ADMIN-020: Dimension → Index Mapping & Weights (UI)

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Goal

Create the mapping layer that connects **Dimensions** (DIM-010) to **Indices** (Evalia's fixed 5-Index model). Admins define which dimensions contribute to which indices and with what weight.

---

## Why (Context)

### The Critical Bridge

This mapping defines how the configurable Dimensional Layer feeds into Evalia's proprietary Index Layer:

```
Dimensions (DIM-010)
        ↓
    [ADMIN-020 MAPPING]      ←──── THIS TICKET
        ↓
Indices (5 fixed Evalia outputs)
```

**This mapping answers:** "Which dimensions contribute to which index, and with what weight?"

### Example

Dimensions configured for a survey:
- `dim-001`: "Leadership Clarity"
- `dim-002`: "Coaching & Development"
- `dim-003`: "Fairness & Equity"
- `dim-004`: "Empowerment"
- `dim-005`: "Communication"

Admin maps them to the Leadership Effectiveness Index:
```
Leadership Effectiveness Index:
  - Leadership Clarity    (weight: 0.25)
  - Coaching & Development (weight: 0.25)
  - Fairness & Equity     (weight: 0.20)
  - Empowerment           (weight: 0.15)
  - Communication         (weight: 0.15)
  Total: 1.00 ✓
```

**Dependencies:** DIM-015 (dimensions must have scores before mapping to indices)  
**Blocks:** ADMIN-030 (band thresholds need index definitions)

---

## In Scope (Allowed)

### Backend
- `server/routes/admin/indexMappings.ts` (create new)
- `server/services/scoring/indexMappingService.ts` (create new)
- CRUD endpoints for dimension → index mappings
- Weight validation per index (must sum to 1.0)
- Integration with Scoring Model Registry

### Frontend
- `client/src/admin/indices/*` (create new)
- For each of the 5 indices, show:
  - List of mapped dimensions
  - Weight per dimension
  - Unmapped dimensions available
- Weight editor with validation
- Index score preview/simulation

### Model Updates
- Store mappings in Scoring Model Registry (MODEL-001)
- Version-aware (per scoring model version)

---

## Out of Scope (Forbidden)

- Creating/editing dimensions (DIM-010)
- Category → Dimension mapping (DIM-015)
- Changing the 5 fixed indices (these are Evalia IP)
- Band threshold editing (ADMIN-030)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime

---

## Acceptance Criteria

- [ ] Admin can map dimensions to any of the 5 indices
- [ ] Admin can set weight per dimension-index mapping
- [ ] Admin can remove mappings
- [ ] Validation ensures weights per index sum to 1.0
- [ ] Validation runs both client-side and server-side
- [ ] Each index shows which dimensions contribute to it
- [ ] Unmapped dimensions are clearly visible
- [ ] A dimension can map to multiple indices (with different weights)
- [ ] API provides CRUD endpoints for mappings
- [ ] Mappings stored in Scoring Model Registry
- [ ] Index score preview shows estimated calculation
- [ ] Changes create new model version (draft)

---

## The Five Fixed Indices

These indices are Evalia IP and cannot be created/deleted:

| Index ID | Name | Description |
|----------|------|-------------|
| `leadership-effectiveness` | Leadership Effectiveness | How effectively leaders support teams |
| `team-wellbeing` | Team Wellbeing | Overall team health and support |
| `burnout-risk` | Burnout Risk | Risk indicators for exhaustion |
| `psychological-safety` | Psychological Safety | Ability to speak up safely |
| `engagement` | Engagement Energy | Commitment and enablement |

---

## Required Files to Modify/Create

1. `server/routes/admin/indexMappings.ts` (new)
2. `server/services/scoring/indexMappingService.ts` (new)
3. `shared/scoringModel.ts` (add mapping DTOs)
4. `client/src/admin/indices/IndexMappingList.tsx` (new)
5. `client/src/admin/indices/IndexMappingEditor.tsx` (new)
6. `client/src/admin/indices/IndexPreview.tsx` (new)
7. `client/src/admin/indices/index.ts` (new)
8. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Define mapping DTOs in `shared/scoringModel.ts`
2. Implement backend mapping service
3. Create API routes with validation
4. Build admin UI: index list with current mappings
5. Build admin UI: mapping editor per index
6. Build admin UI: weight editor
7. Add index score preview
8. Integrate with Scoring Model Registry
9. Write integration tests
10. Update BUILD_LOG.md

---

## UI Design Concept

```
┌─────────────────────────────────────────────────────────────────┐
│ Index: Leadership Effectiveness                                 │
│ "How effectively leaders support, develop, and enable teams"    │
├─────────────────────────────────────────────────────────────────┤
│ Contributing Dimensions                                         │
│ ┌────────────────────────────┬────────────┬──────────┬────────┐ │
│ │ Dimension                  │ Weight     │ Preview  │ Action │ │
│ ├────────────────────────────┼────────────┼──────────┼────────┤ │
│ │ Leadership Clarity         │ [0.25   ]  │ 72 → 18  │ [×]    │ │
│ │ Coaching & Development     │ [0.25   ]  │ 68 → 17  │ [×]    │ │
│ │ Fairness & Equity          │ [0.20   ]  │ 75 → 15  │ [×]    │ │
│ │ Empowerment                │ [0.15   ]  │ 70 → 10  │ [×]    │ │
│ │ Communication              │ [0.15   ]  │ 78 → 12  │ [×]    │ │
│ └────────────────────────────┴────────────┴──────────┴────────┘ │
│ Total Weight: 1.00 ✓          Estimated Index Score: 72        │
│                                                                 │
│ [+ Add Dimension]                                               │
├─────────────────────────────────────────────────────────────────┤
│ Available Dimensions (not yet mapped to this index)             │
│ • Workload Management                                           │
│ • Recognition                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Test Plan

1. **Unit tests:**
   - Weight validation logic
   - Mapping CRUD operations
   - Sum-to-1.0 validation

2. **Integration tests:**
   - API endpoints enforce validation
   - Mappings persist correctly
   - Scoring engine reads mappings

3. **Manual testing:**
   - Map dimensions to indices
   - Verify weight validation works
   - Test index preview calculation
   - Verify scoring uses mappings

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Weight validation works correctly
- [ ] API endpoints documented
- [ ] Admin UI accessible and functional
- [ ] Scoring engine uses mappings
- [ ] Index preview shows correct calculation
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

