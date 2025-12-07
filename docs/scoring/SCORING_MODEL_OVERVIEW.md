# Evalia Scoring Model Architecture

> **Status:** Architectural Reference  
> **Last Updated:** 2025-12-06  
> **Purpose:** Define Evalia's two-layer scoring architecture

---

## Executive Summary

Evalia uses a **two-layer scoring model** that balances flexibility with consistency:

1. **Dimensional Layer** (configurable) – Consultant-defined measurement constructs
2. **Index Layer** (fixed) – Evalia's proprietary 5-Index output model

This architecture enables white-labeling and customization while maintaining consistent, defensible analytics outputs.

---

## The Two-Layer Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         SURVEY LAYER                            │
│                                                                 │
│  Questions → Answers → Scores                                   │
│  Organized into Categories (builder-defined)                    │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Category → Dimension Mapping
                            │ (weights assigned per mapping)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DIMENSIONAL LAYER                            │
│                    (Consultant-Configurable)                    │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Leadership  │  │  Coaching   │  │   Fairness  │  ...        │
│  │  Clarity    │  │    & Dev    │  │   & Equity  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  • Flexible per client/survey                                   │
│  • Custom names for white-labeling                              │
│  • Weighted contributions from categories                       │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Dimension → Index Mapping
                            │ (weights assigned per mapping)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       INDEX LAYER                               │
│                    (Evalia-Proprietary)                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Leadership    Team      Burnout    Psychological  Engage- │ │
│  │ Effective-    Well-     Risk       Safety         ment    │ │
│  │ ness          being                               Energy  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  • Fixed 5-Index model (Evalia IP)                              │
│  • Consistent across all surveys                                │
│  • Powers analytics and benchmarking                            │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Band Assignment
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BAND LAYER                                 │
│                                                                 │
│  Critical → Needs Improvement → Developing → Effective → Highly │
│   (0-39)        (40-54)          (55-69)      (70-84)   (85-100)│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Details

### 1. Survey Layer (Input)

**What it is:** Survey questions organized into categories, defined in the survey builder.

**Who controls it:** Survey authors (consultants, HR teams)

**Key concepts:**
- **Questions** have `optionScores` that map answer choices to numeric values
- **Categories** group related questions for scoring purposes
- Categories are defined in `survey.scoreConfig.categories[]`

**Example:**
```typescript
{
  categories: [
    { id: "cat-001", name: "Manager Communication", weight: 1.0 },
    { id: "cat-002", name: "Manager Feedback", weight: 1.0 },
    { id: "cat-003", name: "Team Collaboration", weight: 1.0 }
  ]
}
```

---

### 2. Dimensional Layer (Configurable)

**What it is:** Intermediate measurement constructs that aggregate category scores.

**Who controls it:** Evalia admins, enterprise consultants (via admin UI)

**Key concepts:**
- **Dimensions** are configurable building blocks
- Multiple categories can map to one dimension (with weights)
- One category can map to multiple dimensions (split contribution)
- Dimensions can be renamed for white-labeling
- Default Evalia dimensions are provided but can be customized

**Default Evalia Dimensions:**

| Dimension | Slug | Typical Categories |
|-----------|------|-------------------|
| Leadership Clarity | leadership-clarity | Vision, Goals, Expectations |
| Coaching & Development | coaching-development | Feedback, Growth Support |
| Fairness & Equity | fairness-equity | Fair Treatment, Opportunity |
| Empowerment | empowerment | Autonomy, Decision Authority |
| Communication | communication | Information Flow, Transparency |
| Workload Management | workload-management | Balance, Capacity |
| Support Systems | support-systems | Resources, Help Access |
| Work-Life Balance | work-life-balance | Boundaries, Flexibility |
| Recognition | recognition | Appreciation, Acknowledgment |
| Psychological Safety | psych-safety | Speaking Up, Mistake Tolerance |

**Calculation:**
```
Dimension Score = Σ(Category Score × Weight) / Σ(Weights)
```

---

### 3. Index Layer (Fixed)

**What it is:** Evalia's proprietary 5-Index output model.

**Who controls it:** Evalia (fixed, not configurable by clients)

**Key concepts:**
- Indices are the **final analytics outputs**
- They aggregate dimension scores with fixed formulas
- They enable cross-survey benchmarking
- They are the basis for Evalia Insight Dimensions (EID) terminology

**The Five Indices:**

| Index | Slug | Description |
|-------|------|-------------|
| **Leadership Effectiveness** | `leadership-effectiveness` | How effectively leaders support and enable teams |
| **Team Wellbeing** | `team-wellbeing` | Overall team health, balance, and support |
| **Burnout Risk** | `burnout-risk` | Risk indicators for exhaustion and disengagement |
| **Psychological Safety** | `psychological-safety` | Ability to speak up and take risks safely |
| **Engagement Energy** | `engagement` | Commitment, motivation, and enablement |

**Dimension → Index Mappings:**

Each index is computed from specific dimensions:

```
Leadership Effectiveness = f(
  Leadership Clarity,
  Coaching & Development,
  Fairness & Equity,
  Empowerment,
  Communication
)

Team Wellbeing = f(
  Workload Management,
  Support Systems,
  Work-Life Balance,
  Recognition
)

// ... etc
```

---

### 4. Band Layer (Output)

**What it is:** Performance band assignments based on index scores.

**Who controls it:** Configurable per index (via ADMIN-030)

**Default Bands:**

| Band | Range | Label | Color |
|------|-------|-------|-------|
| 5 | 85-100 | Highly Effective | Green (#22c55e) |
| 4 | 70-84 | Effective | Lime (#84cc16) |
| 3 | 55-69 | Developing | Amber (#f59e0b) |
| 2 | 40-54 | Needs Improvement | Orange (#fb923c) |
| 1 | 0-39 | Critical | Red (#ef4444) |

---

## Scoring Model Registry

All model components are stored in the **Scoring Model Registry** (MODEL-001):

```typescript
interface ScoringModel {
  version: string;
  status: 'draft' | 'published';
  
  // Fixed by Evalia
  indices: Index[];
  
  // Configurable
  dimensions: Dimension[];
  dimensionIndexMappings: DimensionIndexMapping[];
  indexBands: IndexBandConfig[];
  
  // Metadata
  createdAt: string;
  publishedAt?: string;
}
```

**Key Properties:**
- **Versioned:** Every change creates a new version
- **Immutable:** Published models cannot be modified
- **Auditable:** Full history of who changed what and when
- **Single Source of Truth:** All systems read from registry

---

## Data Flow Example

### Input: Survey Response

```json
{
  "responseId": "resp-123",
  "answers": {
    "q1": { "value": "Agree", "score": 4 },
    "q2": { "value": "Strongly Agree", "score": 5 },
    "q3": { "value": "Neutral", "score": 3 }
  }
}
```

### Step 1: Category Scores

Questions are grouped by category:
```
cat-001 (Manager Communication): avg([q1.score]) = 4.0
cat-002 (Manager Feedback): avg([q2.score]) = 5.0
cat-003 (Team Collaboration): avg([q3.score]) = 3.0
```

### Step 2: Dimension Scores

Categories map to dimensions with weights:
```
Communication Dimension:
  = (cat-001 × 0.6) + (cat-003 × 0.4)
  = (4.0 × 0.6) + (3.0 × 0.4)
  = 2.4 + 1.2 = 3.6 → 72/100 (normalized)

Coaching & Development Dimension:
  = cat-002 × 1.0
  = 5.0 → 100/100 (normalized)
```

### Step 3: Index Scores

Dimensions map to indices:
```
Leadership Effectiveness Index:
  = weighted_avg(Communication, Coaching, Fairness, Empowerment, Clarity)
  = 78/100
```

### Step 4: Band Assignment

Index score → Band:
```
78 → "Effective" band (70-84)
```

---

## System Integration Points

### Where the Model is Read

| System | What it Reads | Why |
|--------|--------------|-----|
| Scoring Engine | Mappings, weights | Compute scores |
| Analytics API | Band thresholds | Assign bands |
| Analytics UI | Index/dimension names | Display labels |
| Admin UI | Full model | Edit configuration |

### Where the Model is Written

| System | What it Writes | When |
|--------|---------------|------|
| Admin UI (DIM-010) | Dimensions | Admin creates/edits |
| Admin UI (DIM-015) | Category mappings | Admin configures |
| Admin UI (ADMIN-020) | Index mappings | Admin configures |
| Admin UI (ADMIN-030) | Band thresholds | Admin configures |

---

## Backward Compatibility

### Existing Surveys

Surveys created before MODEL-001 have scoring config in `score_config_versions.config_snapshot`. The migration:

1. Reads existing `scoreConfig.categories[]`
2. Maps categories to default Evalia dimensions
3. Uses default dimension → index mappings
4. Creates a published model version

### New Surveys

New surveys start with the default Evalia model. Admins can:
1. Customize dimensions (DIM-010)
2. Adjust category mappings (DIM-015)
3. Modify band thresholds (ADMIN-030)
4. Publish a new model version

---

## Cursor Rules (For AI Assistance)

When working with the scoring model:

1. **Treat Indices and Dimensions as first-class entities**
   - Never hardcode index formulas
   - Always read from Scoring Model Registry

2. **Scoring logic must use mappings**
   - Category → Dimension from registry
   - Dimension → Index from registry

3. **Builder categories can change; index outputs must stay consistent**
   - Survey structure is flexible
   - Index definitions are fixed

4. **Admin UI writes to registry; everything else reads**
   - Single source of truth pattern
   - No scattered configuration

5. **Always enforce versioning**
   - Published models are immutable
   - Changes create new versions

---

## Related Documents

- `docs/tickets/MODEL-001-scoring-model-registry.md` – Registry implementation
- `docs/tickets/DIM-010-dimension-manager.md` – Dimension UI
- `docs/tickets/DIM-015-category-dimension-mapping.md` – Category mapping
- `docs/EVALIA_INSIGHT_DIMENSIONS.md` – Index definitions
- `docs/INSIGHT_DIMENSIONS_NAMING.md` – Naming conventions
- `shared/scoringModel.ts` – Type definitions (to be created)

---

**End of Scoring Model Architecture**

