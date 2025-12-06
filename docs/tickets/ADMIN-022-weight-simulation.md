# Ticket ADMIN-022: "What-If" Simulation for Weight Changes (Non-AI v1)

> **Status:** Roadmap  
> **Phase:** Scoring + Indices Refinement  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Intent

Add a simple preview showing how weight adjustments affect historical distributions. Admins can experiment with different weight configurations without affecting production scoring.

---

## In Scope (Allowed)

### UI Component
- Create new component: `<WeightSimulationPanel />`
- Sliders for each dimension weight
- Real-time preview of impact

### Computation
- Compute simulated index scores using modified weights client-side
- Use existing response data
- Show changes in % for each band, e.g.:
  - "Band 3 drops from 42% → 33%"
  - "Average score changes from 67.2 → 71.8"

### Visualization
- Before/after comparison chart
- Band distribution preview
- Impact summary

---

## Out of Scope (Forbidden)

- AI explanations (future ADMIN-023)
- Persisting simulated weights
- Applying changes to production
- Database changes

---

## Acceptance Criteria

- [ ] Simulation appears in index editor
- [ ] Sliders for dimensions update preview instantly (<100ms)
- [ ] Preview does NOT affect production scoring config
- [ ] Clear "Simulation Mode" indicator
- [ ] Reset button to restore original weights
- [ ] Shows impact metrics:
  - [ ] Band distribution changes
  - [ ] Average score change
  - [ ] Affected response count

---

## Technical Notes

### Component Structure
```tsx
<WeightSimulationPanel
  indexId="leadership-effectiveness"
  currentWeights={currentDimensionWeights}
  historicalScores={responseScores}
  onSimulate={(newWeights) => computeSimulation(newWeights)}
/>
```

### Client-Side Computation
```typescript
function computeSimulation(
  responses: ResponseScore[],
  oldWeights: DimensionWeights,
  newWeights: DimensionWeights
): SimulationResult {
  // Recompute scores with new weights
  // Compare band distributions
  // Return delta statistics
}
```

---

## Required Files to Modify

1. `client/src/admin/indices/WeightSimulationPanel.tsx` (new)
2. `client/src/admin/indices/SimulationChart.tsx` (new)
3. `client/src/admin/indices/utils/simulateWeights.ts` (new)
4. `client/src/admin/indices/IndexMappingEditor.tsx` (integrate panel)
5. `docs/BUILD_LOG.md`

---

## Dependencies

- ADMIN-020 (Dimension → Index Mapping) should be complete first
- Historical response data available

---

**End of Ticket**

