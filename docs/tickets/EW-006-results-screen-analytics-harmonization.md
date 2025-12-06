# EW-006: ResultsScreen v2 Harmonization with Analytics Indexing

## Priority: MEDIUM
## Status: Planned
## Category: Scoring Infrastructure

---

## Problem Statement

Currently, analytics bands and results screen bands can theoretically drift. The same score could show different bands in:
- Results screen (respondent view)
- Analytics dashboard (admin view)
- Export reports

This is a small but critical alignment issue.

---

## Requirements

### 1. Unified Band Resolution Strategy

Both results screen and analytics must use the same band resolver:

```typescript
// Single source of truth
import { resolveIndexBand } from "@shared/analyticsBands";

// Used in ResultsScreen
const band = resolveIndexBand(score, indexType);

// Used in Analytics
const band = resolveIndexBand(score, indexType);
```

### 2. Shared Registry of Index Types

```typescript
interface IndexTypeRegistry {
  "engagement-5d": {
    name: "Engagement Index",
    bands: BandDefinition[],
    narratives: NarrativeSet
  },
  "wellbeing": {
    name: "Wellbeing Index",
    bands: BandDefinition[],
    narratives: NarrativeSet
  }
  // ... extensible for future domains
}
```

### 3. Mapping Between Dimension Scores and Results Narratives

```typescript
interface NarrativeMapping {
  bandId: string;
  summaryText: string;
  detailedText: string;
  recommendations: string[];
}
```

---

## Acceptance Criteria

- [ ] Single band resolver used everywhere
- [ ] Index type registry is the source of truth
- [ ] Results screen and analytics show identical bands
- [ ] Narratives tied to specific band definitions
- [ ] Export reports use same band logic
- [ ] Unit tests verify consistency

---

## Implementation Notes

### Files to Modify
- `shared/analyticsBands.ts` - Enhance registry
- `client/src/pages/ResultsPage.tsx` - Use shared resolver
- `client/src/components/analytics/*` - Use shared resolver
- `server/utils/exportService.ts` - Use shared resolver

### Migration
- Audit all band resolution call sites
- Replace with centralized resolver
- Add consistency tests

---

## Related Tickets
- ADMIN-030: Band Threshold Editor
- ANAL-DIM-001: Dimension Leaderboard

