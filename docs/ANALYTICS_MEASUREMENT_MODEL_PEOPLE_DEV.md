# Analytics Measurement Model: People Development

> **Status:** Formal Measurement Model Definition  
> **Last Updated:** 2025-12-06  
> **Purpose:** Define the computation rules for Evalia Insight Dimensions (EID)

---

## Related Documents

- **Canonical Definitions:** `EVALIA_INSIGHT_DIMENSIONS.md` - Source of truth for dimension names and bands
- **Philosophy:** `ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md` - High-level positioning and "why"
- **Metric Specifications:** `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` - JSON shapes and API endpoints
- **UI Design:** `ANALYTICS_UI_DESIGN.md` - Visual layout and component specifications

---

## Executive Summary

This document defines Evalia's **measurement model** for the **Evalia Insight Dimensions (EID)** framework. It specifies:

- **5 Core Insight Dimensions:** Leadership Effectiveness, Team Wellbeing, Burnout Risk, Psychological Safety, Engagement/Enablement
- **15+ Domains:** Organized into Leadership, Wellbeing, and Engagement categories
- **Computation Rules:** How dimensions are computed from scoring categories
- **Version-Awareness:** How historical data remains stable
- **Manager/Team Segmentation:** How analytics are segmented for targeted insights

> **Terminology Note:** "Insight Dimensions" is the user-facing term. Technical identifiers (e.g., `leadership-effectiveness`, `*_index_distribution`) remain unchanged for backward compatibility. See `EVALIA_INSIGHT_DIMENSIONS.md` for canonical naming conventions.

**What This Document Does NOT Cover:**
- JSON payload shapes (see `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`)
- UI components and visualizations (see `ANALYTICS_UI_DESIGN.md`)
- Product positioning and "why" (see `ANALYTICS_PHILOSOPHY_PEOPLE_DEV.md`)

---

## Shared Computation Rules

### Config-Driven Indices

**Principle:** All indices are computed from `scoreConfig.categories[]`, not hardcoded.

**Process:**
1. Categories are tagged with domain metadata (e.g., `category.metadata.domainType: "leadership"`)
2. Categories are associated with indices (e.g., `category.metadata.indices: ["leadership-effectiveness"]`)
3. Indices are computed as weighted averages of relevant categories
4. Weights come from `category.weight` or default to equal weighting

**Example:**
- If a survey has 5 categories tagged as "leadership" domains
- Leadership Effectiveness Index = weighted average of those 5 category scores
- If categories have weights [1.0, 1.0, 1.5, 1.0, 0.5], those weights are applied

---

### 0-100 Normalization

**Principle:** All indices are normalized to a 0-100 scale for consistency and comparability.

**Process:**
1. Category scores are computed from question responses (using scoring engine)
2. Category scores are normalized to 0-100 (if not already)
3. Index = weighted average of normalized category scores
4. Final index is clamped to 0-100 range

**Rationale:**
- Enables consistent banding across indices
- Makes comparisons meaningful
- Standardizes visualizations

---

### Banding Rules

**Shared Band Pattern:**

All indices use a **5-band system** with consistent color coding:

- **Band 1 (Best):** Green (`#22c55e`) - Highest scores, healthy/effective state
- **Band 2 (Good):** Lime (`#84cc16`) - Above average, stable/effective
- **Band 3 (Neutral):** Amber (`#f59e0b`) - Average, watch/developing
- **Band 4 (At Risk):** Orange (`#fb923c`) - Below average, needs improvement/at risk
- **Band 5 (Critical):** Red (`#ef4444`) - Lowest scores, critical/urgent

**Index-Specific Ranges:**

Each index defines its own band thresholds based on organizational research and best practices. See individual index definitions below.

**Special Case - Burnout Risk:**
- The Burnout Risk Dimension can be expressed in two ways:
  1. **Inverse scale:** 0 = highest risk, 100 = lowest risk (aligned with other indices)
  2. **Direct risk scale:** 0 = lowest risk, 100 = highest risk (more intuitive for risk)
- Band labels reflect risk level (e.g., "Low Risk", "High Risk", "Critical Risk")

---

### Version-Awareness

**Principle:** All indices and domains must respect `score_config_version_id` to ensure historical stability.

**Rules:**

1. **Index Computation:**
   - Indices are computed using responses with the same `score_config_version_id`
   - If a survey has multiple versions, indices are computed separately per version
   - Default: Use latest version (highest `versionNumber`)

2. **Category Mapping:**
   - Domain-to-category mapping is version-specific
   - If categories change between versions, domain scores are computed separately
   - Historical comparisons require explicit version selection

3. **Manager/Team Aggregation:**
   - Manager/team indices only include responses with the same version
   - Prevents mixing responses scored with different configs
   - Ensures aggregation is meaningful

4. **Historical Stability:**
   - Once computed, an index value for a specific version never changes
   - Enables before/after comparisons
   - Builds trust through data consistency

**Implementation Note:** Version-awareness is enforced server-side during index computation, not client-side.

---

## Core Insight Dimensions

> **Terminology Note:** These are Evalia Insight Dimensions (EID). Metric IDs use "index" for 
> backward compatibility. See `docs/INSIGHT_DIMENSIONS_NAMING.md` for naming conventions.

### 1. Leadership Effectiveness Dimension

**Purpose:** Measure how effectively leaders support, develop, and enable their teams. Non-clinical organizational metric focused on leadership behaviors and team outcomes.

**Domain Types That Feed Into It:**
- Leadership domains (see Domains section below)
- Typically includes: Leadership Clarity, Coaching & Development, Fairness & Equity, Empowerment, Communication

**Computation:**
- Weighted average of all categories tagged with `domainType: "leadership"` or `indices: ["leadership-effectiveness"]`
- Weights from `category.weight` or equal weighting
- Normalized to 0-100

**Bands:**
- **85-100:** Highly Effective
- **70-84:** Effective
- **55-69:** Developing
- **40-54:** Needs Improvement
- **0-39:** Critical

**Special Notes:**
- Higher scores indicate more effective leadership
- Can be computed at individual, team, or organizational level
- Manager-level indices enable leadership development programs

---

### 2. Team Wellbeing Dimension

**Purpose:** Measure overall team health, work-life balance, support systems, and stress levels. Non-clinical organizational metric focused on workplace conditions.

**Domain Types That Feed Into It:**
- Wellbeing domains (see Domains section below)
- Typically includes: Workload Management, Support Systems, Work-Life Balance, Civility & Respect, Recognition & Appreciation

**Computation:**
- Weighted average of all categories tagged with `domainType: "wellbeing"` or `indices: ["team-wellbeing"]`
- Weights from `category.weight` or equal weighting
- Normalized to 0-100

**Bands:**
- **80-100:** Healthy
- **65-79:** Stable
- **50-64:** Watch
- **35-49:** At Risk
- **0-34:** Critical

**Special Notes:**
- Higher scores indicate better wellbeing
- Lower scores may indicate risk factors for burnout
- Can be used to identify teams needing support

---

### 3. Burnout Risk Dimension

**Purpose:** Identify teams or individuals at risk of burnout based on exhaustion, cynicism, and reduced efficacy indicators. Non-clinical organizational metric for early intervention.

**Domain Types That Feed Into It:**
- Burnout risk factor domains
- Typically includes: Emotional Exhaustion, Cynicism/Depersonalization, Reduced Efficacy, Work Overload, Lack of Control

**Computation:**
- Can be computed in two ways:
  1. **Inverse scale:** Weighted average of risk factor categories, then inverted (lower category scores = higher risk index)
  2. **Direct risk scale:** Direct weighted average where lower category scores = lower risk index (then inverted for display)
- Normalized to 0-100

**Bands (Inverse Scale - Higher Index = Lower Risk):**
- **0-20:** Low Risk (healthy, sustainable)
- **21-40:** Moderate Risk (monitor, minor interventions)
- **41-60:** High Risk (active support needed)
- **61-80:** Very High Risk (urgent intervention)
- **81-100:** Critical Risk (immediate action required)

**Special Notes:**
- Directionality: Lower index = higher risk (inverse relationship)
- Can be expressed as risk score (0-100 where higher = higher risk) for intuitive display
- Critical for early intervention and resource allocation

---

### 4. Psychological Safety Dimension

**Purpose:** Measure the degree to which team members feel safe to take risks, voice concerns, and be vulnerable without fear of negative consequences. Based on Amy Edmondson's framework.

**Domain Types That Feed Into It:**
- Psychological safety domains
- Typically includes: Safe to Speak Up, Safe to Make Mistakes, Safe to Disagree, Safe to Be Yourself, Trust in Leadership

**Computation:**
- Weighted average of all categories tagged with `domainType: "psychological-safety"` or `indices: ["psychological-safety"]`
- Weights from `category.weight` or equal weighting
- Normalized to 0-100

**Bands:**
- **75-100:** High Safety
- **60-74:** Moderate Safety
- **45-59:** Low Safety
- **30-44:** Very Low Safety
- **0-29:** Critical

**Special Notes:**
- Based on Edmondson's research on psychological safety
- Critical for innovation, learning, and high performance
- Lower scores indicate teams where people fear speaking up

---

### 5. Engagement Energy Dimension

**Purpose:** Measure employee engagement (emotional commitment) and enablement (having resources and support to succeed). Combines motivation with capability.

**Domain Types That Feed Into It:**
- Engagement/enablement domains (see Domains section below)
- Typically includes: Motivation & Commitment, Growth & Development, Alignment, Resources & Tools, Recognition & Rewards

**Computation:**
- Weighted average of all categories tagged with `domainType: "engagement"` or `indices: ["engagement", "enablement"]`
- Weights from `category.weight` or equal weighting
- Normalized to 0-100

**Bands:**
- **80-100:** Highly Engaged
- **65-79:** Engaged
- **50-64:** Neutral
- **35-49:** Disengaged
- **0-34:** Highly Disengaged

**Special Notes:**
- Combines emotional commitment (engagement) with resource availability (enablement)
- Helps distinguish between motivation issues vs capability issues
- Critical for retention and performance

---

## Domains

### Domain Taxonomy

Evalia's domain model is inspired by:
- **Canadian "13 Psychosocial Factors"** (CSA Z1003, Guarding Minds @ Work)
- **ISO 45003** (Psychological health and safety at work)
- **Academic frameworks** (Edmondson's Psychological Safety, Maslach's Burnout, etc.)

But expressed in **Evalia's own language** optimized for L&D and consulting use cases.

---

### Leadership Domains

#### 1. Leadership Clarity
- Vision, mission, strategic direction
- Clear expectations and goals
- Role clarity and responsibilities
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "leadership-clarity"` or `metadata.domainId: "leadership-clarity"`

#### 2. Coaching & Development
- Regular feedback and guidance
- Growth opportunities
- Skill development support
- Career pathing
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "coaching-development"` or `metadata.domainId: "coaching-development"`

#### 3. Fairness & Equity
- Consistent treatment
- Fair recognition and rewards
- Equitable opportunities
- Transparent decision-making
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "fairness-equity"` or `metadata.domainId: "fairness-equity"`

#### 4. Empowerment
- Autonomy in work
- Decision-making authority
- Trust and delegation
- Innovation encouragement
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "empowerment"` or `metadata.domainId: "empowerment"`

#### 5. Communication
- Transparency and openness
- Active listening
- Two-way dialogue
- Information sharing
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "communication"` or `metadata.domainId: "communication"`

---

### Wellbeing Domains

#### 1. Workload Management
- Reasonable demands
- Time pressure and deadlines
- Work intensity
- Resource adequacy
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "workload-management"` or `metadata.domainId: "workload-management"`

#### 2. Support Systems
- Access to resources
- Help-seeking culture
- Peer support
- Organizational support
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "support-systems"` or `metadata.domainId: "support-systems"`

#### 3. Work-Life Balance
- Boundaries between work and personal life
- Recovery time
- Flexibility
- Respect for personal time
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "work-life-balance"` or `metadata.domainId: "work-life-balance"`

#### 4. Civility & Respect
- Dignity and respect
- Harassment-free environment
- Inclusive culture
- Conflict resolution
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "civility-respect"` or `metadata.domainId: "civility-respect"`

#### 5. Recognition & Appreciation
- Acknowledgment of contributions
- Value and worth
- Meaningful recognition
- Appreciation culture
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "recognition-appreciation"` or `metadata.domainId: "recognition-appreciation"`

---

### Engagement Domains

#### 1. Motivation & Commitment
- Pride in organization
- Discretionary effort
- Emotional connection
- Sense of purpose
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "motivation-commitment"` or `metadata.domainId: "motivation-commitment"`

#### 2. Growth & Development
- Learning opportunities
- Career advancement
- Skill building
- Professional development
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "growth-development"` or `metadata.domainId: "growth-development"`

#### 3. Alignment
- Purpose and values alignment
- Goal clarity
- Strategic understanding
- Cultural fit
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "alignment"` or `metadata.domainId: "alignment"`

#### 4. Resources & Tools
- Adequate equipment
- Information access
- Technology support
- Process efficiency
- **Mapping Rule:** Maps 1:1 to `scoreConfig.categories[]` with `id: "resources-tools"` or `metadata.domainId: "resources-tools"`

---

### Domain-to-Category Mapping

**1:1 Mapping Rule:**
- Each domain maps to exactly one `scoreConfig.categories[]` entry
- Domain ID stored in category metadata: `category.metadata?.domainId` or `category.id` (if using domain ID as category ID)
- Categories can be tagged with index associations: `category.metadata?.indices: ["leadership-effectiveness", "engagement"]`

**Example Category Structure:**
```json
{
  "id": "leadership-clarity",
  "name": "Leadership Clarity",
  "metadata": {
    "domainId": "leadership-clarity",
    "domainType": "leadership",
    "indices": ["leadership-effectiveness"],
    "weight": 1.0
  }
}
```

---

### Domain Lookup Table

| Domain Type | Domain | Primary Indices Affected |
|-------------|--------|-------------------------|
| **Leadership** | Leadership Clarity | Leadership Effectiveness |
| | Coaching & Development | Leadership Effectiveness |
| | Fairness & Equity | Leadership Effectiveness |
| | Empowerment | Leadership Effectiveness |
| | Communication | Leadership Effectiveness |
| **Wellbeing** | Workload Management | Team Wellbeing, Burnout Risk |
| | Support Systems | Team Wellbeing, Burnout Risk |
| | Work-Life Balance | Team Wellbeing, Burnout Risk |
| | Civility & Respect | Team Wellbeing, Psychological Safety |
| | Recognition & Appreciation | Team Wellbeing, Engagement |
| **Engagement** | Motivation & Commitment | Engagement/Enablement |
| | Growth & Development | Engagement/Enablement |
| | Alignment | Engagement/Enablement |
| | Resources & Tools | Engagement/Enablement |
| **Psychological Safety** | Safe to Speak Up | Psychological Safety |
| | Safe to Make Mistakes | Psychological Safety |
| | Safe to Disagree | Psychological Safety |
| | Safe to Be Yourself | Psychological Safety |
| | Trust in Leadership | Psychological Safety, Leadership Effectiveness |
| **Burnout Risk** | Emotional Exhaustion | Burnout Risk |
| | Cynicism/Depersonalization | Burnout Risk |
| | Reduced Efficacy | Burnout Risk |
| | Work Overload | Burnout Risk, Team Wellbeing |
| | Lack of Control | Burnout Risk, Leadership Effectiveness |

**Note:** Some domains may contribute to multiple indices (e.g., "Work Overload" affects both Burnout Risk and Team Wellbeing).

---

## Manager / Team Lens

### Segmentation Dimensions

**Available Dimensions:**
1. **Manager ID** (`managerId` from response metadata or custom field)
2. **Team ID** (`teamId` from response metadata or custom field)
3. **Role** (`role` from response metadata or question answer)
4. **Department** (`department` from response metadata or custom field)
5. **Location** (`location` from response metadata)

**Data Sources:**
- `survey_responses.metadata` (device, location, custom fields)
- Survey questions (e.g., "Who is your manager?", "What team are you on?")
- Custom respondent fields (if `survey_respondents` table extended)

---

### Segmentation Concepts

#### 1. Index Scores by Manager/Team

**Concept:** Compute average index score (Leadership Effectiveness, Wellbeing, etc.) for each manager/team segment.

**Aggregation:**
- Average of all responses where `response.metadata.managerId === segmentId`
- Version-aware: Only include responses with same `score_config_version_id`
- Enables comparison across managers/teams

**Use Case:** Identify which managers/teams need support or coaching.

---

#### 2. Domain Scores by Manager/Team

**Concept:** Compute average domain score (e.g., "Leadership Clarity", "Workload Management") for each manager/team segment.

**Aggregation:**
- Average of domain scores for responses in that segment
- Version-aware: Only include responses with same version
- Enables targeted interventions (e.g., "This manager needs coaching on clarity")

**Use Case:** Identify which specific domains need improvement for each manager/team.

---

#### 3. Self vs Team Comparisons

**Concept:** Compare manager's self-assessment (if manager also completed survey) vs their team's assessment of them.

**Process:**
1. Identify manager's self-response (if exists)
2. Identify all team responses where `metadata.managerId === managerId`
3. Compute indices/domains for both
4. Calculate gaps (self - team)

**Use Case:** Identify perception gaps and coaching opportunities (e.g., manager overestimates effectiveness).

---

#### 4. Hotspot Detection

**Concept:** Identify segments (managers/teams) with critical scores requiring intervention.

**Detection Criteria:**
- High burnout risk (Burnout Risk score > 60, if using inverse scale)
- Low psychological safety (Psychological Safety score < 45)
- Low engagement (Engagement score < 50)
- Critical domain scores (any domain < 40)

**Use Case:** Prioritize interventions and resource allocation.

---

## Version-Awareness Reference

**All indices and domains respect `score_config_version_id`:**

- Indices computed using responses with same version
- Domain scores computed from version-specific category mappings
- Manager/team aggregations only include responses with same version
- Historical comparisons require explicit version selection

**See "Shared Computation Rules" section above for detailed version-awareness rules.**

---

## Summary

This measurement model defines the computation rules for **Evalia Insight Dimensions (EID)**:

1. **5 Core Insight Dimensions:** Leadership Effectiveness, Team Wellbeing, Burnout Risk, Psychological Safety, Engagement/Enablement
2. **15+ Domains:** Organized into Leadership, Wellbeing, Engagement, Psychological Safety, and Burnout Risk categories
3. **Computation Rules:** Config-driven, normalized to 0-100, version-aware
4. **Manager/Team Segmentation:** Enables targeted insights and interventions

All metrics are:
- **Version-aware** (historical stability)
- **Config-driven** (flexible category mapping)
- **Non-clinical** (organizational focus)
- **Actionable** (designed for L&D and consulting use cases)

---

**End of Measurement Model**
