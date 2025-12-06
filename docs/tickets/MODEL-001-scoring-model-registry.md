# Ticket MODEL-001: Scoring Model Definition Registry

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** Critical (Foundation)  
> **Created:** 2025-12-06

---

## Goal

Create a **versioned, machine-readable registry** that serves as the single source of truth for Evalia's scoring model. All admin UI, scoring engine, and analytics must read from and write to this registry.

---

## Why (Context)

### The Problem

Currently, scoring model components are scattered across:
- Hard-coded constants in `shared/analytics.ts`
- `score_config_versions` table (partial)
- Survey `scoreConfig` JSON blobs
- `DEFAULT_INDEX_BANDS` in `server/utils/analytics.ts`

This fragmentation causes:
- Inconsistency between systems
- No version control for model changes
- Difficulty auditing what changed and when
- No single source of truth

### The Solution

The **Scoring Model Registry** consolidates:

| Component | Current Location | New Location |
|-----------|-----------------|--------------|
| Indices | Hard-coded in `INSIGHT_DIMENSIONS` | Registry |
| Dimensions | Not yet exists | Registry |
| Dimension → Index mappings | Not yet exists | Registry |
| Category → Dimension mappings | Survey `scoreConfig` | Registry |
| Band thresholds | `DEFAULT_INDEX_BANDS` | Registry |
| Weights | Survey `scoreConfig` | Registry |

### Architecture Position

```
┌─────────────────────────────────────────────────────────┐
│              SCORING MODEL REGISTRY (MODEL-001)         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Version 1                                        │   │
│  │ ├── Indices (5 fixed)                           │   │
│  │ ├── Dimensions (configurable)                   │   │
│  │ ├── Dimension → Index mappings + weights        │   │
│  │ ├── Category → Dimension mappings + weights     │   │
│  │ └── Band thresholds per index                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Version 2 (draft)                               │   │
│  │ └── ... (same structure, different values)      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
          ↑                    ↑                    ↑
    Admin UI writes      Scoring reads       Analytics reads
```

**Dependencies:** None (foundation ticket)  
**Blocks:** DIM-010, DIM-015, ADMIN-020, ADMIN-030, all analytics

---

## In Scope (Allowed)

### Database
- New table: `scoring_model_versions` (id, survey_id, org_id?, version_number, model_snapshot, status, created_by, created_at, published_at)
- Model snapshot is a versioned JSON document containing entire model

### Backend
- `server/routes/admin/scoringModel.ts` (create new)
- `server/services/scoringModel/*` (create new)
- CRUD endpoints for model versions
- Version creation, drafts, publishing
- Model validation service
- Migration service (import existing configs)

### Shared Types
- `shared/scoringModel.ts` (create new - comprehensive model DTOs)

### Core Integration Points
- Scoring engine reads model from registry
- Analytics queries read model for band definitions
- Admin UI writes to registry

---

## Out of Scope (Forbidden)

- Individual admin UIs (DIM-010, ADMIN-020, etc.)
- Scoring computation logic (reads registry, doesn't change)
- Analytics computation logic (reads registry, doesn't change)
- Survey builder changes
- Response submission changes

---

## Acceptance Criteria

- [ ] Registry provides single source of truth for scoring model
- [ ] Model versions are immutable once published
- [ ] Draft versions can be edited
- [ ] Model includes:
  - [ ] Index definitions (id, name, slug)
  - [ ] Dimension definitions (id, name, slug, metadata)
  - [ ] Dimension → Index mappings with weights
  - [ ] Band thresholds per index
- [ ] API provides:
  - [ ] Get current published model
  - [ ] Get specific version
  - [ ] Create draft version
  - [ ] Update draft version
  - [ ] Publish draft version
  - [ ] List all versions
- [ ] Validation ensures model is complete and consistent
- [ ] Migration tool imports existing `score_config_versions` data
- [ ] Scoring engine reads from registry (not hard-coded)
- [ ] Analytics reads band definitions from registry
- [ ] Backward compatibility with existing surveys

---

## Required Files to Modify/Create

1. `server/db/migrations/XXXX_add_scoring_model_registry.sql` (new)
2. `server/routes/admin/scoringModel.ts` (new)
3. `server/services/scoringModel/registryService.ts` (new)
4. `server/services/scoringModel/validationService.ts` (new)
5. `server/services/scoringModel/migrationService.ts` (new)
6. `shared/scoringModel.ts` (new - comprehensive types)
7. `server/utils/analytics.ts` (update to read from registry)
8. `docs/BUILD_LOG.md`

---

## Model Schema

```typescript
interface ScoringModel {
  version: string;
  status: 'draft' | 'published';
  
  // The 5 fixed Evalia Insight Indices
  indices: {
    id: string;
    name: string;
    slug: string;
    description: string;
  }[];
  
  // Configurable dimensions
  dimensions: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
  }[];
  
  // How dimensions roll up into indices
  dimensionIndexMappings: {
    dimensionId: string;
    indexId: string;
    weight: number;
  }[];
  
  // Band thresholds per index
  indexBands: {
    indexId: string;
    bands: {
      id: string;
      label: string;
      min: number;
      max: number;
      color: string;
      description: string;
    }[];
  }[];
  
  // Metadata
  createdAt: string;
  createdBy: string;
  publishedAt?: string;
}
```

---

## Suggested Implementation Steps

1. Design comprehensive model schema
2. Create database migration
3. Create shared types in `shared/scoringModel.ts`
4. Implement registry service (CRUD)
5. Implement validation service
6. Implement migration service for existing data
7. Create API routes
8. Update scoring engine to read from registry
9. Update analytics to read bands from registry
10. Seed default Evalia model
11. Write integration tests
12. Update BUILD_LOG.md

---

## Migration Strategy

Existing surveys have scoring configs in `score_config_versions`. The migration:

1. **Read** existing `score_config_versions` for each survey
2. **Transform** to new model format:
   - Extract categories as implicit dimensions
   - Map categories to default Evalia dimensions
   - Use `DEFAULT_INDEX_BANDS` for band thresholds
3. **Write** to new `scoring_model_versions` table
4. **Validate** all models after migration
5. **Fallback**: If no model exists, use default Evalia model

---

## Test Plan

1. **Unit tests:**
   - Model validation logic
   - Version creation/publishing
   - Migration transformations

2. **Integration tests:**
   - API endpoints work correctly
   - Published models are immutable
   - Scoring engine reads from registry
   - Analytics reads bands from registry

3. **Manual testing:**
   - Create new model version
   - Publish model
   - Verify scoring uses published model
   - Verify analytics uses correct bands

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Database migration runs cleanly
- [ ] Model validation catches errors
- [ ] Migration imports existing data
- [ ] Scoring engine uses registry
- [ ] Analytics uses registry
- [ ] Default model seeded
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

