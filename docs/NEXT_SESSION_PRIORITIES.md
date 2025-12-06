# Next Session Priorities

**Last Updated:** December 6, 2025

This document outlines the prioritized ticket order for the next development session.

---

## 🔴 Priority 1: Critical Path (Do First)

These tickets prevent broken templates from reaching production.

| Ticket | Name | Why Critical |
|--------|------|--------------|
| **EW-003** | Scoring Config Validator v2 | Golden tests revealed validation gaps - templates can silently break |
| **EW-004** | Template Scoring Auto-Heal | Prevents brittle analytics when new templates created |
| **EW-009** | Template → Analytics Contract Tests | CI guard against broken templates |

**Estimated Time:** 1-2 sessions

---

## 🟠 Priority 2: Structural Alignment (Do Next)

These tickets prevent drift and confusion between components.

| Ticket | Name | Why Important |
|--------|------|---------------|
| **EW-005** | Template Dashboard Mode Classification | Prevents wrong dashboards by mistake |
| **EW-006** | ResultsScreen v2 Harmonization | Ensures consistency between results and analytics |
| **EW-007** | Analytics Data Completeness Checker | Maintenance utility for complex analytics |

**Estimated Time:** 1 session

---

## 🟡 Priority 3: Polish & Quality (Do When Stable)

These tickets improve user experience but aren't blocking.

| Ticket | Name | Why Nice |
|--------|------|----------|
| **EW-008** | Analytics UX Polish | UI consistency across analytics |

**Estimated Time:** 0.5 session

---

## 🔵 Priority 4: Future Infrastructure (Backlog)

These are structural gaps to capture, but don't implement yet.

| Ticket | Name | When Needed |
|--------|------|-------------|
| **INFRA-001** | Scoring Engine Registry | When adding new scoring domains |
| **INFRA-002** | Scoring Model Migrations | When changing global model definitions |
| **INFRA-003** | Analytics Caching/Performance | When hitting scale limits |

**Status:** Documented for future reference. Do NOT implement yet.

---

## Suggested Session Plan

### Session 1: Validation Foundation
1. ✅ Complete EW-003 (Scoring Config Validator v2)
2. Start EW-004 (Auto-Heal)

### Session 2: Auto-Heal & Testing
1. Complete EW-004 (Auto-Heal)
2. Complete EW-009 (Contract Tests)

### Session 3: Alignment
1. EW-005 (Dashboard Mode)
2. EW-006 (ResultsScreen Harmonization)
3. EW-007 (Completeness Checker)

### Session 4: Polish
1. EW-008 (UX Polish)
2. Review and close any remaining issues

---

## Quick Reference: File Locations

```
docs/tickets/
├── EW-003-scoring-config-validator-v2.md
├── EW-004-template-scoring-auto-heal.md
├── EW-005-template-dashboard-mode-classification.md
├── EW-006-results-screen-analytics-harmonization.md
├── EW-007-analytics-data-completeness-checker.md
├── EW-008-analytics-ux-polish.md
├── EW-009-template-analytics-contract-tests.md
├── INFRA-001-scoring-engine-registry.md
├── INFRA-002-scoring-model-migrations.md
└── INFRA-003-analytics-caching-performance.md
```

---

## Dependencies

```
EW-003 ─┬─► EW-004 (validator needed for auto-heal)
        └─► EW-009 (validator logic reused in tests)

EW-005 ─► ANAL-DASH-001 (mode needed for dashboards)

EW-006 ─► ADMIN-030 (harmonization needs band editor)
```

