# Analytics Metric Specification: People Development

> **Status:** Technical Specification  
> **Last Updated:** 2025-12-06  
> **Purpose:** Define JSON shapes, metric IDs, and API endpoints for Evalia Insight Dimensions (EID) analytics

---

## Related Documents

- **EID Framework:** `EVALIA_INSIGHT_DIMENSIONS.md` - Canonical dimension definitions and terminology
- **Philosophy:** `ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md` - High-level positioning and "why"
- **Measurement Model:** `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` - Dimension and domain definitions
- **UI Design:** `ANALYTICS_UI_DESIGN.md` - Visual layout and component specifications

---

## Metric Types

> **Terminology Note:** This spec uses "dimension" (from Evalia Insight Dimensions framework) and "index" 
> interchangeably in metric IDs for backward compatibility. See `EVALIA_INSIGHT_DIMENSIONS.md` for canonical naming.

### 1. index_distribution (Dimension Score Distribution)

Histogram showing distribution of Insight Dimension scores across all respondents (or filtered segment). Returns score buckets with counts and percentages.

**Typical Visualization:** `<BarChart />` with dimension-specific bands

---

### 2. index_band_distribution (Dimension Band Distribution)

Donut chart showing percentage of respondents in each dimension band (e.g., "Highly Effective", "Effective", "Developing"). Returns band counts and percentages.

**Typical Visualization:** `<DonutChart />` with dimension-specific colors

---

### 3. domain_overview

Bar chart or table showing average score for each domain within an index category. Returns domain scores, min/max, response counts, and weights.

**Typical Visualization:** `<BarChart />` horizontal bars showing domain scores

---

### 4. domain_overview_by_segment

Heatmap or grouped bar chart showing domain scores for each manager/team segment. Returns segmented domain scores with response counts per segment.

**Typical Visualization:** Heatmap or grouped `<BarChart />`

---

### 5. index_trend

Line chart showing how index scores change over time (if multiple survey waves). Returns time series data with index values per date.

**Typical Visualization:** `<LineChart />` with multiple series (one per index)

---

### 6. hotspot_summary

List of managers/teams with critical scores requiring intervention. Returns segments with issues, severity, and priority.

**Typical Visualization:** Custom `<HotspotList />` or table

---

### 7. self_vs_team_comparison

Compare manager self-assessment vs team assessment for each index/domain. Returns self scores, team scores, and gaps.

**Typical Visualization:** Side-by-side comparison cards or `<BarChart />` with grouped bars

---

### 8. index_summary_by_segment

Table or cards showing all 5 indices for each manager/team segment. Returns aggregated index scores per segment.

**Typical Visualization:** Table or grid of `<MetricStatCard />` components

---

### 9. domain_heatmap_by_segment

Heatmap showing domain scores for each manager/team, color-coded by severity. Returns 2D matrix (segments × domains).

**Typical Visualization:** Custom `<Heatmap />` component (future)

---

### 10. before_after_index_comparison

Compare index scores between two survey versions (e.g., before and after intervention). Returns before/after values, change, and change percentage.

**Typical Visualization:** `<LineChart />` with two series or comparison cards

---

## Metric IDs

| Metric ID | Metric Type | Primary Indices/Domains | Typical Visualization |
|-----------|-------------|------------------------|------------------------|
| `leadership_index_distribution` | index_distribution | Leadership Effectiveness | BarChart |
| `wellbeing_index_distribution` | index_distribution | Team Wellbeing | BarChart |
| `burnout_risk_distribution` | index_distribution | Burnout Risk | BarChart |
| `psychological_safety_distribution` | index_distribution | Psychological Safety | BarChart |
| `engagement_index_distribution` | index_distribution | Engagement/Enablement | BarChart |
| `leadership_index_band_distribution` | index_band_distribution | Leadership Effectiveness | DonutChart |
| `wellbeing_index_band_distribution` | index_band_distribution | Team Wellbeing | DonutChart |
| `burnout_risk_band_distribution` | index_band_distribution | Burnout Risk | DonutChart |
| `psychological_safety_band_distribution` | index_band_distribution | Psychological Safety | DonutChart |
| `engagement_index_band_distribution` | index_band_distribution | Engagement/Enablement | DonutChart |
| `leadership_domain_overview` | domain_overview | Leadership domains | BarChart (horizontal) |
| `wellbeing_domain_overview` | domain_overview | Wellbeing domains | BarChart (horizontal) |
| `engagement_domain_overview` | domain_overview | Engagement domains | BarChart (horizontal) |
| `leadership_domain_overview_by_manager` | domain_overview_by_segment | Leadership domains, Manager segments | Heatmap/Grouped BarChart |
| `wellbeing_domain_overview_by_manager` | domain_overview_by_segment | Wellbeing domains, Manager segments | Heatmap/Grouped BarChart |
| `leadership_domain_overview_by_team` | domain_overview_by_segment | Leadership domains, Team segments | Heatmap/Grouped BarChart |
| `leadership_index_trend` | index_trend | Leadership Effectiveness | LineChart |
| `wellbeing_index_trend` | index_trend | Team Wellbeing | LineChart |
| `burnout_risk_trend` | index_trend | Burnout Risk | LineChart |
| `hotspot_summary` | hotspot_summary | All indices, All domains | HotspotList/Table |
| `self_vs_team_comparison` | self_vs_team_comparison | All indices, All domains | Comparison Cards/BarChart |
| `index_summary_by_manager` | index_summary_by_segment | All indices, Manager segments | MetricStatCard grid/Table |
| `index_summary_by_team` | index_summary_by_segment | All indices, Team segments | MetricStatCard grid/Table |
| `domain_heatmap_by_manager` | domain_heatmap_by_segment | All domains, Manager segments | Heatmap |
| `index_trend_comparison` | before_after_index_comparison | All indices | LineChart/Comparison Cards |

---

## JSON Shapes

### Standard Response Structure

All analytics responses follow this structure:

```typescript
interface AnalyticsResponse<T> {
  meta: {
    surveyId: string;
    version?: string; // score_config_version_id
    indexType?: string; // e.g., "leadership-effectiveness"
    segmentBy?: string; // e.g., "manager", "team"
    generatedAt: string; // ISO 8601 timestamp
  };
  data: T;
}
```

---

### 1. Index Distribution

**Metric Type:** `index_distribution`  
**Reuses:** `ScoreDistributionResponse` from Phase 0

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "indexType": "leadership-effectiveness",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "overall": {
      "buckets": [
        {
          "range": "0-20",
          "min": 0,
          "max": 20,
          "count": 5,
          "percentage": 3.5
        },
        {
          "range": "21-40",
          "min": 21,
          "max": 40,
          "count": 18,
          "percentage": 12.7
        },
        {
          "range": "41-60",
          "min": 41,
          "max": 60,
          "count": 45,
          "percentage": 31.7
        },
        {
          "range": "61-80",
          "min": 61,
          "max": 80,
          "count": 52,
          "percentage": 36.6
        },
        {
          "range": "81-100",
          "min": 81,
          "max": 100,
          "count": 22,
          "percentage": 15.5
        }
      ],
      "statistics": {
        "min": 12,
        "max": 98,
        "mean": 58.3,
        "median": 62,
        "stdDev": 18.7
      }
    }
  }
}
```

---

### 2. Index Band Distribution

**Metric Type:** `index_band_distribution`  
**Reuses:** `BandDistributionResponse` from Phase 0

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "indexType": "leadership-effectiveness",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "bands": [
      {
        "bandId": "highly-effective",
        "bandLabel": "Highly Effective",
        "color": "#22c55e",
        "count": 22,
        "percentage": 15.5,
        "minScore": 85,
        "maxScore": 100
      },
      {
        "bandId": "effective",
        "bandLabel": "Effective",
        "color": "#84cc16",
        "count": 52,
        "percentage": 36.6,
        "minScore": 70,
        "maxScore": 84
      },
      {
        "bandId": "developing",
        "bandLabel": "Developing",
        "color": "#f59e0b",
        "count": 45,
        "percentage": 31.7,
        "minScore": 55,
        "maxScore": 69
      },
      {
        "bandId": "needs-improvement",
        "bandLabel": "Needs Improvement",
        "color": "#fb923c",
        "count": 18,
        "percentage": 12.7,
        "minScore": 40,
        "maxScore": 54
      },
      {
        "bandId": "critical",
        "bandLabel": "Critical",
        "color": "#ef4444",
        "count": 5,
        "percentage": 3.5,
        "minScore": 0,
        "maxScore": 39
      }
    ],
    "totalResponses": 142
  }
}
```

---

### 3. Domain Overview

**Metric Type:** `domain_overview`  
**Reuses:** `CategoryBreakdownResponse` from Phase 0

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "indexType": "leadership-effectiveness",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "categories": [
      {
        "categoryId": "leadership-clarity",
        "categoryName": "Leadership Clarity",
        "averageScore": 65.2,
        "minScore": 20,
        "maxScore": 95,
        "responseCount": 142,
        "weight": 1.0,
        "contributionToTotal": 28.5
      },
      {
        "categoryId": "coaching-development",
        "categoryName": "Coaching & Development",
        "averageScore": 58.7,
        "minScore": 15,
        "maxScore": 90,
        "responseCount": 142,
        "weight": 1.5,
        "contributionToTotal": 31.2
      },
      {
        "categoryId": "fairness-equity",
        "categoryName": "Fairness & Equity",
        "averageScore": 72.1,
        "minScore": 30,
        "maxScore": 100,
        "responseCount": 142,
        "weight": 1.0,
        "contributionToTotal": 25.8
      },
      {
        "categoryId": "empowerment",
        "categoryName": "Empowerment",
        "averageScore": 61.5,
        "minScore": 25,
        "maxScore": 88,
        "responseCount": 142,
        "weight": 1.0,
        "contributionToTotal": 22.0
      },
      {
        "categoryId": "communication",
        "categoryName": "Communication",
        "averageScore": 68.9,
        "minScore": 35,
        "maxScore": 95,
        "responseCount": 142,
        "weight": 1.0,
        "contributionToTotal": 24.6
      }
    ]
  }
}
```

---

### 4. Domain Overview by Segment

**Metric Type:** `domain_overview_by_segment`  
**Extends:** `CategoryBreakdownResponse` with segmentation

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "indexType": "leadership-effectiveness",
    "segmentBy": "manager",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "segments": [
      {
        "segmentId": "m123",
        "segmentLabel": "John Smith",
        "categories": [
          {
            "categoryId": "leadership-clarity",
            "categoryName": "Leadership Clarity",
            "averageScore": 72.5,
            "responseCount": 8
          },
          {
            "categoryId": "coaching-development",
            "categoryName": "Coaching & Development",
            "averageScore": 68.2,
            "responseCount": 8
          },
          {
            "categoryId": "fairness-equity",
            "categoryName": "Fairness & Equity",
            "averageScore": 75.0,
            "responseCount": 8
          },
          {
            "categoryId": "empowerment",
            "categoryName": "Empowerment",
            "averageScore": 70.8,
            "responseCount": 8
          },
          {
            "categoryId": "communication",
            "categoryName": "Communication",
            "averageScore": 73.1,
            "responseCount": 8
          }
        ]
      },
      {
        "segmentId": "m456",
        "segmentLabel": "Jane Doe",
        "categories": [
          {
            "categoryId": "leadership-clarity",
            "categoryName": "Leadership Clarity",
            "averageScore": 58.3,
            "responseCount": 12
          }
        ]
      }
    ]
  }
}
```

---

### 5. Index Trend

**Metric Type:** `index_trend`  
**Reuses:** `LineChart` data structure from Phase 0

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "series": [
      {
        "date": "2025-11-01",
        "leadershipIndex": 68.5,
        "wellbeingIndex": 72.3,
        "burnoutRiskIndex": 42.1,
        "psychologicalSafetyIndex": 65.8,
        "engagementIndex": 70.2
      },
      {
        "date": "2025-12-01",
        "leadershipIndex": 71.2,
        "wellbeingIndex": 74.1,
        "burnoutRiskIndex": 38.5,
        "psychologicalSafetyIndex": 68.3,
        "engagementIndex": 72.8
      }
    ]
  }
}
```

---

### 6. Hotspot Summary

**Metric Type:** `hotspot_summary`  
**Custom Shape:** Aggregates multiple indices

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "hotspots": [
      {
        "segmentId": "m456",
        "segmentLabel": "Jane Doe",
        "segmentType": "manager",
        "issues": [
          {
            "indexType": "psychological-safety",
            "indexValue": 38,
            "severity": "critical",
            "message": "Psychological Safety: 38 (Very Low Safety)"
          },
          {
            "domainId": "safe-to-speak-up",
            "domainValue": 30,
            "severity": "critical",
            "message": "Safe to Speak Up: 30 (Critical)"
          }
        ],
        "priority": "high"
      },
      {
        "segmentId": "eng-001",
        "segmentLabel": "Engineering",
        "segmentType": "team",
        "issues": [
          {
            "indexType": "burnout-risk",
            "indexValue": 75,
            "severity": "critical",
            "message": "Burnout Risk: 75 (Very High Risk)"
          },
          {
            "domainId": "workload-management",
            "domainValue": 35,
            "severity": "critical",
            "message": "Workload Management: 35 (At Risk)"
          }
        ],
        "priority": "high"
      }
    ]
  }
}
```

---

### 7. Self vs Team Comparison

**Metric Type:** `self_vs_team_comparison`  
**Custom Shape:** Comparison structure

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "managerId": "m123",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "manager": {
      "selfAssessment": {
        "leadershipIndex": 85,
        "wellbeingIndex": 78,
        "burnoutRiskIndex": 35,
        "psychologicalSafetyIndex": 82,
        "engagementIndex": 80,
        "domains": {
          "leadership-clarity": 88,
          "coaching-development": 82,
          "workload-management": 75
        }
      },
      "teamAssessment": {
        "leadershipIndex": 72,
        "wellbeingIndex": 68,
        "burnoutRiskIndex": 45,
        "psychologicalSafetyIndex": 65,
        "engagementIndex": 70,
        "domains": {
          "leadership-clarity": 75,
          "coaching-development": 68,
          "workload-management": 62
        }
      },
      "gaps": {
        "leadershipIndex": -13,
        "wellbeingIndex": -10,
        "burnoutRiskIndex": 10,
        "psychologicalSafetyIndex": -17,
        "engagementIndex": -10,
        "domains": {
          "leadership-clarity": -13,
          "coaching-development": -14,
          "workload-management": -13
        }
      }
    }
  }
}
```

---

### 8. Index Summary by Segment

**Metric Type:** `index_summary_by_segment`  
**Custom Shape:** Aggregated index scores per segment

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "segmentBy": "manager",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "segments": [
      {
        "segmentId": "m123",
        "segmentLabel": "John Smith",
        "indices": {
          "leadershipEffectiveness": 72,
          "teamWellbeing": 68,
          "burnoutRisk": 45,
          "psychologicalSafety": 65,
          "engagement": 70
        },
        "responseCount": 8
      },
      {
        "segmentId": "m456",
        "segmentLabel": "Jane Doe",
        "indices": {
          "leadershipEffectiveness": 58,
          "teamWellbeing": 52,
          "burnoutRisk": 68,
          "psychologicalSafety": 38,
          "engagement": 55
        },
        "responseCount": 12
      }
    ]
  }
}
```

---

### 9. Domain Heatmap by Segment

**Metric Type:** `domain_heatmap_by_segment`  
**Custom Shape:** 2D matrix (segments × domains)

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "version": "v1-id",
    "indexType": "leadership-effectiveness",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "matrix": [
      {
        "segmentId": "m123",
        "segmentLabel": "John Smith",
        "domains": [
          {
            "domainId": "leadership-clarity",
            "score": 75,
            "band": "effective"
          },
          {
            "domainId": "coaching-development",
            "score": 68,
            "band": "developing"
          },
          {
            "domainId": "fairness-equity",
            "score": 72,
            "band": "effective"
          },
          {
            "domainId": "empowerment",
            "score": 70,
            "band": "effective"
          },
          {
            "domainId": "communication",
            "score": 73,
            "band": "effective"
          }
        ]
      },
      {
        "segmentId": "m456",
        "segmentLabel": "Jane Doe",
        "domains": [
          {
            "domainId": "leadership-clarity",
            "score": 58,
            "band": "developing"
          },
          {
            "domainId": "coaching-development",
            "score": 52,
            "band": "needs-improvement"
          }
        ]
      }
    ]
  }
}
```

---

### 10. Before/After Index Comparison

**Metric Type:** `before_after_index_comparison`  
**Custom Shape:** Time series with version comparison

**JSON Shape:**
```json
{
  "meta": {
    "surveyId": "survey-123",
    "versionBefore": "v1-id",
    "versionAfter": "v2-id",
    "generatedAt": "2025-12-06T10:00:00Z"
  },
  "data": {
    "comparison": {
      "leadershipEffectiveness": {
        "before": 68.5,
        "after": 71.2,
        "change": 2.7,
        "changePercent": 3.9
      },
      "teamWellbeing": {
        "before": 72.3,
        "after": 74.1,
        "change": 1.8,
        "changePercent": 2.5
      },
      "burnoutRisk": {
        "before": 42.1,
        "after": 38.5,
        "change": -3.6,
        "changePercent": -8.6
      },
      "psychologicalSafety": {
        "before": 65.8,
        "after": 68.3,
        "change": 2.5,
        "changePercent": 3.8
      },
      "engagement": {
        "before": 70.2,
        "after": 72.8,
        "change": 2.6,
        "changePercent": 3.7
      }
    }
  }
}
```

---

## UI Mapping

**Lightweight Reference:** This section briefly notes which base component types from `ANALYTICS_UI_DESIGN.md` are expected for each metric type. For full component specifications, see `ANALYTICS_UI_DESIGN.md`.

| Metric Type | Base Component | Notes |
|-------------|----------------|-------|
| `index_distribution` | `<BarChart />` | Index-specific bands, color-coded |
| `index_band_distribution` | `<DonutChart />` | Index-specific colors from band definitions |
| `domain_overview` | `<BarChart />` | Horizontal bars, sorted by score |
| `domain_overview_by_segment` | `<BarChart />` (grouped) or `<Heatmap />` | Grouped bars or heatmap visualization |
| `index_trend` | `<LineChart />` | Multiple series (one per index) |
| `hotspot_summary` | Custom `<HotspotList />` or `<Table />` | List/table with severity indicators |
| `self_vs_team_comparison` | `<BarChart />` (grouped) or Comparison Cards | Side-by-side or grouped bars |
| `index_summary_by_segment` | `<MetricStatCard />` grid or `<Table />` | Grid of stat cards or table |
| `domain_heatmap_by_segment` | Custom `<Heatmap />` | 2D matrix visualization (future) |
| `before_after_index_comparison` | `<LineChart />` (two series) or Comparison Cards | Before/after lines or cards |

**See `ANALYTICS_UI_DESIGN.md` for:**
- Component props and interfaces
- Error and loading states
- Layout and styling rules
- Responsive behavior

---

## Summary

This specification defines the API contracts for **Evalia Insight Dimensions (EID)** analytics:

1. **10 Metric Types:** Dimension distribution, band distribution, domain overview, trends, comparisons, hotspots
2. **25+ Metric IDs:** Concrete identifiers for each metric variant (uses "index" prefix for backward compatibility)
3. **10 JSON Shapes:** Standardized response structures, reusing Phase 0 shapes where possible
4. **UI Mapping:** Lightweight reference to expected components

All metrics are:
- **Version-aware** (via `meta.version`)
- **Consistent** (standard `meta/data` structure)
- **Reusable** (reuses Phase 0 shapes where possible)
- **Extensible** (custom shapes for unique metrics)

**See also:** `EVALIA_INSIGHT_DIMENSIONS.md` for canonical dimension names and definitions.

---

**End of Metric Specification**

