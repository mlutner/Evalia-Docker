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

Update this index when new architecture notes or deep-dive docs are added.
