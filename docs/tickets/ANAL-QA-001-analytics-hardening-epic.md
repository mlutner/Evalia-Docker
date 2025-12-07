# EPIC: ANAL-QA-001 – Analytics Hardening Pass

> **Status:** In Progress  
> **Phase:** Quality Assurance  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Intent

Pause "new shiny" features for one cycle. Focus entirely on:
- **Stability** – No regressions, no silent failures
- **Correctness** – Prove the numbers are mathematically correct
- **Guardrails** – Centralize logic, prevent drift

**No net-new UX, only hardening.**

---

## Subtickets

| Ticket | Title | Status |
|--------|-------|--------|
| ANAL-QA-010 | Golden Fixtures & Analytics Unit Tests | Pending |
| ANAL-QA-020 | AnalyticsPage Integration Tests | Pending |
| ANAL-QA-030 | Shared Bands & Dimension Helpers Refactor | Pending |
| ANAL-QA-040 | Analytics Inspector (Dev Only) | Pending |
| ANAL-QA-050 | Confidence/Empty-State Rules | Pending |

---

## What This Epic Does NOT Include

🚫 New analytics metrics  
🚫 New UI components or tabs  
🚫 New backend endpoints  
🚫 New visualizations  

---

## Success Criteria

- [ ] All analytics helpers have unit tests with golden fixtures
- [ ] AnalyticsPage has integration tests for tab/component wiring
- [ ] All charts use shared `resolveIndexBand()` helper (no local band logic)
- [ ] Dev-only Analytics Inspector at `/dev/analytics-inspector`
- [ ] Clear empty-state messaging when data is insufficient
- [ ] No regressions in existing analytics functionality

---

## Rationale

Before adding Dimension Leaderboard data, Responses browser, Benchmarks, etc., we need to trust that:

1. **The numbers are correct** – We can prove average scores, trends, and band assignments are mathematically accurate
2. **The UI wires up correctly** – Each tab shows the right components, states propagate
3. **There's no silent drift** – Band thresholds and dimension IDs are centralized

This is a one-cycle investment that pays dividends every time analytics is touched.

---

**End of Epic**

