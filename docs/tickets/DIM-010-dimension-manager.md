# Ticket DIM-010: Dimension Manager (UI + DB)

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Goal

Create the system that defines Evalia's **Dimensional Scoring Layer** – the intermediate measurement constructs that sit between survey categories and Evalia's proprietary Insight Indices.

Admins can create/edit/delete **Dimensions** – configurable measurement constructs that consultants can customize per client.

---

## Why (Context)

### The Two-Layer Scoring Model

Evalia uses a two-layer scoring architecture:

```
Survey Categories (builder-defined)
        ↓ [DIM-015 mapping]
Dimensions (consultant-configurable)
        ↓ [ADMIN-020 mapping]
Indices (Evalia-proprietary outputs)
        ↓
Bands (performance levels)
```

**Dimensions** are the flexible layer that:
- Allow consultants to define their own measurement constructs
- Map survey categories to meaningful intermediate scores
- Feed into Evalia's fixed 5-Index model
- Enable white-labeling without changing core index logic

**Without dimensions**, the system jumps directly from categories to indices, making it rigid and non-customizable.

**Dependencies:** MODEL-001 (registry foundation)  
**Blocks:** DIM-015, ADMIN-020, ADMIN-040, ADMIN-050

---

## In Scope (Allowed)

### Database
- New table: `dimensions` (id, name, slug, description, color, icon, org_id?, created_at, updated_at)
- Dimensions are stored in the Scoring Model Registry (MODEL-001)

### Backend
- `server/routes/admin/dimensions.ts` (create new)
- `server/services/dimensions/*` (create new)
- CRUD endpoints for dimensions
- Integration with Scoring Model Registry

### Shared Types
- `shared/dimensions.ts` (create new - dimension DTOs)

### Frontend
- `client/src/admin/dimensions/*` (create new)
- List dimensions view
- Create/edit/delete dimension form
- Color picker component
- Icon selector component
- Description and metadata fields

---

## Out of Scope (Forbidden)

- Category → Dimension mapping (DIM-015)
- Dimension → Index mapping (ADMIN-020)
- Scoring engine computation
- Analytics UI changes
- Interpretation logic (ADMIN-050)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime

---

## Acceptance Criteria

- [ ] Admin can create new dimensions with name, slug, description, color, icon
- [ ] Admin can edit existing dimensions
- [ ] Admin can delete dimensions (with soft-delete)
- [ ] Dimensions are stored in the Scoring Model Registry
- [ ] API provides full CRUD endpoints for dimensions
- [ ] Default Evalia dimensions are seeded (Leadership Clarity, Coaching & Development, etc.)
- [ ] Color picker supports hex colors matching existing band colors
- [ ] Icon selector provides curated list of Lucide icons
- [ ] Dimensions are versioned via MODEL-001

---

## Required Files to Modify/Create

1. `server/db/migrations/XXXX_add_dimensions.sql` (new)
2. `server/routes/admin/dimensions.ts` (new)
3. `server/services/dimensions/dimensionService.ts` (new)
4. `shared/dimensions.ts` (new)
5. `client/src/admin/dimensions/DimensionsList.tsx` (new)
6. `client/src/admin/dimensions/DimensionEditor.tsx` (new)
7. `client/src/admin/dimensions/index.ts` (new)
8. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Design database schema and create migration
2. Create shared DTOs in `shared/dimensions.ts`
3. Implement backend service layer
4. Create API routes with validation
5. Seed default Evalia dimensions
6. Build admin UI: list view
7. Build admin UI: create/edit form
8. Integrate with Scoring Model Registry (MODEL-001)
9. Write integration tests
10. Update BUILD_LOG.md

---

## Default Dimensions (Seed Data)

The following dimensions should be seeded as Evalia defaults:

| Dimension | Slug | Description |
|-----------|------|-------------|
| Leadership Clarity | leadership-clarity | How clearly leaders communicate vision, goals, and expectations |
| Coaching & Development | coaching-development | Support for growth, feedback, and skill development |
| Fairness & Equity | fairness-equity | Perception of fair treatment and equal opportunity |
| Empowerment | empowerment | Autonomy, decision-making authority, and trust |
| Communication | communication | Quality and frequency of information sharing |
| Workload Management | workload-management | Balance of work demands and capacity |
| Support Systems | support-systems | Access to resources and help when needed |
| Work-Life Balance | work-life-balance | Ability to maintain healthy boundaries |
| Recognition | recognition | Acknowledgment of contributions and achievements |
| Psychological Safety | psych-safety | Ability to take risks and speak up safely |

---

## Test Plan

1. **Unit tests:**
   - Dimension CRUD operations
   - Slug generation/uniqueness
   - Registry integration

2. **Integration tests:**
   - API endpoints return correct responses
   - Default dimensions seeded correctly
   - Versioning works correctly

3. **Manual testing:**
   - Create a new dimension via admin UI
   - Edit dimension metadata
   - Verify dimensions appear in registry

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Database migration runs cleanly
- [ ] Default dimensions seeded
- [ ] API endpoints documented
- [ ] Admin UI accessible and functional
- [ ] Builder + runtime tested manually
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

