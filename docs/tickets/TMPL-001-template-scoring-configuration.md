# TMPL-001: Template Scoring Configuration Audit & Setup

**Status:** 🟡 In Progress (Dashboard Routing Verified)  
**Phase:** Data Configuration  
**Type:** Configuration / Data Migration  
**Priority:** High  
**Created:** 2025-12-05  
**Updated:** 2025-12-05

---

## Dashboard Routing Test Results (2025-12-05)

| Survey | Categories | Canonical 5D Match | Dashboard Mode | Result |
|--------|------------|-------------------|----------------|--------|
| 5D Smoke Test | 5 | 5/5 | Insight Dimensions (7 tabs) | ✅ Pass |
| Turnover Risk | 7 | 1/5 | Category Analytics (5 tabs) | ✅ Pass |
| Wellbeing Pulse | 4 | 4/5 | Insight Dimensions (7 tabs) | ✅ Pass |
| Canadian EE Survey | 0 | — | Basic (no tabs) | ✅ Pass |

**Routing Logic:**
- ≥3 canonical 5D category IDs → Insight Dimensions
- Scoring enabled but <3 canonical IDs → Category Analytics
- No scoring → Basic Analytics  

---

## Intent

Systematically configure all 37 survey templates with appropriate scoring configurations to ensure they route to the correct analytics dashboard mode:

- **Insight Dimensions Dashboard** → 5D canonical categories
- **Category Analytics Dashboard** → Non-5D scoring categories  
- **Basic Analytics Dashboard** → No scoring (participation + questions only)

---

## Current State

| Category | Count | Current Configuration |
|----------|-------|----------------------|
| Scoring Enabled | 13 | Various category counts (2-7) |
| No Scoring | 24 | `enabled: false` or missing |

### Templates WITH Scoring (13)

| Template | Categories | Engine | Needs Review |
|----------|------------|--------|--------------|
| Evalia Insight 5D Smoke Test | 5 (5D canonical) | — | ✅ Correct |
| Canada EE & Wellbeing Index | 7 | — | ⚠️ Check categories |
| Turnover Risk & Experience | 7 | — | ⚠️ Check categories |
| Adaptive Engagement | 6 | — | ⚠️ Check categories |
| Leadership Impact (Extended) | 6 | — | ⚠️ Check categories |
| Leadership Pulse (Quick) | 6 | — | ⚠️ Check categories |
| Leadership Style (Standard) | 4 | — | ⚠️ Check categories |
| Canada EE Pulse | 4 | — | ⚠️ Check categories |
| Learning Culture Maturity | 3 | — | ⚠️ Check categories |
| Manager Training Readiness | 3 | — | ⚠️ Check categories |
| Coaching Effectiveness | 3 | — | ⚠️ Check categories |
| Post-Training Behaviour | 3 | — | ⚠️ Check categories |
| Pre-Training Competency | 2 | — | ⚠️ Check categories |

### Templates WITHOUT Scoring (24)

| Template | Category | Recommended Action |
|----------|----------|-------------------|
| Canadian Employee Engagement Survey | Employee Engagement | 🔵 Add 5D scoring |
| Change & Communication Pulse | Pulse | ⚪ Keep basic |
| Digital Learning & eLearning UX | Training | ⚪ Keep basic |
| Education Staff Engagement (Canada) | Employee Engagement | 🔵 Add 5D scoring |
| Engagement Pulse (Lite) | Pulse | 🟡 Add generic scoring |
| Exit Interview – Quick Pulse | Exit | ⚪ Keep basic |
| Healthcare Staff Burnout (Canada) | Healthcare | 🔵 Add 5D scoring |
| Hybrid & Remote Work Pulse | Pulse | 🟡 Add generic scoring |
| Inclusion & Belonging Micro-Pulse | Pulse | ⚪ Keep basic |
| Inclusive Learning Experience | Training | ⚪ Keep basic |
| Leadership Development Impact | Training | 🟡 Add generic scoring |
| Learning & Growth Opportunities | Pulse | ⚪ Keep basic |
| Manager Support & Check-In | Pulse | ⚪ Keep basic |
| Monthly Engagement & Morale (Canada) | Pulse | 🟡 Add generic scoring |
| New Hire Onboarding Pulse | Pulse | ⚪ Keep basic |
| Onboarding Check-In (30/60/90) | Onboarding | ⚪ Keep basic |
| Psychological Safety & Team Voice | Training | 🔵 Add 5D scoring |
| Team Collaboration Pulse | Pulse | ⚪ Keep basic |
| Training Evaluation – Core Skills | Training | 🟡 Add generic scoring |
| Training Needs Analysis (TNA) | Training | ⚪ Keep basic |
| Training Program ROI | Training | 🟡 Add generic scoring |
| Training Transfer Pulse | Pulse | ⚪ Keep basic |
| Wellbeing & Workload Pulse | Pulse | 🔵 Add 5D scoring |
| Workload & Burnout Risk Screening | Employee Engagement | 🔵 Add 5D scoring |

**Legend:**
- 🔵 Add 5D scoring → Route to Insight Dimensions Dashboard
- 🟡 Add generic scoring → Route to Category Analytics Dashboard  
- ⚪ Keep basic → Route to Basic Analytics Dashboard

---

## Scoring Configuration Criteria

### When to Use 5D Insight Dimensions Scoring

Apply 5D scoring when the template measures **organizational health** through these dimensions:

| Dimension | Category ID | Measures |
|-----------|-------------|----------|
| Engagement Energy | `engagement` | Motivation, commitment, enthusiasm |
| Leadership Effectiveness | `leadership-effectiveness` | Manager support, communication, trust |
| Psychological Safety | `psychological-safety` | Voice, risk-taking comfort, inclusion |
| Team Wellbeing | `team-wellbeing` | Work-life balance, support, health |
| Burnout Risk | `burnout-risk` | Stress, exhaustion, disengagement (INVERTED) |

**Criteria:**
- Template focuses on employee experience / organizational health
- Questions map naturally to 3+ of the 5 dimensions
- Survey is intended for aggregate organizational insights

**Good candidates:**
- Employee engagement surveys
- Wellbeing assessments
- Organizational health checks
- Manager effectiveness surveys

### When to Use Generic Category Scoring

Apply generic scoring when:
- Template has structured measurement areas that DON'T map to 5D
- Template measures specific skills, competencies, or program effectiveness
- Categories are domain-specific (e.g., training outcomes, leadership styles)

**Good candidates:**
- Training effectiveness surveys
- Leadership style assessments
- Skills assessments
- Program evaluation surveys
- Competency self-assessments

### When to Keep Basic (No Scoring)

Keep as basic analytics when:
- Template is primarily qualitative (open-ended questions)
- Template uses conditional logic that breaks linear scoring
- Template is a simple pulse/check-in without structured metrics
- Template is exploratory/diagnostic without scoring intent

**Good candidates:**
- Quick pulse checks
- Exit interviews (exploratory)
- Feedback forms
- Needs assessments
- Check-in templates

---

## Special Case: Logic-Based Templates

### The Problem

Templates with conditional logic (branching) present scoring challenges:

```
Q1: How satisfied are you? 
  → If "Very Satisfied" → Skip to Q5
  → If "Dissatisfied" → Ask Q2, Q3, Q4 (diagnostic questions)
```

**Scoring Issues:**
1. **Incomplete responses:** Not all respondents answer all questions
2. **Category gaps:** Some categories may have no data for certain paths
3. **Apples-to-oranges:** Comparing scores across different paths is misleading
4. **Null scores:** Questions skipped by logic = null values in scoring

### Recommended Approach for Logic Templates

| Option | When to Use | Implementation |
|--------|-------------|----------------|
| **Option A: No Scoring** | Complex branching, exploratory surveys | Keep as Basic Analytics |
| **Option B: Path-Specific Scoring** | Predictable paths, each path has own scoring | Create separate category sets per path |
| **Option C: Core-Only Scoring** | Some questions asked of everyone | Only score questions outside of branching |

**Templates with Known Logic:**
| Template | Logic Type | Recommendation |
|----------|------------|----------------|
| Turnover Risk & Experience | Satisfaction branching | Option A (Basic) or Option C |
| Exit Interview | Reason branching | Option A (Basic) |
| Onboarding Check-In | Day branching (30/60/90) | Option C (Core questions) |

---

## Implementation Plan

### Phase 1: Audit (TMPL-001a)
- [ ] Export all template questions to spreadsheet
- [ ] Identify which questions have logic/branching
- [ ] Map questions to potential scoring categories
- [ ] Document decision for each template

### Phase 2: 5D Conversions (TMPL-001b)
- [ ] Canadian Employee Engagement Survey → 5D
- [ ] Education Staff Engagement (Canada) → 5D
- [ ] Healthcare Staff Burnout (Canada) → 5D
- [ ] Psychological Safety & Team Voice → 5D
- [ ] Wellbeing & Workload Pulse → 5D
- [ ] Workload & Burnout Risk Screening → 5D

### Phase 3: Generic Scoring Setup (TMPL-001c)
- [ ] Engagement Pulse (Lite) → Generic categories
- [ ] Hybrid & Remote Work Pulse → Generic categories
- [ ] Leadership Development Impact → Generic categories
- [ ] Monthly Engagement & Morale → Generic categories
- [ ] Training Evaluation – Core Skills → Generic categories
- [ ] Training Program ROI → Generic categories

### Phase 4: Logic Template Resolution (TMPL-001d)
- [ ] Turnover Risk → Decide scoring approach
- [ ] Exit Interview → Keep basic or add core scoring
- [ ] Onboarding Check-In → Core-only scoring

### Phase 5: Validation (TMPL-001e)
- [ ] Create test survey from each template
- [ ] Submit test responses
- [ ] Verify correct dashboard routing
- [ ] Verify scores calculate correctly

---

## Scoring Configuration Schema

For each template that needs scoring, configure:

```typescript
scoreConfig: {
  enabled: true,
  
  // Categories - what dimensions are being measured
  categories: [
    { id: "category-id", name: "Category Display Name" }
  ],
  
  // Score ranges - how to interpret final scores
  scoreRanges: [
    { id: "low", min: 0, max: 39, label: "Needs Attention", color: "#ef4444", interpretation: "..." },
    { id: "moderate", min: 40, max: 69, label: "Developing", color: "#f59e0b", interpretation: "..." },
    { id: "high", min: 70, max: 100, label: "Strong", color: "#22c55e", interpretation: "..." }
  ]
}
```

For each scorable question, configure:
```typescript
question: {
  // ... other fields
  scorable: true,
  scoringCategory: "category-id",
  scoreWeight: 1,
  optionScores: {
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5  // or reversed for negative indicators
  }
}
```

---

## 5D Category Configuration Reference

For templates converting to 5D:

```typescript
categories: [
  { id: "engagement", name: "Engagement Energy" },
  { id: "leadership-effectiveness", name: "Leadership Effectiveness" },
  { id: "psychological-safety", name: "Psychological Safety" },
  { id: "team-wellbeing", name: "Team Wellbeing" },
  { id: "burnout-risk", name: "Burnout Risk" }
]
```

**Important:** Burnout Risk questions must have INVERTED scoring:
```typescript
optionScores: { "1": 5, "2": 4, "3": 3, "4": 2, "5": 1 }  // High answer = low score
```

---

## Acceptance Criteria

1. **All 37 templates reviewed** and categorized
2. **Scoring decisions documented** for each template
3. **5D templates** correctly route to Insight Dimensions Dashboard
4. **Generic scored templates** correctly route to Category Analytics Dashboard
5. **Basic templates** correctly route to Basic Analytics Dashboard
6. **Logic templates** handled appropriately (documented decision)
7. **Test coverage** for at least one template per category

---

## Dependencies

| Ticket | Description | Status |
|--------|-------------|--------|
| ANAL-DASH-010 | Generic Scoring Dashboard | ✅ Implemented |
| ANAL-DASH-020 | Basic Analytics Dashboard | 🔄 In Progress |
| SCORE-002 | Band min/max alignment | ✅ Fixed |

---

## Files to Modify

| File | Changes |
|------|---------|
| Database: `templates` table | Update `score_config` for each template |
| Database: `templates` table | Update `questions` with scoring fields |

---

## Notes

- This is primarily a **data configuration** task, not code changes
- Consider creating a migration script for bulk updates
- May need UI for template creators to configure scoring
- Document the scoring criteria in user-facing help docs

---

**End of Ticket**

