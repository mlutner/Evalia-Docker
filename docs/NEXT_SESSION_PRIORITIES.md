# Next Session Priorities

**Last Updated:** December 6, 2025

---

## 🔴 IMMEDIATE PRIORITY: Hardening Sprint (3 Weeks)

Before ANY new features, complete the hardening sprint to make the platform production-ready.

### Week 1: Scoring Auto-Wiring (5 days)

| # | Ticket | Name | Est. | Status |
|---|--------|------|------|--------|
| 1 | HARDEN-001 | Survey Health Check Utility | 1 day | Ready |
| 2 | HARDEN-002 | Scoring Config Inference | 2 days | Ready |
| 3 | HARDEN-003 | Template Auto-Wire on Load | 1 day | Ready |
| 4 | HARDEN-004 | Publish Validation Gate | 1 day | Ready |

**Goal:** Templates automatically get valid scoring. Users can't publish broken surveys.

### Week 2: Error Handling (5 days)

| # | Ticket | Name | Est. | Status |
|---|--------|------|------|--------|
| 5 | HARDEN-005 | Global Error Boundaries | 1 day | Ready |
| 6 | HARDEN-006 | Analytics Graceful Degradation | 2 days | Ready |
| 7 | HARDEN-007 | User-Friendly Empty States | 1 day | Ready |
| 8 | HARDEN-008 | Centralized Error Logging | 1 day | Ready |

**Goal:** No white screens. Every error shows helpful recovery UI.

### Week 3: Builder Stability (5 days)

| # | Ticket | Name | Est. | Status |
|---|--------|------|------|--------|
| 9 | HARDEN-009 | Builder Null Safety Pass | 2 days | Ready |
| 10 | HARDEN-010 | Auto-Save & Recovery | 2 days | Ready |
| 11 | HARDEN-011 | UI Consistency Polish | 1 day | Ready |

**Goal:** Builder doesn't crash. Auto-saves prevent data loss. UI feels polished.

### Week 4: Critical Flow Fixes (6 days)

| # | Ticket | Name | Est. | Status |
|---|--------|------|------|--------|
| 12 | HARDEN-012 | Preview Pipeline Fixes | 2 days | Ready |
| 13 | HARDEN-013 | Survey Completion Flow | 2 days | Ready |
| 14 | HARDEN-014 | Builder Design Bugs | 2 days | Ready |

**Goal:** Preview works reliably. Survey completion works end-to-end. Builder bugs fixed.

---

## After Hardening: Feature Priorities

Only after completing HARDEN-000 epic:

### Priority 1: Scoring Validation (Already Designed)

| Ticket | Name | Why |
|--------|------|-----|
| EW-003 | Scoring Config Validator v2 | Catch config errors before they cause problems |
| EW-004 | Template Scoring Auto-Heal | Fix templates automatically |
| EW-009 | Template Analytics Contract Tests | CI prevents broken templates |

### Priority 2: Structural Alignment

| Ticket | Name | Why |
|--------|------|-----|
| EW-005 | Template Dashboard Mode Classification | Explicit dashboard routing |
| EW-006 | ResultsScreen Harmonization | Consistent bands everywhere |
| EW-007 | Analytics Data Completeness Checker | Maintenance utility |

### Priority 3: Polish

| Ticket | Name | Why |
|--------|------|-----|
| EW-008 | Analytics UX Polish | Professional appearance |

### Backlog (Future)

| Ticket | Name | When |
|--------|------|------|
| INFRA-001 | Scoring Engine Registry | When adding new scoring domains |
| INFRA-002 | Scoring Model Migrations | When changing global models |
| INFRA-003 | Analytics Caching | When hitting scale limits |

---

## Session Workflow

### Starting a Session

1. Open this file
2. Find the next "Ready" ticket
3. Read the ticket's detailed instructions
4. Implement step-by-step
5. Test using the ticket's test instructions
6. Mark complete and commit

### Ticket Completion

```bash
# After completing a ticket
git add .
git commit -m "feat(hardening): [HARDEN-XXX] Brief description"
git push
```

### End of Week

- Run full test suite: `npm test`
- Manual smoke test: Builder, Analytics, Preview
- Update ticket statuses in this file

---

## Quick Reference

### Ticket Locations
```
docs/tickets/
├── HARDEN-000-hardening-sprint-epic.md  ← Start here
├── HARDEN-001-survey-health-check.md
├── HARDEN-002-scoring-config-inference.md
├── HARDEN-003-template-auto-wire.md
├── HARDEN-004-publish-validation-gate.md
├── HARDEN-005-error-boundaries.md
├── HARDEN-006-analytics-graceful-degradation.md
├── HARDEN-007-empty-states.md
├── HARDEN-008-error-logging.md
├── HARDEN-009-builder-null-safety.md
├── HARDEN-010-auto-save-recovery.md
├── HARDEN-011-ui-consistency.md
├── HARDEN-012-preview-pipeline-fixes.md   ← CRITICAL
├── HARDEN-013-survey-completion-flow.md   ← CRITICAL
└── HARDEN-014-builder-design-bugs.md
```

### Key Files to Create (Week 1)
```
shared/utils/surveyHealthCheck.ts
shared/utils/inferScoringConfig.ts
client/src/hooks/useAutoWireScoring.ts
client/src/hooks/usePublishValidation.ts
```

### Dependencies
```
HARDEN-001 → HARDEN-002 → HARDEN-003
HARDEN-001 → HARDEN-004
HARDEN-005 → HARDEN-008
```

---

## Success Metrics

After 4 weeks, Evalia should:

- [ ] Auto-wire scoring for 100% of templates
- [ ] Block publish for invalid configurations
- [ ] Show 0 white screens on any error
- [ ] Auto-save builder changes
- [ ] Recover from crashes with local backup
- [ ] Pass all existing tests
- [ ] Feel polished and professional
- [ ] **Preview loads and works reliably**
- [ ] **Survey completion works end-to-end**
- [ ] **Builder has no major design bugs**
