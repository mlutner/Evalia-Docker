# Epic ADMIN-000: Admin Configuration Panel

> **Status:** Roadmap  
> **Priority:** High  
> **Created:** 2025-12-06  
> **Updated:** 2025-12-06 (Architecture restructure)

---

## Overview

The Admin Configuration Panel provides internal tools for managing Evalia's **two-layer scoring architecture**: the configurable **Dimensional Scoring Layer** and the proprietary **Insight Index Layer**.

This epic enables administrators to configure the platform without code changes while maintaining the integrity of Evalia's measurement framework.

---

## Two-Layer Scoring Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SURVEY BUILDER LAYER                         │
│  Categories (consultant-defined survey structure)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [DIM-015: Category Mapping]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DIMENSIONAL SCORING LAYER                      │
│  Dimensions (consultant-configurable measurement constructs)    │
│  • Flexible per client                                          │
│  • White-label friendly                                         │
│  • Weighted contributions                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [ADMIN-020: Index Mapping]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INSIGHT INDEX LAYER                           │
│  Evalia's 5 Proprietary Indices (fixed outputs)                │
│  • Leadership Effectiveness                                     │
│  • Team Wellbeing                                               │
│  • Burnout Risk                                                 │
│  • Psychological Safety                                         │
│  • Engagement Energy                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [ADMIN-030: Band Thresholds]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE BANDS                            │
│  Critical → Needs Improvement → Developing → Effective → Highly │
└─────────────────────────────────────────────────────────────────┘
```

---

## Child Tickets

### Foundation Layer

| Ticket | Title | Status | Dependencies |
|--------|-------|--------|--------------|
| **MODEL-001** | Scoring Model Registry | Roadmap | - |

### Dimensional Layer

| Ticket | Title | Status | Dependencies |
|--------|-------|--------|--------------|
| **DIM-010** | Dimension Manager (UI + DB) | Roadmap | MODEL-001 |
| **DIM-015** | Category → Dimension Mapping | Roadmap | DIM-010 |

### Index & Scoring Layer

| Ticket | Title | Status | Dependencies |
|--------|-------|--------|--------------|
| **ADMIN-020** | Dimension → Index Mapping & Weights | Roadmap | DIM-015 |
| **ADMIN-030** | Index Band Threshold Editor | Roadmap | ADMIN-020 |

### Configuration & Customization

| Ticket | Title | Status | Dependencies |
|--------|-------|--------|--------------|
| **ADMIN-040** | Index Naming / White-Label Settings | Roadmap | DIM-010 |
| **ADMIN-050** | Interpretation Rules Engine (Phase 1) | Roadmap | ADMIN-030 |

### Internal Tools

| Ticket | Title | Status | Dependencies |
|--------|-------|--------|--------------|
| **ADMIN-060** | Model Validation Console (Dev Tools) | Roadmap | MODEL-001 |

---

## Recommended Implementation Sequence

```
1. MODEL-001  ──────────────────────────────────────────┐
   (Foundation)                                         │
                                                        ↓
2. DIM-010  ────────→  3. DIM-015  ────────→  4. ADMIN-020
   (Dimensions)           (Cat→Dim)              (Dim→Index)
                                                        │
                                                        ↓
5. ADMIN-030  ──────→  6. ADMIN-050
   (Bands)                (Interpretation)
        
Parallel track:
   ADMIN-040 (White-label) - can start after DIM-010
   ADMIN-060 (Dev Tools) - can start after MODEL-001
```

---

## Architectural Boundaries

**This epic DOES:**
- Add new admin-only routes and UI
- Add new database tables for configuration
- Provide CRUD operations for scoring model components
- Enable dynamic configuration without code changes
- Maintain version history for all model changes

**This epic does NOT:**
- Modify core scoring engine computation logic (it reads from registry)
- Change analytics API contracts (metric IDs, response shapes)
- Affect survey runtime behavior
- Change how responses are stored
- Modify the 5 fixed Insight Indices

---

## Database Schema Additions

```sql
-- MODEL-001: Central Registry
scoring_model_versions (
  id, survey_id, org_id, version_number, 
  model_snapshot JSONB, status, 
  created_by, created_at, published_at
)

-- DIM-010: Dimensions
dimensions (
  id, name, slug, description, color, icon, 
  org_id, created_at, updated_at
)

-- DIM-015: Category Mappings  
category_dimension_mappings (
  id, category_id, dimension_id, weight,
  survey_id, version_id, created_at
)

-- ADMIN-040: White-Label Settings
analytics_settings (
  id, survey_id, org_id, settings_json,
  created_at, updated_at
)

-- ADMIN-050: Interpretation Rules
interpretation_rules (
  id, survey_id, dimension_id, index_id,
  condition_json, narrative_template, severity,
  created_at, updated_at
)
```

---

## Related Documentation

- `docs/scoring/SCORING_MODEL_OVERVIEW.md` – Architecture overview
- `docs/EVALIA_INSIGHT_DIMENSIONS.md` – Index definitions
- `docs/INSIGHT_DIMENSIONS_NAMING.md` – Naming conventions
- `docs/ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` – Measurement model
- `shared/analytics.ts` – Analytics types
- `shared/scoringModel.ts` – Model registry types (new)

---

**End of Epic**
