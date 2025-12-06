# ADMIN-100 – Scoring Admin Control Plane (Phase 1 – Read-Only)

> **Type:** Epic  
> **Status:** Roadmap  
> **Phase:** Admin Configuration / Scoring Model  
> **Owner:** Platform / Architecture  
> **Created:** 2025-12-05

---

## 1. Intent

Create a **read-only Scoring Admin Control Plane** that exposes the current scoring model (indices, dimensions, categories, bands, and survey mappings) in a single, system-wide view.

**Goal:**  
Give architects and admins a trustworthy, centralized view of *how scoring actually works today* across all surveys — **without** yet allowing edits or changing runtime behavior.

This is the **control tower**, not the cockpit, for Phase 1.

---

## 2. Hard Dependencies (MUST be completed first)

Do **not** start ADMIN-100 until all of the following are done and stable:

### Analytics Core + QA

| Ticket | Description | Status |
|--------|-------------|--------|
| `ANAL-004` | Score Distribution | ✅ Complete |
| `ANAL-005` | Band Distribution | ✅ Complete |
| `ANAL-006` | Question Summary Table | ✅ Complete |
| `ANAL-007` | Manager Comparison | ✅ Complete |
| `ANAL-008` | Dimension Trends | ✅ Complete |
| `ANAL-009` | Before/After Comparison | ✅ Complete |
| `ANAL-IA-001` | Unified Analytics IA (7-tab) | ✅ Complete |
| `ANAL-DIM-001` | Dimension Leaderboard | ✅ Complete |

### Analytics Quality

| Ticket | Description | Status |
|--------|-------------|--------|
| `ANAL-QA-010` | Golden Fixtures & Unit Tests | ✅ Complete |
| `ANAL-QA-030` | Shared Helpers Refactor | ✅ Complete |
| `ANAL-QA-050` | Confidence / Empty-State Rules | ✅ Complete |
| `ANAL-QA-020` | AnalyticsPage Integration Tests | ✅ Complete |
| `ANAL-QA-040` | Analytics Inspector (Dev) | ✅ Complete |

### Scoring & Model

| Ticket | Description | Status |
|--------|-------------|--------|
| `SCORE-001` | Config Versioning | ✅ Complete |
| `SCORE-002` | Band min/max Alignment | ✅ Complete |
| `MODEL-001` | Scoring Model Registry | 🔴 **BLOCKER** - Must be defined |

### Dashboards

| Ticket | Description | Status |
|--------|-------------|--------|
| `ANAL-DASH-010` | Generic Scoring Dashboard | ✅ Complete |
| `ANAL-DASH-020` | Basic Analytics Dashboard | ✅ Complete |

### Template Configuration

| Ticket | Description | Status |
|--------|-------------|--------|
| `TMPL-001` | Template Scoring Configuration | 🟡 Pending |

⚠️ **Rule:** ADMIN-100 must not introduce *any* scoring or analytics logic changes. It is strictly a read-only surface over existing, tested behavior.

---

## 3. Scope (Phase 1 – Read-Only Only)

### 3.1 Scoring Model Overview (Global)

New route: `/admin/scoring`

**Indices Table:**
- id, label, description
- "Flagship / Experimental" badges (if already modeled)
- Count of dimensions and surveys using each index (derived)

**Dimensions per Index:**
- id, label, description
- Parent index
- Count of categories mapped to each dimension

Data source: `MODEL-001` registry + existing measurement model docs / code.

---

### 3.2 Category → Dimension Mapping View

Table of all **scoring categories** (canonical taxonomy):

| Column | Description |
|--------|-------------|
| `categoryId` | Unique identifier |
| label | Display name |
| mapped `dimensionId` | Parent dimension |
| mapped `indexId` | Derived via dimension |
| Survey count | Number of surveys using this category |

**Filters:**
- By dimension
- By index
- By "in use / unused"

All **read-only**. No editing in this phase.

---

### 3.3 Bands & Thresholds Viewer

For each **index** (and/or dimension):

**Band List:**
| Field | Description |
|-------|-------------|
| `bandId` | Unique identifier |
| label | Display name |
| severity | low / moderate / high / critical |
| `min` / `max` | Threshold range |

**Visual:**
- 0–100 bar segmented by bands (purely informational)

**Warnings (displayed but not fixable):**
- ⚠️ Gaps in coverage
- ⚠️ Overlaps
- ⚠️ Out-of-order bands

Source of truth: `INDEX_BAND_DEFINITIONS` from `shared/analyticsBands.ts`

---

### 3.4 Survey → Model Mapping

Survey-centric view:

**Survey Table:**
| Column | Description |
|--------|-------------|
| `surveyId` | Unique identifier |
| title | Survey name |
| `scoringEngineId` | Engine used |
| `scoreConfigVersion` | From `score_config_versions` |
| Mode badge | `insight-dimensions` / `generic-scoring` / `basic` |
| Response count | Number of responses |

**Survey Detail Pane (on row click):**
- Categories used + their mapped dimensions
- Band set in use (global vs overridden)
- Current `scoreConfig` snapshot (read-only JSON viewer)

This view must **only read existing data** – no mutation.

---

### 3.5 Dev Inspector Integration

Extend `/dev/analytics-inspector` with a **"Scoring Model Snapshot"**:

**Raw dump of:**
- indices
- dimensions
- categories
- bands
- survey → scoringEngineId → score_config_version linkage

Purpose: debugging and cross-checking that the Admin Panel UI is faithful to the actual runtime structures.

---

## 4. Out of Scope (Explicitly NOT allowed in ADMIN-100)

These are **future tickets**, not part of this epic:

| Action | Deferred To |
|--------|-------------|
| Editing bands (`min`/`max`/label/severity) | `ADMIN-130` |
| Editing category → dimension mapping | `DIM-015` |
| Creating/updating indices or dimensions | `MODEL-00x` |
| Changing `scoringEngineId` or scoreConfig | Future |
| AI-generated changes to scoring fields | **FORBIDDEN** |

**AI-Forbidden Fields:**
- `scoreWeight`
- `optionScores`
- `totalScore`
- `percentage`
- `band`
- `scoringEngineId`

ADMIN-100 is **observability only**, no write operations.

---

## 5. Acceptance Criteria

### Route & Access
- [ ] New `/admin/scoring` route accessible to **admin/dev users only**
- [ ] Protected behind authentication

### Data Display
- [ ] Indices / dimensions / categories / bands all visible
- [ ] Consistent with `MODEL-001` registry
- [ ] Every category shows its mapped dimension
- [ ] Every category shows count of surveys using it
- [ ] Every band config shown matches what scoring & analytics use today

### Survey Detail
- [ ] Survey detail view shows scoring mode
- [ ] Survey detail view shows scoring engine
- [ ] Survey detail view shows active scoreConfigVersion
- [ ] Survey detail view shows categories used and their dimension mappings

### Safety
- [ ] No new writes to DB from this UI (read-only verified)
- [ ] No changes to analytics outputs in tests
- [ ] All existing tests still pass (71+)
- [ ] No new scoring logic paths introduced

### Dev Tools
- [ ] `/dev/analytics-inspector` has "Scoring Model Snapshot" section

---

## 6. Implementation Notes

### Phase Constraint

ADMIN-100 is **Phase 1 – Read-Only**.

Future phases should be captured as separate tickets:
- `ADMIN-130` – Band Threshold Editor (Write)
- `DIM-015` – Category → Dimension Mapping Editor
- `ADMIN-140` – Model Version Publishing & Diff View

### Testing

At least one integration test confirming `/admin/scoring` renders correctly for:
- A 5D insight survey
- A generic-scoring survey
- A basic (no-scoring) survey

Snapshot tests allowed here, since UI is read-only and structural.

### Guardrails

- If registry or mappings are missing/inconsistent, show **explicit error states**
- Don't silently hide sections
- No "fallback" scoring or hidden defaults at UI layer

---

## 7. UI Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  Scoring Admin Control Plane                        [Read-Only]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─── Indices ─────────────────────────────────────────────────┐   │
│  │  ┌────────────────────┬────────────┬─────────┬───────────┐  │   │
│  │  │ Index              │ Dimensions │ Surveys │ Status    │  │   │
│  │  ├────────────────────┼────────────┼─────────┼───────────┤  │   │
│  │  │ Evalia Insight 5D  │ 5          │ 12      │ Flagship  │  │   │
│  │  │ Generic Scoring    │ —          │ 8       │ Active    │  │   │
│  │  └────────────────────┴────────────┴─────────┴───────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─── Bands (Evalia Insight 5D) ───────────────────────────────┐   │
│  │  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]  │   │
│  │   Critical   Low      Moderate    Good        Excellent     │   │
│  │   0-20       21-40    41-60       61-80       81-100        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─── Categories ──────────────────────────────────────────────┐   │
│  │  Filter: [All Dimensions ▼] [All Indices ▼] [In Use Only □] │   │
│  │  ┌────────────────────┬───────────────────┬─────────┐       │   │
│  │  │ Category           │ Dimension         │ Surveys │       │   │
│  │  ├────────────────────┼───────────────────┼─────────┤       │   │
│  │  │ engagement         │ Engagement Energy │ 8       │       │   │
│  │  │ burnout-risk       │ Burnout Risk      │ 6       │       │   │
│  │  │ psychological-...  │ Psych Safety      │ 7       │       │   │
│  │  └────────────────────┴───────────────────┴─────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─── Surveys ─────────────────────────────────────────────────┐   │
│  │  ┌────────────────────────────┬──────────────┬───────────┐  │   │
│  │  │ Survey                     │ Mode         │ Responses │  │   │
│  │  ├────────────────────────────┼──────────────┼───────────┤  │   │
│  │  │ 5D Smoke Test              │ 5D Insight   │ 142       │  │   │
│  │  │ Turnover Risk              │ Category     │ 23        │  │   │
│  │  │ Quick Feedback             │ Basic        │ 89        │  │   │
│  │  └────────────────────────────┴──────────────┴───────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Files to Create

| File | Purpose |
|------|---------|
| `client/src/pages/admin/ScoringAdminPage.tsx` | Main admin page |
| `client/src/components/admin/IndicesTable.tsx` | Indices overview |
| `client/src/components/admin/BandsViewer.tsx` | Band visualization |
| `client/src/components/admin/CategoriesTable.tsx` | Category mappings |
| `client/src/components/admin/SurveysTable.tsx` | Survey → model view |
| `client/src/components/admin/SurveyDetailPane.tsx` | Detail pane |
| `server/routes/admin.ts` | Admin API endpoints |

---

**End of Ticket**

