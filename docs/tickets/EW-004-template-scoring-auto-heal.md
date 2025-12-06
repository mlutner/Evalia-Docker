# EW-004: Template Scoring Auto-Heal / Auto-Repair Pass

## Priority: HIGH
## Status: Planned
## Category: Template Infrastructure

---

## Problem Statement

When loading a template (AI-generated, seeded, or imported), scoring configuration issues can silently break analytics. We need automatic detection and repair of common issues.

**This is important** - prevents analytics from being brittle when new templates are created.

---

## Auto-Detectable Issues

### 1. Missing `scoringCategory`
- **Detection**: Question has `scorable: true` but no `scoringCategory`
- **Auto-fix**: Infer from question content or prompt user

### 2. Missing `optionScores`
- **Detection**: Likert/rating question missing score values
- **Auto-fix**: Generate default 1-5 scale

### 3. Reversed Likert
- **Detection**: optionScores descending when text suggests ascending
- **Auto-fix**: Reverse the scores with confirmation

### 4. Invalid Categories
- **Detection**: scoringCategory references non-existent category
- **Auto-fix**: Add category to config or prompt user

### 5. Bands Missing
- **Detection**: scoreConfig.enabled but no bands defined
- **Auto-fix**: Apply default band configuration

### 6. ResultsScreen Not Defined
- **Detection**: Survey has scoring but no results screen
- **Auto-fix**: Add default results screen configuration

---

## Implementation

### Auto-Heal Pipeline

```typescript
interface AutoHealResult {
  fixed: AutoHealFix[];
  warnings: AutoHealWarning[];
  errors: AutoHealError[]; // Unfixable issues
}

function autoHealScoringConfig(survey: Survey): AutoHealResult {
  const fixes: AutoHealFix[] = [];
  
  // 1. Fix missing optionScores
  // 2. Fix missing scoringCategory  
  // 3. Fix invalid category references
  // 4. Fix missing bands
  // 5. Fix missing resultsScreen
  
  return { fixed: fixes, warnings: [], errors: [] };
}
```

### User Notification

- Show banner: "X scoring issues automatically fixed"
- Allow undo within session
- Log fixes to audit trail

---

## Acceptance Criteria

- [ ] Auto-detects all 6 issue types
- [ ] Auto-fixes where safe (no destructive changes)
- [ ] Shows user what was fixed
- [ ] Provides undo capability
- [ ] Works for AI-generated templates
- [ ] Works for imported templates
- [ ] Works for seeded templates
- [ ] Logs all fixes for debugging

---

## Implementation Notes

### Files to Create/Modify
- `shared/utils/autoHealScoring.ts` - New healing logic
- `server/routes/templates.ts` - Apply on import
- `client/src/hooks/useTemplateLoader.ts` - Apply on load
- `client/src/components/builder-v2/AutoHealBanner.tsx` - UI notification

### Safety Rules
- Never delete user data
- Always log what was changed
- Require confirmation for ambiguous fixes
- Preserve original config as backup

---

## Related Tickets
- EW-003: Scoring Config Validator v2
- TMPL-001: Template Scoring Configuration

