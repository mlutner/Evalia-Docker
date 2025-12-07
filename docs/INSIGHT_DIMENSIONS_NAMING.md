# Evalia Insight Dimensions – Naming Conventions

> **Status:** Canonical Naming Reference  
> **Last Updated:** 2025-12-06  
> **Purpose:** Single source of truth for Insight Dimension naming across code, docs, and UI

---

## Overview

**Evalia Insight Dimensions (EID Framework)** is Evalia's proprietary measurement framework for understanding organizational health. It provides standardized, actionable metrics across five core dimensions: Leadership, Wellbeing, Burnout, Psychological Safety, and Engagement.

This document defines the canonical naming conventions used across the platform.

---

## The Five Core Insight Dimensions

| Internal ID (snake_case) | Brand Label | Short Label |
|--------------------------|-------------|-------------|
| `leadership_effectiveness` | Leadership Effectiveness Dimension | Leadership Effectiveness |
| `team_wellbeing` | Team Wellbeing Dimension | Team Wellbeing |
| `burnout_risk` | Burnout Risk Dimension | Burnout Risk |
| `psychological_safety` | Psychological Safety Dimension | Psychological Safety |
| `engagement_energy` | Engagement Energy Dimension | Engagement |

---

## Technical ID Mapping

### Index Type Values (API/Code)

These are the values used in `meta.indexType` and code references:

| indexType Value | Maps to Dimension |
|-----------------|-------------------|
| `leadership-effectiveness` | Leadership Effectiveness Dimension |
| `team-wellbeing` | Team Wellbeing Dimension |
| `burnout-risk` | Burnout Risk Dimension |
| `psychological-safety` | Psychological Safety Dimension |
| `engagement` | Engagement Energy Dimension |

### Metric ID Patterns

Metric IDs use snake_case and include "index" for backward compatibility:

```
leadership_index_distribution     → Leadership Effectiveness Dimension
wellbeing_index_distribution      → Team Wellbeing Dimension
burnout_risk_distribution         → Burnout Risk Dimension
psychological_safety_distribution → Psychological Safety Dimension
engagement_index_distribution     → Engagement Energy Dimension
```

---

## Naming Rules

### 1. Internal Technical IDs (Code)

- Use **snake_case** for IDs: `leadership_effectiveness`, `team_wellbeing`
- Use **kebab-case** for indexType values: `leadership-effectiveness`, `team-wellbeing`
- Technical IDs are **stable** and **non-marketing** – never change them for branding
- Metric IDs retain "index" suffix for backward compatibility

### 2. External Copy (UI/Docs/Marketing)

- Use **capitalized labels**: "Leadership Effectiveness Dimension"
- "Insight Dimensions" is the **umbrella term** for all five
- Use "Dimension" suffix when referring to a specific measure formally
- Use short labels (e.g., "Team Wellbeing") in space-constrained contexts

### 3. Deprecated Terms (Do Not Use in New Code/UI)

| ❌ Deprecated | ✅ Use Instead |
|---------------|----------------|
| "Wellbeing Index" | "Team Wellbeing Dimension" or "Team Wellbeing" |
| "Leadership Index" | "Leadership Effectiveness Dimension" or "Leadership Effectiveness" |
| "Engagement Index" | "Engagement Energy Dimension" or "Engagement" |
| "Burnout Index" | "Burnout Risk Dimension" or "Burnout Risk" |
| "Psych Safety Index" | "Psychological Safety Dimension" |
| "Index score" (generic) | "Dimension score" or "Insight Dimension score" |
| "All indices" | "All Insight Dimensions" or "All dimensions" |

---

## How to Reference in Code and UI

### In TypeScript/Code

```typescript
import { INSIGHT_DIMENSIONS, getInsightDimensionLabel } from '@shared/analytics';

// Get brand-safe label from indexType
const label = getInsightDimensionLabel('leadership-effectiveness');
// → "Leadership Effectiveness Dimension"

// Access dimension metadata
const dim = INSIGHT_DIMENSIONS.leadershipEffectiveness;
// → { id: 'leadership_effectiveness', label: '...', shortLabel: '...' }
```

### In UI Copy

✅ **Do:**
- "Insight Dimension Distribution"
- "Leadership Effectiveness – Score Distribution"
- "View all Insight Dimensions"
- "Your Team Wellbeing score is 72"

❌ **Don't:**
- "Index Distribution" (too generic)
- "Leadership Index" (deprecated branding)
- "View all indices" (internal math term)

### In Documentation

- First mention: "Evalia Insight Dimensions (EID)" – establishes context
- Subsequent: "Insight Dimensions" or specific dimension names
- Reference this doc: `See docs/INSIGHT_DIMENSIONS_NAMING.md for naming conventions`

---

## Code Mapping (shared/analytics.ts)

The canonical mapping is defined in `shared/analytics.ts`:

```typescript
export const INSIGHT_DIMENSIONS = {
  leadershipEffectiveness: {
    id: 'leadership_effectiveness',
    indexType: 'leadership-effectiveness',
    label: 'Leadership Effectiveness Dimension',
    shortLabel: 'Leadership Effectiveness',
  },
  teamWellbeing: {
    id: 'team_wellbeing',
    indexType: 'team-wellbeing',
    label: 'Team Wellbeing Dimension',
    shortLabel: 'Team Wellbeing',
  },
  burnoutRisk: {
    id: 'burnout_risk',
    indexType: 'burnout-risk',
    label: 'Burnout Risk Dimension',
    shortLabel: 'Burnout Risk',
  },
  psychologicalSafety: {
    id: 'psychological_safety',
    indexType: 'psychological-safety',
    label: 'Psychological Safety Dimension',
    shortLabel: 'Psychological Safety',
  },
  engagementEnergy: {
    id: 'engagement_energy',
    indexType: 'engagement',
    label: 'Engagement Energy Dimension',
    shortLabel: 'Engagement',
  },
} as const;
```

---

## Related Documents

- **EID Framework Overview:** `EVALIA_INSIGHT_DIMENSIONS.md` – full dimension definitions
- **Measurement Model:** `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` – computation rules
- **Metric Spec:** `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` – API contracts

---

**End of Naming Conventions**

