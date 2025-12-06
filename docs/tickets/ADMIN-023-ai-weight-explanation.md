# Ticket ADMIN-023: AI Explanation Layer for Weight Simulations

> **Status:** Roadmap  
> **Phase:** Scoring + Indices Refinement  
> **Priority:** Low  
> **Created:** 2025-12-06

---

## Intent

Add natural-language explanation generator for admins when simulating weight changes. AI provides context on why changes matter and potential risks.

---

## In Scope (Allowed)

### Backend Endpoint
- `POST /api/ai/weight_explanation`
- Input:
  ```typescript
  {
    oldWeights: DimensionWeights;
    newWeights: DimensionWeights;
    statsContext: {
      oldDistribution: BandDistribution;
      newDistribution: BandDistribution;
      responseCount: number;
      indexType: string;
    };
  }
  ```
- Output:
  ```typescript
  {
    summary: string;
    risks: string[];
    recommendations: string[];
  }
  ```

### UI Integration
- Sidebar panel that displays explanation
- "Why this matters" narrative
- Risk indicators
- Suggested next steps

---

## Out of Scope (Forbidden)

- Auto-applying recommendations
- Vendor-facing reports
- Persistent storage of explanations
- Changes to scoring engine

---

## Acceptance Criteria

- [ ] Explanations generated within 1–3 seconds
- [ ] Admin sees "Why this matters" narrative
- [ ] Risks clearly highlighted
- [ ] Recommendations are actionable
- [ ] Graceful handling of AI timeouts
- [ ] Loading state during generation

---

## Technical Notes

### AI Prompt Structure
```
You are an I/O psychology expert analyzing weight changes in an employee engagement index.

Current weights: {oldWeights}
Proposed weights: {newWeights}

Statistical impact:
- Band distribution change: {distributionDelta}
- Response count: {responseCount}

Explain:
1. A brief summary of what this change means
2. Any risks or concerns
3. Recommendations for the admin
```

### Response Format
```json
{
  "summary": "Increasing the Leadership Clarity weight from 0.2 to 0.35 will emphasize...",
  "risks": [
    "May inflate scores for teams with strong managers but weak systems",
    "Historical comparisons will be less meaningful"
  ],
  "recommendations": [
    "Consider running a pilot with one department first",
    "Document the rationale for this change"
  ]
}
```

---

## Required Files to Modify

1. `server/routes/ai.ts` (add endpoint)
2. `server/services/aiService.ts` (add explanation function)
3. `client/src/admin/indices/WeightExplanationPanel.tsx` (new)
4. `client/src/admin/indices/WeightSimulationPanel.tsx` (integrate)
5. `docs/BUILD_LOG.md`

---

## Dependencies

- ADMIN-022 (Weight Simulation Panel) must be complete first
- Existing AI service infrastructure

---

**End of Ticket**

