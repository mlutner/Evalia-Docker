# Architecture & Implementation Index

A quick reference to architecture notes and implementation logs for Evalia.

## 📋 Project Planning
- **`docs/PROJECT_PLAN.md`** – Master project plan with:
  - Current sprint goals and in-progress work
  - Product roadmap (Publishing, Distribution, Collaboration, Accessibility)
  - Technical roadmap (Validation, Versioning, Hosting, Performance)
  - Differentiators (AI Insights, Benchmarking, Multi-language, Integrations)

## 🎫 Ticketing System
- **`docs/TICKETING_GUIDE.md`** – Standardized ticket format for AI-assisted development
  - Ticket template with scope boundaries
  - Protected zones (files AI must never touch)
  - Example tickets
  - Cursor workflow best practices
- **`docs/tickets/`** – Active ticket files
- **`docs/tickets/completed/`** – Completed ticket archive

### Active Epics

**ADMIN-000: Admin Configuration Panel** (Roadmap)

| Layer | Ticket | Title |
|-------|--------|-------|
| Foundation | MODEL-001 | Scoring Model Registry |
| Dimensional | DIM-010 | Dimension Manager (UI + DB) |
| Dimensional | DIM-015 | Category → Dimension Mapping |
| Index | ADMIN-020 | Dimension → Index Mapping & Weights |
| Index | ADMIN-030 | Index Band Threshold Editor |
| Config | ADMIN-040 | Index Naming / White-Label Settings |
| Config | ADMIN-050 | Interpretation Rules Engine (Phase 1) |
| Internal | ADMIN-060 | Model Validation Console (Dev Tools) |

See `docs/scoring/SCORING_MODEL_OVERVIEW.md` for architecture details.

**Scoring + Indices Refinement** (Roadmap)

| Ticket | Title | Phase |
|--------|-------|-------|
| ADMIN-010 | Research Notes & Dimension Justification | Scoring |
| ADMIN-011 | Editable Band Narratives | Scoring |
| ADMIN-022 | Weight Simulation Panel (Non-AI) | Scoring |
| ADMIN-023 | AI Explanation Layer for Simulations | Scoring |

**AIQ: AI Quality & Assistance** (Roadmap)

| Ticket | Title | Phase |
|--------|-------|-------|
| AIQ-001 | Question Quality Check Button | Builder UX |
| AIQ-003 | AI-Assisted Research Note Generation | Future |
| AIQ-004 | Narrative Auto-Rewrite for Bands | Future |
| AIQ-005 | Question Set Coherence Check | Future |
| AIQ-006 | AI Action Plan Generator (Per Manager) | Future |
| AIQ-007 | Survey Fatigue Advisor | Future |
| AIQ-008 | AI Deck Generator (Consultant White-Label) | Future |

**MULTI: Consultant Mode / Multi-Tenant** (Roadmap)

| Ticket | Title | Phase |
|--------|-------|-------|
| MULTI-001 | Consultant → Org → Survey Hierarchy | Foundation |
| MULTI-003 | AI Portfolio Summary for Consultants | AI Layer |

**ANAL-IA: Analytics Information Architecture** (Completed)

| Ticket | Title | Status |
|--------|-------|--------|
| ANAL-IA-001 | Unified Analytics Information Architecture | ✅ Completed |

**ANAL-QA: Analytics Hardening** (In Progress)

| Ticket | Title | Status |
|--------|-------|--------|
| ANAL-QA-001 | Analytics Hardening Epic | In Progress |
| ANAL-QA-010 | Golden Fixtures & Analytics Unit Tests | Pending |
| ANAL-QA-020 | AnalyticsPage Integration Tests | Pending |
| ANAL-QA-030 | Shared Bands & Dimension Helpers Refactor | Pending |
| ANAL-QA-040 | Analytics Inspector (Dev Only) | Pending |
| ANAL-QA-050 | Confidence/Empty-State Rules | Pending |

---

- **Survey builder & runtime**
  - `docs/BUILD_LOG.md` – ongoing dated log of meaningful changes to survey editing, logic, scoring, and theming.
    - Latest entry (2025-12-09): "Evalia Build Log – Major Update Summary" covering unified rendering, logic V2, scoring V1, results, robustness, testing, templates, and backend prep.
  - `/dev/inspector` (dev builds) – internal dashboard for engines/endpoints/catalog stats.
- **Architecture snapshots**
  - `docs/ARCHITECTURE_SNAPSHOT.md` – condensed summary of AI guardrails, logic v2/v3, scoring, results, builder wiring, and outstanding cleanup items.
- **Logic & scoring**
  - `docs/LOGIC_SCORING_ARCHITECTURE.md` – **Complete audit**: types, data flow, guardrails, identified gaps.
  - `client/src/core/logic/engines.ts` – registry of available logic engines (default `logicEngineV2`, optional `LogicV3`).
  - `client/src/core/scoring/strategies.ts` – registry of scoring engines (active `engagement_v1`).
  - `docs/ARCHITECTURE-SCORING-RESULTS.md` – scoring/results/logic guardrails and runtime notes.
  - `client/src/utils/logicValidator.ts` – graph-based logic validation (cycles, missing targets, conflicts).
  - `client/src/utils/scoringValidator.ts` – band/category validation (gaps, overlaps, usage).
- **AI architecture**
  - `AI_INTEGRATION_COMPLETION_ASSESSMENT.md` – completion evidence for prompt upgrades, validation rules, and model routing.
  - `/dev/inspector` (dev builds) – snapshot of AI endpoints exposed to the builder/runtime flows.
- **Design guidelines**
  - `client/src/COLOR_USAGE_GUIDE.md` – color usage guidance.
  - `client/src/DESIGN_SYSTEM.md` – UI patterns and component guidance.
- **Testing & setup**
  - `TESTING_GUIDE.md` – instructions for running and writing tests.
  - `DATABASE_SETUP.md` – database provisioning steps.

## Architecture Documentation (Primary Reference)
- docs/architecture/overview.md
- docs/architecture/system-architecture.md
- docs/architecture/data-model.md
- docs/architecture/api-map.md
- docs/architecture/process-flows.md
- **docs/scoring/SCORING_MODEL_OVERVIEW.md** – Two-layer scoring architecture (Categories → Dimensions → Indices → Bands)

Update this index when new architecture notes or deep-dive docs are added.
