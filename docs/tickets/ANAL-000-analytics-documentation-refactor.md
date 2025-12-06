# Ticket ANAL-000: Analytics Documentation Refactor

## Goal

Split the analytics measurement model documentation into three focused documents: Philosophy, Measurement Model, and Metric Specification. Establish clear separation between "why", "what/how", and "JSON/API" to improve maintainability and guide future analytics implementation.

## Why (Context)

The original `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` mixed product positioning, measurement model definitions, data models, JSON examples, and UI/component mapping into a single 862-line document. This made it difficult to:
- Find specific information (JSON shapes vs conceptual definitions)
- Maintain consistency (version-awareness rules repeated per index)
- Guide implementation (unclear what belongs in backend vs frontend)
- Onboard new developers (too much context in one place)

Splitting into three documents improves:
- **Clarity:** Each doc has a single purpose
- **Maintainability:** Update JSON shapes without touching philosophy
- **AI Usability:** Clear boundaries for code generation
- **Developer Experience:** Find what you need faster

## In Scope (Allowed)

- `docs/ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md` (create new)
- `docs/ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` (refactor existing)
- `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` (create new)
- `docs/BUILD_LOG.md` (add entry)
- `docs/ANALYTICS_UI_DESIGN.md` (update cross-references)

## Out of Scope (Forbidden)

- TypeScript/React/Express code changes
- ScoreConfig, scoring engine, or logic engine changes
- Database schema changes
- Any application code

## Acceptance Criteria

- [ ] Three new docs created:
  - `ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md`: High-level "why" (1-2 pages)
  - `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md`: Formal measurement model (no JSON, no UI)
  - `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`: Technical spec with JSON shapes
- [ ] All docs cross-linked with "Related Documents" sections
- [ ] Version-awareness, banding, computation rules consolidated (no duplication)
- [ ] BUILD_LOG.md updated with refactor entry
- [ ] ANALYTICS_UI_DESIGN.md references updated to point to correct docs
- [ ] No code changes

## Required Files to Modify

1. `docs/ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md` (new)
2. `docs/ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` (refactor)
3. `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` (new)
4. `docs/BUILD_LOG.md` (add entry)
5. `docs/ANALYTICS_UI_DESIGN.md` (update references)

## Suggested Implementation Steps

1. Create `ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md`:
   - Extract high-level positioning, target audience, 5 core indices at conceptual level
   - Manager/team lens importance
   - High-level flow: Survey → Scores → Indices → Insights
   - Keep to 1-2 pages, human-readable

2. Refactor `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md`:
   - Remove JSON examples (move to METRIC_SPEC)
   - Remove UI component references (move to UI_DESIGN)
   - Consolidate version-awareness rules into shared section
   - Consolidate banding rules into shared section
   - Keep: computation rules, index definitions, domain definitions, manager/team concepts

3. Create `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`:
   - Move all JSON shapes from measurement model
   - Define metric types (10 types)
   - Define metric IDs (25+ IDs in lookup table)
   - Lightweight UI mapping (references only, no full specs)

4. Add cross-linking:
   - "Related Documents" section at top of each doc
   - Update references in ANALYTICS_UI_DESIGN.md

5. Update BUILD_LOG.md:
   - Add entry describing the refactor

## Test Plan

1. Verify all three docs exist and are readable
2. Check cross-links work (all docs reference each other)
3. Verify no duplication (version-awareness, banding rules appear once)
4. Confirm no JSON in measurement model doc
5. Confirm no UI specs in measurement model doc
6. Verify BUILD_LOG entry is accurate

## Completion Checklist

- [x] Code compiles (N/A - doc-only)
- [x] No forbidden files changed
- [x] Three docs created and cross-linked
- [x] BUILD_LOG.md updated
- [x] ANALYTICS_UI_DESIGN.md references updated
- [x] No code changes
- [x] Committed with `[ANAL-000]` prefix

**Status:** ✅ COMPLETE (2025-12-06)

