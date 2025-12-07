# Evalia Dev Tools

> **Status:** Dev-Only  
> **Ticket:** [SCORING-DEBUG]  
> **Last Updated:** 2025-12-06  
> **Purpose:** Documentation for development-only debugging tools

---

## Overview

Evalia includes several development-only tools for debugging and inspecting the application state. These tools are:
- **Only available in development mode** (or when explicitly enabled via env vars)
- **Read-only** - they do NOT modify any data
- **Not exposed to end users** in production builds
- **Use the SAME scoring logic** as production - no separate "debug" algorithms

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DEV TOOLS ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     CLIENT (React/Vite)                      │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │    │
│  │  │  DevInspector│  │  Analytics   │  │  ScoringDebug    │   │    │
│  │  │  /dev/       │  │  Inspector   │  │  Page            │   │    │
│  │  │  inspector   │  │  /dev/       │  │  /dev/scoring-   │   │    │
│  │  │              │  │  analytics-  │  │  debug           │   │    │
│  │  └──────────────┘  │  inspector   │  └────────┬─────────┘   │    │
│  │                    └──────────────┘           │              │    │
│  │                                               │              │    │
│  │  ┌────────────────────────────────────────────┴────────┐    │    │
│  │  │            SurveyDebugPanel (Builder V2)            │    │    │
│  │  │  ┌────────────────────────────────────────────────┐ │    │    │
│  │  │  │  ScoringDebugSection (expandable)              │ │    │    │
│  │  │  │  - Category breakdown                          │ │    │    │
│  │  │  │  - Question contributions                      │ │    │    │
│  │  │  │  - Band matching                               │ │    │    │
│  │  │  └────────────────────────────────────────────────┘ │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  │  Guard: import.meta.env.DEV || VITE_ENABLE_DEV_TOOLS        │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                    │                                  │
│                                    ▼                                  │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     SERVER (Express/Node)                     │    │
│  │                                                               │    │
│  │  POST /api/dev/scoring-trace                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐  │    │
│  │  │  Uses: calculateSurveyScores() from @shared/schema      │  │    │
│  │  │  Uses: resolveIndexBand() from @shared/analyticsBands   │  │    │
│  │  │  Returns: Full calculation trace (per-Q, per-category)  │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                                                               │    │
│  │  Guard: NODE_ENV !== 'production' || ENABLE_DEV_TOOLS        │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## How to Access Dev Tools

### Option 1: Local Development (Recommended)

```bash
# Start the app in development mode
npm run dev
```

In dev mode, you'll automatically see the "Dev Tools" section in the sidebar.

### Option 2: Docker with Dev Tools Enabled

Dev tools can be enabled in Docker builds via environment variables:

**docker-compose.yml:**
```yaml
services:
  app:
    build:
      args:
        VITE_ENABLE_DEV_TOOLS: "true"  # Enable client-side dev tools
    environment:
      - ENABLE_DEV_TOOLS=true          # Enable server-side dev API
```

Or override at runtime:
```bash
docker compose build --build-arg VITE_ENABLE_DEV_TOOLS=true
```

### Environment Variables

| Variable | Scope | Default | Purpose |
|----------|-------|---------|---------|
| `VITE_ENABLE_DEV_TOOLS` | Client (build-time) | `false` | Show dev tools UI in production builds |
| `ENABLE_DEV_TOOLS` | Server (runtime) | `false` | Enable `/api/dev/*` endpoints in production |

---

## Available Dev Tools

### 1. Survey Inspector (`/dev/inspector`)

**Entry Point:** Sidebar → Dev Tools → "Inspector"

**Features:**
- Scoring engines overview (active engine ID: `engagement_v1`)
- Logic engines overview (default: `logicEngineV2`)
- AI endpoints status
- Template stats and canonical tags

**Use Case:** Quick visibility into system engines and endpoint configurations.

**Related to:** 
- `client/src/core/scoring/strategies/` - Scoring engine definitions
- `client/src/core/logic/engines/` - Logic engine definitions

---

### 2. Analytics Inspector (`/dev/analytics-inspector`)

**Entry Point:** Sidebar → Dev Tools → "Analytics Debug"

**Features:**
- Survey selector dropdown
- Raw JSON payloads for all analytics metrics:
  - Participation metrics
  - Index distribution (5D engagement scores)
  - Band distribution (INDEX_BAND_DEFINITIONS)
  - Question summary
  - Manager summary
  - Trends summary
- Derived analytics state and dashboard mode:
  - `5d-insights` - Full 5D dashboard (≥3 canonical categories)
  - `category-analytics` - Generic scoring dashboard
  - `basic` - No scoring, question-level only
- Collapsible sections with copy-to-clipboard

**Use Case:** Debug analytics API responses and verify state derivation logic.

**Related to:**
- `shared/analyticsBands.ts` - INDEX_BAND_DEFINITIONS (canonical band thresholds)
- `client/src/utils/analyticsState.ts` - Dashboard mode derivation
- [ANAL-QA-010] Analytics fixture alignment

---

### 3. Scoring Debug (`/dev/scoring-debug`)

**Entry Point:** 
- Sidebar → Dev Tools → "Scoring Debug"
- Direct URL: `/dev/scoring-debug` or `/dev/scoring-debug/:surveyId`

**Features:**
- Survey and response selector
- **Header Info:**
  - Survey ID and title
  - Response ID (or "most recent")
  - Scoring engine ID
  - Dashboard mode badge (5D vs generic)
- **Category Breakdown Table:**
  - Raw score, max possible, normalized (0-100)
  - Band assignment with color coding
  - Question count per category
- **Question Contributions Table:**
  - Question ID, type, and text
  - Raw answer value
  - `optionScore` mapping (for reverse scoring / Likert)
  - Score contribution and weight
  - Normalized percentage
- **Overall Score:**
  - Final index score
  - Matched band rule: `{ min, max, label }`
- Score configuration display

**API Endpoint:** `POST /api/dev/scoring-trace`

```json
// Request
{
  "surveyId": "survey-123",
  "responseId": "resp-456"  // optional, defaults to most recent
}

// Response
{
  "meta": {
    "surveyId": "survey-123",
    "surveyTitle": "Employee Engagement",
    "responseId": "resp-456",
    "scoringEngineId": "engagement_v1",
    "scoringEnabled": true,
    "timestamp": "2025-12-06T..."
  },
  "config": {
    "enabled": true,
    "categories": [
      { "id": "engagement", "name": "Engagement" },
      { "id": "leadership-effectiveness", "name": "Leadership Effectiveness" },
      { "id": "psychological-safety", "name": "Psychological Safety" },
      { "id": "team-wellbeing", "name": "Team Wellbeing" },
      { "id": "burnout-risk", "name": "Burnout Risk" }
    ],
    "scoreRanges": [
      { "id": "critical", "min": 0, "max": 39, "label": "Critical" },
      { "id": "needs-improvement", "min": 40, "max": 54, "label": "Needs Improvement" },
      { "id": "developing", "min": 55, "max": 69, "label": "Developing" },
      { "id": "effective", "min": 70, "max": 84, "label": "Effective" },
      { "id": "highly-effective", "min": 85, "max": 100, "label": "Highly Effective" }
    ]
  },
  "questions": [
    {
      "questionId": "q1",
      "questionText": "I feel motivated to do my best work",
      "questionType": "likert",
      "category": "engagement",
      "categoryName": "Engagement",
      "rawAnswer": "Strongly Agree",
      "optionScoreUsed": 5,
      "maxPoints": 5,
      "weight": 1,
      "contributionToCategory": 5,
      "normalizedContribution": 100
    }
  ],
  "categories": [
    {
      "categoryId": "engagement",
      "categoryName": "Engagement",
      "rawScore": 45,
      "maxPossibleScore": 50,
      "normalizedScore": 90,
      "bandId": "highly-effective",
      "bandLabel": "Highly Effective",
      "bandColor": "#22c55e",
      "questionCount": 2
    }
  ],
  "overall": {
    "score": 85,
    "bandId": "highly-effective",
    "bandLabel": "Highly Effective",
    "bandColor": "#22c55e",
    "matchedRule": { "id": "highly-effective", "min": 85, "max": 100, "label": "Highly Effective" }
  },
  "errors": []
}
```

**Use Case:** Debug how scores are calculated for a specific response.

**Related to:**
- `shared/schema.ts` → `calculateSurveyScores()` - The SAME function used in production
- `shared/analyticsBands.ts` → `resolveIndexBand()` - Band resolution
- [SCORING-DEBUG] ticket

---

### 4. Survey Debug Panel (Builder V2)

**Entry Point:** In Builder V2, click "Show Survey Debug" button (bottom-right corner)

**Features:**
- Survey state overview (title, status, ID)
- Raw JSON for full survey object
- Score config visualization
- Results/Thank You screen config
- Logic rules summary
- **Scoring Debug section** (expandable):
  - Same calculation trace as standalone page
  - Per-category and per-question breakdowns
  - Requires saved survey with at least one response

**Use Case:** Quick debugging while working in the builder without leaving the page.

---

## Scoring System Reference

### Canonical 5D Categories

The Evalia 5D scoring model uses five insight dimensions:

| Category ID | Name | Description |
|-------------|------|-------------|
| `engagement` | Engagement | Employee motivation and commitment |
| `leadership-effectiveness` | Leadership Effectiveness | Manager performance |
| `psychological-safety` | Psychological Safety | Comfort speaking up |
| `team-wellbeing` | Team Wellbeing | Team health and dynamics |
| `burnout-risk` | Burnout Risk | Risk indicators (reverse-scored) |

### Canonical Band Definitions

From `shared/analyticsBands.ts` → `INDEX_BAND_DEFINITIONS`:

| Band ID | Range | Label | Color | Severity |
|---------|-------|-------|-------|----------|
| `critical` | 0-39 | Critical | #ef4444 | 5 |
| `needs-improvement` | 40-54 | Needs Improvement | #f97316 | 4 |
| `developing` | 55-69 | Developing | #eab308 | 3 |
| `effective` | 70-84 | Effective | #22c55e | 2 |
| `highly-effective` | 85-100 | Highly Effective | #10b981 | 1 |

### Reverse Scoring (optionScores)

For questions where higher answers = lower scores (e.g., burnout risk):

```json
{
  "optionScores": {
    "Strongly Disagree": 5,
    "Disagree": 4,
    "Neutral": 3,
    "Agree": 2,
    "Strongly Agree": 1
  }
}
```

The Scoring Debug tool shows when `optionScoreUsed` is applied vs. raw numeric parsing.

---

## Safety Guarantees

1. **Read-Only:** All dev tools only read data; they never write or modify.

2. **Production Guard:** Dev tools are guarded by:
   - Client: `import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true'`
   - Server: `process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_TOOLS === 'true'`
   - Routes: Dev routes only registered when guard passes

3. **Same Scoring Logic:** The scoring debug uses the exact same calculation logic as production (`calculateSurveyScores`). It does NOT implement separate "debug-only" scoring.

4. **No Forbidden Fields:** Dev tools never emit or persist forbidden runtime fields like `totalScore`, `percentage`, or `band` to survey responses. (Per AI Safety Rules in workspace rules)

---

## Common Debugging Scenarios

| Scenario | Tool | What to Check |
|----------|------|---------------|
| "Why is this survey showing 0 scores?" | Analytics Inspector | `scoreConfig.enabled`, `categories.length` |
| "How was this response scored?" | Scoring Debug | Select survey + response, check trace |
| "What band does a 72% score map to?" | Scoring Debug | Look at `matchedRule` in overall |
| "Why aren't optionScores being applied?" | Scoring Debug | Check `optionScoreUsed` column |
| "Is the survey missing categories?" | Survey Debug Panel | Score Config section |
| "Why does burnout show high score for 'Agree'?" | Scoring Debug | Check if `optionScores` has reverse mapping |
| "Which dashboard mode will show?" | Analytics Inspector | Check derived state → `dashboardMode.mode` |

---

## Adding New Dev Tools

When adding new dev tools:

1. **Guard with environment checks:**
   ```tsx
   // Client - use helper or inline check
   const shouldShowDevTools = () => {
     return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
   };
   
   if (!shouldShowDevTools()) return null;
   
   // Server
   const devToolsEnabled = process.env.NODE_ENV !== 'production' || 
                           process.env.ENABLE_DEV_TOOLS === 'true';
   if (!devToolsEnabled) {
     return res.status(403).json({ error: 'Not available in production' });
   }
   ```

2. **Register routes conditionally:**
   ```typescript
   // server/routes/index.ts
   const devToolsEnabled = process.env.NODE_ENV !== 'production' || 
                           process.env.ENABLE_DEV_TOOLS === 'true';
   if (devToolsEnabled) {
     app.use('/api/dev', devRoutes);
   }
   ```

3. **Add to sidebar navigation:**
   ```tsx
   // client/src/components/AppSidebar.tsx
   {(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true') && (
     <button onClick={() => handleNavigation('/dev/new-tool')}>
       New Tool
     </button>
   )}
   ```

4. **Document in this file!**

---

## Related Files

| Purpose | File |
|---------|------|
| Survey Debug Panel | `client/src/components/builder-v2/SurveyDebugPanel.tsx` |
| Scoring Debug Section | `client/src/components/builder-v2/ScoringDebugSection.tsx` |
| Scoring Debug Page | `client/src/pages/dev/ScoringDebugPage.tsx` |
| Analytics Inspector | `client/src/pages/dev/AnalyticsInspectorPage.tsx` |
| Dev Inspector | `client/src/pages/DevInspector.tsx` |
| Dev Scoring API | `server/routes/devScoring.ts` |
| Route Registration | `server/routes/index.ts` |
| Sidebar Navigation | `client/src/components/AppSidebar.tsx` |
| App Routes | `client/src/App.tsx` |
| Band Definitions | `shared/analyticsBands.ts` |
| Score Calculation | `shared/schema.ts` → `calculateSurveyScores()` |
| Analytics State | `client/src/utils/analyticsState.ts` |

---

## Changelog

- **2025-12-06:** [SCORING-DEBUG] Added Scoring Debug Panel and `/api/dev/scoring-trace` endpoint
  - Per-question and per-category score breakdowns
  - Integration with Survey Debug Panel in Builder V2
  - Standalone page at `/dev/scoring-debug`
  - Docker support via `VITE_ENABLE_DEV_TOOLS` and `ENABLE_DEV_TOOLS` env vars
