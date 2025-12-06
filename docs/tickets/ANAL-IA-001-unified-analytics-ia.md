# Ticket ANAL-IA-001: Unified Analytics Information Architecture

> **Status:** Completed  
> **Phase:** Analytics UX  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Goal

Restructure the analytics UI into the new 7-section Information Architecture:

1. **Insights Home**
2. **Dimensions**
3. **Managers**
4. **Trends**
5. **Questions**
6. **Responses**
7. **Benchmarks**

Move existing components into their correct sections and update routing/tab layout accordingly.

**This is a structural IA refactor only. No backend logic changes. No metric ID changes.**

---

## Files to Modify

### Primary
- `client/src/pages/AnalyticsPage.tsx`

### Secondary (structure only, DO NOT edit internals)
- `client/src/components/analytics/index.ts`
- `client/src/components/analytics/*`
- `client/src/legacy/LegacyAnalyticsPage.tsx` (ONLY to update a comment reference)
- `docs/ANALYTICS_UI_DESIGN.md` (update navigation section)
- `docs/BUILD_LOG.md`

---

## Required UI Changes

### Replace existing tabs with 7-section IA

```tsx
<TabsList>
  <TabsTrigger value="insights-home">Insights Home</TabsTrigger>
  <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
  <TabsTrigger value="managers">Managers</TabsTrigger>
  <TabsTrigger value="trends">Trends</TabsTrigger>
  <TabsTrigger value="questions">Questions</TabsTrigger>
  <TabsTrigger value="responses">Responses</TabsTrigger>
  <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
</TabsList>
```

### Tab Content Mapping

| Tab Name | Content (Existing Components) |
|----------|-------------------------------|
| Insights Home | ParticipationMetricsCard, IndexDistributionChart, BandDistributionChart |
| Dimensions | Domain/Index distribution placeholders (ANAL-004/005) |
| Managers | ManagerComparisonTable (ANAL-007) |
| Trends | Placeholder |
| Questions | QuestionSummaryTable (ANAL-006) |
| Responses | Legacy Response Browser structure (placeholder for now) |
| Benchmarks | Placeholder for future work |

### Version Selector
- Keep the `VersionSelector` in the analytics header (top right)
- It must remain visible across ALL tabs

### Component Relocation
- Move `QuestionSummaryTable` from Domains tab → **Questions** tab
- Keep `ParticipationMetricsCard` in **Insights Home** only
- Keep `IndexDistributionChart` and `BandDistributionChart` in **Insights Home** AND **Dimensions**
- Keep `ManagerComparisonTable` in **Managers** tab
- Add placeholders for remaining tabs using `AnalyticsPlaceholderCard`

---

## Code Boundaries (DO NOT TOUCH)

### 🚫 Do NOT modify:
- Any logic/scoring code
- Any analytics computation in `server/utils/analytics.ts`
- Any metric IDs or enums in `shared/analytics.ts`
- Any hook internals (`useParticipationMetrics`, `useIndexDistribution`, etc.)

### 🚫 Do NOT rename existing components
Only reposition them.

### 🚫 Do NOT delete legacy analytics files
They remain for backward compatibility.

---

## Documentation Requirements

### Update `docs/BUILD_LOG.md`
Add entry:
```
"ANAL-IA-001 — Analytics information architecture implemented (new tab structure, component relocation, version selector global, placeholders added)."
```

### Update `docs/ANALYTICS_UI_DESIGN.md`
Replace old tab layout with 7-section IA.

---

## Acceptance Criteria

- [x] Tabs reflect the 7-section IA
- [x] Existing analytics components render in correct sections
- [x] No UI regression in existing charts
- [x] VersionSelector remains global
- [x] No backend logic touched
- [x] No metric ID changes
- [x] No TypeScript or runtime errors
- [x] BUILD_LOG updated
- [ ] DESIGN doc updated (optional)

---

## Dependencies

- ANAL-004 (Index Distribution) ✅
- ANAL-005 (Band Distribution) ✅
- ANAL-006 (Question Summary) ✅
- ANAL-007 (Manager Comparison) ✅

---

**End of Ticket**

