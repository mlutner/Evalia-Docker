# Ticket ADMIN-010: Research Notes & Dimension Justification Fields

> **Status:** Roadmap  
> **Phase:** Scoring + Indices Refinement  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Intent

Add admin-only metadata fields to each index dimension for transparency & scientific grounding. Consultants and admins can document the research basis for each dimension.

---

## In Scope (Allowed)

### Database Schema
- Add to dimensions table:
  ```sql
  research_notes TEXT,
  evidence_justification TEXT
  ```

### Admin UI
- Show editable fields under each dimension definition
- Rich text editor for notes
- Save button with validation

### Versioning
- Changes create a new versioned scoring config snapshot
- Audit trail for who modified and when

---

## Out of Scope (Forbidden)

- AI auto-generation of notes (future ticket AIQ-003)
- Rendering research notes to end users
- Changes to core scoring engine
- SurveyView runtime changes

---

## Acceptance Criteria

- [ ] Admin users can view/edit/save research notes
- [ ] Admin users can view/edit/save evidence justification
- [ ] Changes create a new versioned scoring config snapshot
- [ ] Fields displayed only in admin panel
- [ ] Character limit guidance (e.g., 2000 chars)
- [ ] Timestamps shown for last edit

---

## Technical Notes

### Schema Migration
```sql
ALTER TABLE dimensions
ADD COLUMN research_notes TEXT,
ADD COLUMN evidence_justification TEXT,
ADD COLUMN notes_updated_at TIMESTAMP,
ADD COLUMN notes_updated_by VARCHAR;
```

### UI Components
- `client/src/admin/dimensions/ResearchNotesEditor.tsx`
- Integrate with existing dimension editor from DIM-010

---

## Required Files to Modify

1. `server/db/migrations/XXXX_add_dimension_research_notes.sql` (new)
2. `shared/dimensions.ts` (add field types)
3. `server/routes/admin/dimensions.ts` (update endpoints)
4. `client/src/admin/dimensions/DimensionEditor.tsx` (add fields)
5. `client/src/admin/dimensions/ResearchNotesEditor.tsx` (new)
6. `docs/BUILD_LOG.md`

---

## Dependencies

- DIM-010 (Dimension Manager) should be complete first
- MODEL-001 (Scoring Model Registry)

---

**End of Ticket**

