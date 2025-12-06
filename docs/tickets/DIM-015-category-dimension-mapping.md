# Ticket DIM-015: Category → Dimension Mapping (UI + DB)

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Goal

Create the mapping layer that connects **survey categories** (defined in the builder) to **dimensions** (defined in DIM-010). This is the foundational link that allows survey responses to flow into the dimensional scoring layer.

---

## Why (Context)

### The Critical Bridge

Without this mapping, dimensions and indices cannot be computed:

```
Survey Categories (builder)  ←──── YOU ARE HERE
        ↓
    [DIM-015 MAPPING]         ←──── THIS TICKET
        ↓
Dimensions (DIM-010)
        ↓
Indices (ADMIN-020)
```

**This mapping answers:** "Which survey categories contribute to which dimensions, and with what weight?"

### Example

A survey has these categories:
- `cat-001`: "Manager Communication"
- `cat-002`: "Manager Feedback"  
- `cat-003`: "Team Collaboration"

The admin maps them to dimensions:
- `cat-001` → "Communication" dimension (weight: 0.6)
- `cat-002` → "Coaching & Development" dimension (weight: 1.0)
- `cat-003` → "Communication" dimension (weight: 0.4)

Now the scoring engine knows how to compute dimension scores.

**Dependencies:** DIM-010 (dimensions must exist first)  
**Blocks:** ADMIN-020 (index computation needs dimension scores)

---

## In Scope (Allowed)

### Database
- New table: `category_dimension_mappings` (id, category_id, dimension_id, weight, survey_id?, version_id?, created_at)
- Mappings stored in Scoring Model Registry (MODEL-001)

### Backend
- `server/routes/admin/categoryMappings.ts` (create new)
- `server/services/dimensions/mappingService.ts` (create new)
- CRUD endpoints for mappings
- Weight validation (per-dimension weights should sum to 1.0)
- Bulk mapping operations

### Frontend
- `client/src/admin/dimensions/CategoryMappingEditor.tsx` (create new)
- For each dimension, show:
  - List of mapped categories
  - Weight per category
  - Unmapped categories available
- Drag-and-drop or select UI for assigning categories
- Weight editor with validation
- Preview of dimension score calculation

---

## Out of Scope (Forbidden)

- Dimension creation/editing (DIM-010)
- Dimension → Index mapping (ADMIN-020)
- Scoring engine computation (uses mappings, doesn't define them)
- Analytics UI changes
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime

---

## Acceptance Criteria

- [ ] Admin can map categories to dimensions
- [ ] Admin can set weight per category-dimension mapping
- [ ] Admin can remove mappings
- [ ] Validation ensures weights per dimension sum to 1.0
- [ ] Validation runs both client-side and server-side
- [ ] Unmapped categories are clearly visible
- [ ] Categories can map to multiple dimensions (with different weights)
- [ ] API provides CRUD endpoints for mappings
- [ ] Mappings are version-aware (per scoring version)
- [ ] Scoring engine can read mappings to compute dimension scores
- [ ] Bulk operations supported (map multiple categories at once)

---

## Required Files to Modify/Create

1. `server/db/migrations/XXXX_add_category_dimension_mappings.sql` (new)
2. `server/routes/admin/categoryMappings.ts` (new)
3. `server/services/dimensions/mappingService.ts` (new)
4. `shared/dimensions.ts` (add mapping DTOs)
5. `client/src/admin/dimensions/CategoryMappingEditor.tsx` (new)
6. `client/src/admin/dimensions/CategoryMappingList.tsx` (new)
7. `client/src/admin/dimensions/WeightEditor.tsx` (new)
8. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Design database schema for mappings
2. Create migration
3. Add mapping DTOs to `shared/dimensions.ts`
4. Implement backend mapping service
5. Create API routes with validation
6. Build admin UI: mapping list per dimension
7. Build admin UI: category selector
8. Build admin UI: weight editor
9. Add bulk mapping operations
10. Integrate with Scoring Model Registry
11. Write integration tests
12. Update BUILD_LOG.md

---

## UI Design Concept

```
┌─────────────────────────────────────────────────────────┐
│ Dimension: Communication                                │
├─────────────────────────────────────────────────────────┤
│ Mapped Categories                                       │
│ ┌──────────────────────────────┬────────────┬────────┐ │
│ │ Category                     │ Weight     │ Action │ │
│ ├──────────────────────────────┼────────────┼────────┤ │
│ │ Manager Communication        │ [0.6    ]  │ [×]    │ │
│ │ Team Collaboration           │ [0.4    ]  │ [×]    │ │
│ └──────────────────────────────┴────────────┴────────┘ │
│ Total Weight: 1.0 ✓                                     │
│                                                         │
│ [+ Add Category]                                        │
├─────────────────────────────────────────────────────────┤
│ Unmapped Categories (3)                                 │
│ • Manager Feedback                                      │
│ • Work Environment                                      │
│ • Career Growth                                         │
└─────────────────────────────────────────────────────────┘
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
   - Map categories to dimensions
   - Verify weight validation works
   - Test bulk operations
   - Verify scoring uses mappings

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Database migration runs cleanly
- [ ] Weight validation works correctly
- [ ] API endpoints documented
- [ ] Admin UI accessible and functional
- [ ] Scoring engine uses mappings
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

