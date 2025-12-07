# Analytics Philosophy: People Development

> **Status:** Conceptual Overview  
> **Last Updated:** 2025-12-06  
> **Purpose:** High-level "why" document explaining Evalia's people development analytics positioning

---

## Related Documents

- **EID Naming:** `INSIGHT_DIMENSIONS_NAMING.md` - Canonical naming conventions
- **Measurement Model:** `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` - Detailed dimension and domain definitions
- **Metric Specifications:** `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` - JSON shapes and API endpoints
- **UI Design:** `ANALYTICS_UI_DESIGN.md` - Visual layout and component specifications

---

## Evalia's Analytics Positioning

Evalia positions itself as a **diagnostic platform for people development**, not just a survey tool. Our analytics are designed to help organizations understand and improve their human systems through data-driven insights.

**Who We Serve:**
- **Consultants** who need to assess organizational health and provide evidence-based recommendations
- **L&D Teams** who design interventions and track their effectiveness
- **HR Leaders** who need to identify risks and prioritize resources

**What Makes Us Different:**
- **Non-clinical focus:** We measure organizational factors, not individual mental health
- **Action-oriented:** Every metric is designed to drive specific interventions
- **Version-aware:** Historical data remains stable, enabling before/after comparisons
- **Config-driven:** Indices adapt to each organization's unique survey structure

---

## The Five Core Insight Dimensions

Evalia's analytics are built around **Evalia Insight Dimensions (EID)** – five core dimensions that measure different aspects of organizational health:

### 1. Leadership Effectiveness Dimension

Measures how effectively leaders support, develop, and enable their teams. Focuses on leadership behaviors (clarity, coaching, fairness, empowerment, communication) and their impact on team outcomes.

**Why It Matters:** Strong leadership is the foundation of organizational health. Without effective leadership, other improvements are difficult to sustain.

---

### 2. Team Wellbeing Dimension

Measures overall team health, work-life balance, support systems, and stress levels. Focuses on workplace conditions that affect employee wellbeing.

**Why It Matters:** Wellbeing directly impacts retention, performance, and organizational culture. Early identification of wellbeing issues prevents burnout and turnover.

---

### 3. Burnout Risk Dimension

Identifies teams or individuals at risk of burnout based on exhaustion, cynicism, and reduced efficacy indicators. Provides early warning signals for intervention.

**Why It Matters:** Burnout is costly—both for individuals and organizations. Early detection enables proactive support before it becomes critical.

---

### 4. Psychological Safety Dimension

Measures the degree to which team members feel safe to take risks, voice concerns, and be vulnerable without fear of negative consequences. Based on Amy Edmondson's research.

**Why It Matters:** Psychological safety is the foundation of innovation, learning, and high performance. Teams with high psychological safety outperform those without.

---

### 5. Engagement Energy Dimension

Measures employee engagement (emotional commitment) and enablement (having resources and support to succeed). Combines motivation with capability.

**Why It Matters:** Engaged and enabled employees drive organizational success. This dimension helps identify whether issues are motivational (engagement) or resource-based (enablement).

---

## The Manager / Team Lens

**Why Segmentation Matters:**

Organizational health is not uniform. Different managers, teams, departments, and roles experience different conditions. Evalia's analytics enable segmentation by:

- **Manager:** Identify which leaders need coaching or support
- **Team:** Spot teams with high burnout risk or low psychological safety
- **Role:** Understand how different roles experience the organization
- **Department:** Compare departments to identify systemic issues
- **Location:** Account for geographic or cultural differences

**Key Insights Enabled:**

1. **Targeted Interventions:** Focus resources where they're needed most
2. **Perception Gaps:** Compare manager self-assessment vs team assessment
3. **Hotspot Detection:** Identify segments requiring urgent attention
4. **Best Practices:** Learn from high-performing segments

---

## The Flow: Survey → Scores → Indices → Insights

**Step 1: Survey Responses**
- Employees complete surveys with questions mapped to scoring categories
- Responses are scored using the survey's `scoreConfig`
- Each response is linked to a `score_config_version_id` for historical stability

**Step 2: Category Scores**
- Individual question scores are aggregated into category scores
- Categories represent domains (e.g., "Leadership Clarity", "Workload Management")
- Categories are weighted according to `scoreConfig`

**Step 3: Index Computation**
- Categories are grouped by domain type (leadership, wellbeing, engagement)
- Indices are computed as weighted averages of relevant categories
- Each index is normalized to 0-100 scale

**Step 4: Insights & Action**
- Indices are banded (e.g., "Highly Effective", "Effective", "Developing")
- Manager/team segmentation reveals patterns
- Hotspot detection prioritizes interventions
- Trends over time show progress

**The Result:** Actionable insights that help consultants and L&D teams:
- Identify what's working and what needs improvement
- Prioritize interventions based on risk and impact
- Track progress over time
- Provide evidence-based recommendations

---

## Design Principles

**1. Non-Clinical Focus**
- We measure organizational factors, not individual mental health
- Metrics are designed for organizational improvement, not diagnosis
- Language is professional and action-oriented

**2. Version-Aware**
- Historical data remains stable when scoring configs change
- Enables before/after comparisons and trend analysis
- Builds trust through data consistency

**3. Config-Driven**
- Indices adapt to each organization's unique survey structure
- Categories map to domains through metadata
- Flexible enough to support diverse use cases

**4. Action-Oriented**
- Every metric is designed to drive specific interventions
- Hotspot detection prioritizes resources
- Self vs team comparisons identify coaching opportunities

---

## What's Next

For detailed index and domain definitions, see `ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md`.

For JSON shapes and API endpoints, see `ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md`.

For visual layout and components, see `ANALYTICS_UI_DESIGN.md`.

---

**End of Philosophy Document**

