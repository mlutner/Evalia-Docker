# HARDEN-000: Platform Hardening Sprint (Epic)

## Priority: CRITICAL
## Status: In Progress
## Timeline: 3 Weeks (15 Working Days)
## Category: Platform Stability

---

## Epic Overview

This epic transforms Evalia from "breaks sometimes" to "production-ready for early customers" through systematic hardening of:

1. **Scoring Auto-Wiring** (Week 1) - Templates automatically get valid scoring
2. **Error Handling** (Week 2) - No more white screens or silent failures  
3. **Builder Stability** (Week 3) - Reliable editing experience

---

## Ticket Breakdown

### Week 1: Scoring Auto-Wiring (5 days)

| Ticket | Name | Days | Depends On |
|--------|------|------|------------|
| HARDEN-001 | Survey Health Check Utility | 1 | - |
| HARDEN-002 | Scoring Config Inference | 2 | HARDEN-001 |
| HARDEN-003 | Template Auto-Wire on Load | 1 | HARDEN-002 |
| HARDEN-004 | Publish Validation Gate | 1 | HARDEN-001 |

### Week 2: Error Handling (5 days)

| Ticket | Name | Days | Depends On |
|--------|------|------|------------|
| HARDEN-005 | Global Error Boundaries | 1 | - |
| HARDEN-006 | Analytics Graceful Degradation | 2 | - |
| HARDEN-007 | User-Friendly Empty States | 1 | - |
| HARDEN-008 | Centralized Error Logging | 1 | HARDEN-005 |

### Week 3: Builder Stability (5 days)

| Ticket | Name | Days | Depends On |
|--------|------|------|------------|
| HARDEN-009 | Builder Null Safety Pass | 2 | - |
| HARDEN-010 | Auto-Save & Recovery | 2 | - |
| HARDEN-011 | UI Consistency Polish | 1 | - |

### Week 4: Critical Flow Fixes (6 days)

| Ticket | Name | Days | Depends On |
|--------|------|------|------------|
| HARDEN-012 | Preview Pipeline Fixes | 2 | HARDEN-005 |
| HARDEN-013 | Survey Completion Flow | 2 | HARDEN-005 |
| HARDEN-014 | Builder Design Bugs | 2 | HARDEN-009 |

---

## Success Criteria

After completing this epic:

- [ ] Templates auto-configure scoring on load
- [ ] Invalid surveys cannot be published
- [ ] No white screens on errors - always helpful messages
- [ ] Analytics show graceful empty states, not crashes
- [ ] Builder auto-saves and can recover from crashes
- [ ] UI feels consistent and professional
- [ ] **Survey preview loads reliably**
- [ ] **Survey completion flow works end-to-end**
- [ ] **Builder design bugs are fixed**

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing surveys | All changes are additive, not destructive |
| Regression in scoring | Golden fixture tests run on every change |
| Time overrun | Each ticket is independent, can ship incrementally |

---

## Related Documentation

- [PLATFORM_STATUS_OVERVIEW.md](../PLATFORM_STATUS_OVERVIEW.md)
- [NEXT_SESSION_PRIORITIES.md](../NEXT_SESSION_PRIORITIES.md)
- [DEV_TOOLS.md](../DEV_TOOLS.md)

