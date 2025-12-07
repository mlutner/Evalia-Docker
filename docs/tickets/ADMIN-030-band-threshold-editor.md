# Ticket ADMIN-030: Band Threshold Editor

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Goal

Allow admins to configure band thresholds, labels, colors, and interpretation text per scoring version. This enables customization of performance bands without code changes.

---

## Why (Context)

Currently, band definitions are hard-coded in `server/utils/analytics.ts` (`DEFAULT_INDEX_BANDS`). This works for defaults but doesn't allow:

- Customizing band thresholds per survey/version
- Adjusting band labels for different contexts
- Setting different band colors for white-label clients
- Adding interpretation text per band

This ticket provides the admin UI for band configuration.

**Dependencies:** ADMIN-020 (bands are version-specific)  
**Blocks:** ADMIN-050 (interpretation engine uses band data)

---

## In Scope (Allowed)

### Backend
- `server/routes/admin/bands.ts` (create new)
- `server/services/bands/*` (create new)
- CRUD endpoints for band config per version
- Validation:
  - No gaps in band ranges (0-100 must be fully covered)
  - No overlapping band ranges
  - Min must be less than max
  - At least one band required

### Frontend
- `client/src/admin/bands/*` (create new)
- Table/list view of bands for a version
- Edit form:
  - Min/max thresholds
  - Band label
  - Band color (color picker)
  - Band description/interpretation text
- Preview visualization (bar showing band ranges)
- Validation feedback UI

### Shared Types
- `shared/analytics.ts` - Use existing band metadata types

---

## Out of Scope (Forbidden)

- Band distribution analytics (ANAL-005 already handles display)
- AI-generated interpretations (ADMIN-050)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime
- Modifying `DEFAULT_INDEX_BANDS` constant behavior

---

## Acceptance Criteria

- [ ] Band configurations are saved per scoring version
- [ ] API returns consistent band definitions
- [ ] UI prevents conflicting band ranges:
  - [ ] No gaps in 0-100 coverage
  - [ ] No overlapping ranges
  - [ ] Min < max validation
- [ ] Analytics respects custom band configurations
- [ ] Fallback to `DEFAULT_INDEX_BANDS` when no custom bands exist
- [ ] Color picker provides predefined palette + custom hex
- [ ] Preview visualization shows band ranges graphically
- [ ] Band description supports markdown/rich text
- [ ] Cannot delete last band (at least one required)

---

## Required Files to Modify/Create

1. `server/routes/admin/bands.ts` (new)
2. `server/services/bands/bandService.ts` (new)
3. `client/src/admin/bands/BandsList.tsx` (new)
4. `client/src/admin/bands/BandEditor.tsx` (new)
5. `client/src/admin/bands/BandPreview.tsx` (new)
6. `client/src/admin/bands/index.ts` (new)
7. `shared/analytics.ts` (use existing band types)
8. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Design API routes for band CRUD
2. Implement backend validation logic
3. Create API routes with comprehensive validation
4. Build admin UI: bands list per version
5. Build admin UI: band editor form
6. Build admin UI: band range preview visualization
7. Add validation feedback UI
8. Integrate with analytics to use custom bands
9. Write integration tests
10. Update BUILD_LOG.md

---

## Test Plan

1. **Unit tests:**
   - Gap detection logic
   - Overlap detection logic
   - Min/max validation

2. **Integration tests:**
   - API rejects invalid band configs
   - Analytics uses custom bands when present
   - Fallback to defaults works

3. **Manual testing:**
   - Create custom bands for a version
   - View analytics with custom bands
   - Test validation errors display correctly
   - Verify preview visualization accuracy

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Validation prevents invalid configurations
- [ ] Analytics uses custom bands
- [ ] Preview visualization works correctly
- [ ] Admin UI accessible and functional
- [ ] Builder + runtime tested manually
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

