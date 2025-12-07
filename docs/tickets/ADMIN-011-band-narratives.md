# Ticket ADMIN-011: Editable Band Narratives

> **Status:** Roadmap  
> **Phase:** Scoring + Indices Refinement  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Intent

Let consultants edit narrative interpretations for each band (used in Reports & Recommendations). Each performance band can have customized text explaining what that score level means.

---

## In Scope (Allowed)

### Database Schema
- Update score_bands:
  ```sql
  narrative_default TEXT,
  narrative_custom TEXT
  ```

### Admin UI
- Textarea editor for each band's narrative
- Render preview using current index
- Show default vs custom narrative toggle
- Character count and guidance

### Integration
- Narratives attach to scoring version
- Default fallback if no custom narrative is set

---

## Out of Scope (Forbidden)

- AI rewriting (future AIQ-004)
- Multi-language support
- End-user facing changes
- Changes to scoring computation

---

## Acceptance Criteria

- [ ] Admin can edit narrative text for each band
- [ ] Saved narratives attach to scoring version
- [ ] Default fallback if no custom narrative is set
- [ ] Preview shows narrative with sample score
- [ ] Rich text support (bold, bullets, links)
- [ ] Version history for narrative changes

---

## Technical Notes

### Schema Addition
```sql
ALTER TABLE score_bands
ADD COLUMN narrative_default TEXT,
ADD COLUMN narrative_custom TEXT;

-- Seed default narratives
UPDATE score_bands SET narrative_default = 
  CASE band_id
    WHEN 'critical' THEN 'Scores in this range indicate significant challenges...'
    WHEN 'needs-improvement' THEN 'There is room for growth in this area...'
    WHEN 'developing' THEN 'Progress is being made, with opportunities...'
    WHEN 'effective' THEN 'Performance in this area is strong...'
    WHEN 'highly-effective' THEN 'Exceptional performance demonstrated...'
  END;
```

### UI Components
- `client/src/admin/bands/BandNarrativeEditor.tsx`
- `client/src/admin/bands/NarrativePreview.tsx`

---

## Required Files to Modify

1. `server/db/migrations/XXXX_add_band_narratives.sql` (new)
2. `shared/scoringModel.ts` (add narrative fields)
3. `server/routes/admin/bands.ts` (update endpoints)
4. `client/src/admin/bands/BandNarrativeEditor.tsx` (new)
5. `client/src/admin/bands/NarrativePreview.tsx` (new)
6. `docs/BUILD_LOG.md`

---

## Dependencies

- ADMIN-030 (Band Threshold Editor) should be complete first
- MODEL-001 (Scoring Model Registry)

---

**End of Ticket**

