# Evalia Insight Dimensions (EID)

> **Status:** Canonical Reference  
> **Last Updated:** 2025-12-06  
> **Purpose:** Single source of truth for Evalia's core measurement dimensions

---

## Overview

**Evalia Insight Dimensions (EID)** is Evalia's proprietary framework for measuring organizational health, leadership effectiveness, and employee wellbeing. The framework provides standardized, actionable metrics derived from survey responses.

This document serves as the **canonical reference** for dimension definitions and naming conventions used throughout the Evalia platform.

---

## The Five Core Dimensions

Evalia's measurement framework consists of five core Insight Dimensions:

| Dimension | Internal ID | Description |
|-----------|-------------|-------------|
| **Leadership Effectiveness** | `leadership-effectiveness` | Measures how effectively leaders communicate, develop, and empower their teams |
| **Team Wellbeing** | `team-wellbeing` | Measures the overall health, satisfaction, and work-life balance of team members |
| **Burnout Risk** | `burnout-risk` | Measures indicators of exhaustion, disengagement, and unsustainable workload |
| **Psychological Safety** | `psychological-safety` | Measures whether team members feel safe to speak up, take risks, and be vulnerable |
| **Engagement & Enablement** | `engagement` | Measures employee motivation, commitment, and ability to perform effectively |

---

## Dimension Details

### 1. Leadership Effectiveness

**What it measures:** The quality and impact of leadership behaviors as perceived by team members.

**Key domains:**
- Leadership Clarity
- Coaching & Development
- Fairness & Equity
- Empowerment
- Communication

**Band interpretation:**
| Band | Score Range | Meaning |
|------|-------------|---------|
| Highly Effective | 85-100 | Exceptional leadership practices |
| Effective | 70-84 | Strong leadership with minor gaps |
| Developing | 55-69 | Adequate leadership, room for growth |
| Needs Improvement | 40-54 | Significant leadership gaps |
| Critical | 0-39 | Urgent leadership intervention needed |

---

### 2. Team Wellbeing

**What it measures:** The holistic health and satisfaction of team members.

**Key domains:**
- Work-Life Balance
- Physical & Mental Health
- Job Satisfaction
- Social Connection
- Resource Adequacy

**Band interpretation:**
| Band | Score Range | Meaning |
|------|-------------|---------|
| Thriving | 85-100 | Team is flourishing |
| Healthy | 70-84 | Generally positive wellbeing |
| Mixed | 55-69 | Some concerns present |
| At Risk | 40-54 | Wellbeing needs attention |
| Critical | 0-39 | Urgent intervention required |

---

### 3. Burnout Risk

**What it measures:** Indicators of burnout, exhaustion, and unsustainable work patterns.

**Key domains:**
- Workload Management
- Emotional Exhaustion
- Recovery Time
- Role Clarity
- Support Availability

**Band interpretation (Note: Higher score = Higher risk):**
| Band | Score Range | Meaning |
|------|-------------|---------|
| Low Risk | 0-39 | Minimal burnout indicators |
| Moderate | 40-54 | Some warning signs |
| Elevated | 55-69 | Notable burnout risk |
| High Risk | 70-84 | Significant burnout indicators |
| Critical Risk | 85-100 | Immediate intervention needed |

---

### 4. Psychological Safety

**What it measures:** The degree to which team members feel safe to express themselves.

**Key domains:**
- Safe to Speak Up
- Safe to Fail
- Inclusion & Belonging
- Trust in Leadership
- Conflict Resolution

**Band interpretation:**
| Band | Score Range | Meaning |
|------|-------------|---------|
| Very High Safety | 85-100 | Exceptional psychological safety |
| High Safety | 70-84 | Strong safety culture |
| Moderate Safety | 55-69 | Average safety, some hesitation |
| Low Safety | 40-54 | Significant safety concerns |
| Very Low Safety | 0-39 | Critical safety issues |

---

### 5. Engagement & Enablement

**What it measures:** Employee motivation, commitment, and ability to perform.

**Key domains:**
- Motivation & Purpose
- Growth Opportunities
- Recognition
- Autonomy
- Tool & Resource Access

**Band interpretation:**
| Band | Score Range | Meaning |
|------|-------------|---------|
| Highly Engaged | 85-100 | Exceptional engagement |
| Engaged | 70-84 | Strong engagement |
| Developing | 55-69 | Moderate engagement |
| Disengaged | 40-54 | Low engagement |
| Critically Disengaged | 0-39 | Urgent engagement issues |

---

## Naming Conventions

### User-Facing (UI/Reports)

- Use "Insight Dimensions" or "EID" when referring to the framework
- Use full dimension names: "Leadership Effectiveness", "Team Wellbeing", etc.
- Avoid technical jargon like "index" in user-facing contexts

### Technical/API

- Internal identifiers remain unchanged for backward compatibility:
  - `leadership-effectiveness`, `team-wellbeing`, `burnout-risk`, `psychological-safety`, `engagement`
- Metric IDs remain unchanged:
  - `leadership_index_distribution`, `engagement_index_band_distribution`, etc.
- Database columns and API routes are not affected

### Documentation

- Refer to "Insight Dimensions" in conceptual documentation
- Use "dimension" instead of "index" where possible
- Cross-reference this document as the canonical source

---

## Related Documents

- **Measurement Model:** `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` - Computation rules and formulas
- **Metric Spec:** `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` - API shapes and endpoints
- **UI Design:** `ANALYTICS_UI_DESIGN.md` - Visual design specifications
- **Philosophy:** `ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md` - Product positioning

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-06 | Initial creation (NAMING-001) |

