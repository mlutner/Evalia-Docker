# Analytics UI Design Specification

> **Status:** Complete Specification - Ready for Implementation  
> **Last Updated:** 2025-12-06  
> **Purpose:** Complete design, data model, and component specification for Phase 0 Analytics Dashboard

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Phase 0 Analytics Data Model](#phase-0-analytics-data-model)
3. [Component Library Specification](#component-library-specification)
4. [Layout & Style System](#layout--style-system)
5. [Version-Aware Analytics Rules](#version-aware-analytics-rules)
6. [Error, Loading, and Empty States](#error-loading-and-empty-states)
7. [Page Structure & Navigation](#page-structure--navigation)

---

## Design Principles

1. **Consistency with Builder V2**
   - Match spacing, typography, and color palette
   - Use same panel widths (280px/320px) where applicable
   - Understated, minimal aesthetic (not "AI-built" look)

2. **Card-Based Layout**
   - Each metric/chart in its own card
   - Consistent card styling: `rounded-xl`, subtle shadows
   - Responsive grid system

3. **Version-Aware by Default**
   - All analytics respect score config versions
   - Version selector when multiple versions exist
   - Historical data remains stable

4. **Progressive Disclosure**
   - Overview → Details → Drill-down
   - Tabs for major sections
   - Expandable sections for deeper analysis

5. **Performance First**
   - Lazy load heavy charts
   - Skeleton screens for perceived performance
   - Optimistic updates where safe

---

## Phase 0 Analytics Data Model

### 1. Participation Metrics (ANAL-001)

#### KPIs
- **Total Responses:** Count of all submitted responses
- **Response Rate:** `(totalResponses / totalInvites) * 100` (if invites available)
- **Completion Rate:** `(completedResponses / totalResponses) * 100`
- **Avg Completion Time:** Average `totalDurationMs` across all responses

#### Data Inputs
- `survey_responses` table
- `survey_respondents` table (for invites count, if available)
- Fields: `id`, `surveyId`, `completedAt`, `completionPercentage`, `totalDurationMs`

#### Required Backend Fields
```typescript
interface ParticipationMetricsResponse {
  meta: {
    surveyId: string;
    version?: string; // score config version if applicable
    generatedAt: string; // ISO timestamp
    period?: {
      from: string; // ISO date
      to: string; // ISO date
    };
  };
  data: {
    totalResponses: number;
    totalInvites: number | null; // null if invites not tracked
    completedResponses: number; // completionPercentage >= 80
    responseRate: number | null; // null if invites not available
    completionRate: number; // 0-100
    avgCompletionTimeMinutes: number;
    // Optional trend data (vs previous period)
    trend?: {
      totalResponses: "up" | "down" | "neutral";
      responseRate: "up" | "down" | "neutral";
      completionRate: "up" | "down" | "neutral";
      avgTime: "up" | "down" | "neutral";
    };
  };
}
```

#### Sample JSON
```json
{
  "meta": {
    "surveyId": "586586f4-4089-401f-b4db-72826271dc35",
    "generatedAt": "2025-12-06T10:30:00Z",
    "period": {
      "from": "2025-11-06T00:00:00Z",
      "to": "2025-12-06T23:59:59Z"
    }
  },
  "data": {
    "totalResponses": 142,
    "totalInvites": 200,
    "completedResponses": 128,
    "responseRate": 71,
    "completionRate": 90,
    "avgCompletionTimeMinutes": 4,
    "trend": {
      "totalResponses": "up",
      "responseRate": "up",
      "completionRate": "neutral",
      "avgTime": "down"
    }
  }
}
```

---

### 2. Score Distribution (ANAL-004)

#### KPIs
- **Overall Score Distribution:** Histogram of scores in buckets (0-20, 21-40, 41-60, 61-80, 81-100)
- **Category Score Breakdown:** Average score per category
- **Score Statistics:** Min, Max, Mean, Median, Standard Deviation

#### Data Inputs
- `survey_responses` table
- `score_config_versions` table (for version-specific scoring)
- Response scoring data (computed at submission time)
- Fields: `score_config_version_id`, `answers`, scoring results

#### Required Backend Fields
```typescript
interface ScoreDistributionResponse {
  meta: {
    surveyId: string;
    version: string; // score config version ID
    versionNumber: number;
    generatedAt: string;
  };
  data: {
    overall: {
      buckets: Array<{
        range: string; // "0-20", "21-40", etc.
        min: number;
        max: number;
        count: number;
        percentage: number;
      }>;
      statistics: {
        min: number;
        max: number;
        mean: number;
        median: number;
        stdDev: number;
      };
    };
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      averageScore: number;
      min: number;
      max: number;
      responseCount: number;
    }>;
  };
}
```

#### Sample JSON
```json
{
  "meta": {
    "surveyId": "586586f4-4089-401f-b4db-72826271dc35",
    "version": "eec7029c-34a3-487e-881f-20337204aab7",
    "versionNumber": 1,
    "generatedAt": "2025-12-06T10:30:00Z"
  },
  "data": {
    "overall": {
      "buckets": [
        { "range": "0-20", "min": 0, "max": 20, "count": 5, "percentage": 3.5 },
        { "range": "21-40", "min": 21, "max": 40, "count": 18, "percentage": 12.7 },
        { "range": "41-60", "min": 41, "max": 60, "count": 45, "percentage": 31.7 },
        { "range": "61-80", "min": 61, "max": 80, "count": 52, "percentage": 36.6 },
        { "range": "81-100", "min": 81, "max": 100, "count": 22, "percentage": 15.5 }
      ],
      "statistics": {
        "min": 12,
        "max": 98,
        "mean": 58.3,
        "median": 62,
        "stdDev": 18.7
      }
    },
    "byCategory": [
      {
        "categoryId": "engagement-drivers",
        "categoryName": "Engagement Drivers",
        "averageScore": 65.2,
        "min": 20,
        "max": 95,
        "responseCount": 142
      }
    ]
  }
}
```

---

### 3. Band Distribution (ANAL-005)

#### KPIs
- **Band Count:** Number of responses per band
- **Band Percentage:** Percentage of responses in each band
- **Band Trend:** Change in band distribution over time (optional)

#### Data Inputs
- `survey_responses` table with `score_config_version_id`
- `score_config_versions.config_snapshot.scoreRanges` (band definitions)
- Response scoring results (band assignment at submission)

#### Required Backend Fields
```typescript
interface BandDistributionResponse {
  meta: {
    surveyId: string;
    version: string; // score config version ID
    versionNumber: number;
    generatedAt: string;
  };
  data: {
    bands: Array<{
      bandId: string;
      bandLabel: string;
      color: string; // from scoreConfig
      count: number;
      percentage: number;
      minScore: number;
      maxScore: number;
    }>;
    totalResponses: number;
  };
}
```

#### Sample JSON
```json
{
  "meta": {
    "surveyId": "586586f4-4089-401f-b4db-72826271dc35",
    "version": "eec7029c-34a3-487e-881f-20337204aab7",
    "versionNumber": 1,
    "generatedAt": "2025-12-06T10:30:00Z"
  },
  "data": {
    "bands": [
      {
        "bandId": "highly-engaged",
        "bandLabel": "Highly Engaged",
        "color": "#22c55e",
        "count": 22,
        "percentage": 15.5,
        "minScore": 35,
        "maxScore": 45
      },
      {
        "bandId": "engaged",
        "bandLabel": "Engaged",
        "color": "#84cc16",
        "count": 52,
        "percentage": 36.6,
        "minScore": 25,
        "maxScore": 34
      },
      {
        "bandId": "neutral",
        "bandLabel": "Neutral",
        "color": "#f59e0b",
        "count": 45,
        "percentage": 31.7,
        "minScore": 15,
        "maxScore": 24
      },
      {
        "bandId": "disengaged",
        "bandLabel": "Disengaged",
        "color": "#ef4444",
        "count": 23,
        "percentage": 16.2,
        "minScore": 0,
        "maxScore": 14
      }
    ],
    "totalResponses": 142
  }
}
```

---

### 4. Category Breakdown (ANAL-006 - Extended)

#### KPIs
- **Category Average Score:** Mean score per category
- **Category Response Count:** Number of responses with scores in this category
- **Category Score Range:** Min/max scores per category
- **Category Contribution:** How much each category contributes to overall score

#### Data Inputs
- `survey_responses` with scoring data
- `score_config_versions.config_snapshot.categories`
- Category-level scoring results

#### Required Backend Fields
```typescript
interface CategoryBreakdownResponse {
  meta: {
    surveyId: string;
    version: string;
    versionNumber: number;
    generatedAt: string;
  };
  data: {
    categories: Array<{
      categoryId: string;
      categoryName: string;
      averageScore: number;
      minScore: number;
      maxScore: number;
      responseCount: number;
      weight?: number; // if categories are weighted
      contributionToTotal: number; // percentage contribution
    }>;
  };
}
```

#### Sample JSON
```json
{
  "meta": {
    "surveyId": "586586f4-4089-401f-b4db-72826271dc35",
    "version": "eec7029c-34a3-487e-881f-20337204aab7",
    "versionNumber": 1,
    "generatedAt": "2025-12-06T10:30:00Z"
  },
  "data": {
    "categories": [
      {
        "categoryId": "engagement-drivers",
        "categoryName": "Engagement Drivers",
        "averageScore": 65.2,
        "minScore": 20,
        "maxScore": 95,
        "responseCount": 142,
        "weight": 1.0,
        "contributionToTotal": 28.5
      },
      {
        "categoryId": "psychological-safety",
        "categoryName": "Psychological Safety",
        "averageScore": 58.7,
        "minScore": 15,
        "maxScore": 90,
        "responseCount": 142,
        "weight": 1.0,
        "contributionToTotal": 25.2
      }
    ]
  }
}
```

---

### 5. Question-Level Summary (ANAL-006)

#### KPIs
- **Completion Rate:** Percentage of responses that answered this question
- **Average Value:** Mean value for numeric questions (rating, NPS, likert)
- **Response Distribution:** Frequency of each option for choice questions
- **Skip Rate:** Percentage of responses that skipped this question

#### Data Inputs
- `survey_responses.answers` (questionId → answer mapping)
- `surveys.questions` (question definitions)
- `survey_responses.questionTimings` (optional, for engagement metrics)

#### Required Backend Fields
```typescript
interface QuestionSummaryResponse {
  meta: {
    surveyId: string;
    version?: string; // if question logic changed per version
    generatedAt: string;
  };
  data: {
    questions: Array<{
      questionId: string;
      questionNumber: number; // order in survey
      questionText: string;
      questionType: string;
      completionRate: number; // 0-100
      skipRate: number; // 0-100
      averageValue?: number; // for numeric questions
      medianValue?: number; // for numeric questions
      distribution?: Array<{
        option: string;
        count: number;
        percentage: number;
      }>; // for choice questions
      avgTimeSpentSeconds?: number; // if questionTimings available
    }>;
    totalResponses: number;
  };
}
```

#### Sample JSON
```json
{
  "meta": {
    "surveyId": "586586f4-4089-401f-b4db-72826271dc35",
    "generatedAt": "2025-12-06T10:30:00Z"
  },
  "data": {
    "questions": [
      {
        "questionId": "q1_role_type",
        "questionNumber": 1,
        "questionText": "What is your role?",
        "questionType": "multiple_choice",
        "completionRate": 100,
        "skipRate": 0,
        "distribution": [
          { "option": "I manage 1-5 people", "count": 45, "percentage": 31.7 },
          { "option": "I manage 6+ people", "count": 52, "percentage": 36.6 },
          { "option": "I do not manage others", "count": 45, "percentage": 31.7 }
        ]
      },
      {
        "questionId": "q2_engagement",
        "questionNumber": 2,
        "questionText": "How engaged do you feel?",
        "questionType": "rating",
        "completionRate": 98,
        "skipRate": 2,
        "averageValue": 7.2,
        "medianValue": 7,
        "avgTimeSpentSeconds": 12
      }
    ],
    "totalResponses": 142
  }
}
```

---

## Component Library Specification

### `<MetricStatCard />`

**Purpose:** Display a single metric with optional trend indicator and icon.

**Props:**
```typescript
interface MetricStatCardProps {
  // Required
  label: string;
  value: string | number;
  
  // Optional
  subtext?: string; // Secondary text below value
  icon?: React.ElementType; // Lucide icon component
  iconBg?: string; // Tailwind class for icon background (default: "bg-gray-100")
  trend?: "up" | "down" | "neutral";
  trendValue?: string; // e.g., "+12%", "-5 responses"
  loading?: boolean;
  error?: string | null;
  className?: string;
}
```

**Layout Constraints:**
- Minimum width: `280px` (mobile)
- Padding: `p-5` or `p-6`
- Border radius: `rounded-xl`
- Border: `border border-gray-200`
- Background: `bg-white`

**Behavior:**
- If `loading={true}`, show skeleton (animated shimmer)
- If `error`, show error icon + message (inline, doesn't break layout)
- Trend indicator only shows if `trend !== "neutral"` and `trendValue` provided
- Icon background defaults to `bg-gray-100` if not provided

**Theme Usage:**
- Value color: `text-gray-900`
- Label color: `text-gray-500`
- Trend up: `text-emerald-600`
- Trend down: `text-red-500`
- Icon: `text-gray-700`

**Example:**
```tsx
<MetricStatCard
  label="Total Responses"
  value={142}
  icon={Users}
  iconBg="bg-blue-100"
  trend="up"
  trendValue="+12%"
/>
```

---

### `<BarChart />`

**Purpose:** Display horizontal or vertical bar charts for distributions and comparisons.

**Props:**
```typescript
interface BarChartProps {
  // Required
  data: Array<Record<string, any>>;
  xKey: string; // Key in data object for x-axis
  yKey: string; // Key in data object for y-axis
  
  // Optional
  orientation?: "horizontal" | "vertical"; // default: "vertical"
  color?: string | string[]; // Single color or array for multi-series
  height?: number; // Chart height in px (default: 300)
  showGrid?: boolean; // Show grid lines (default: true)
  showLabels?: boolean; // Show value labels on bars (default: true)
  xAxisLabel?: string;
  yAxisLabel?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}
```

**Layout Constraints:**
- Minimum height: `200px`
- Responsive: Scales with container width
- Padding: Chart area has internal padding (handled by chart library)

**Behavior:**
- If `loading={true}`, show `<AnalyticsSkeleton />` matching chart dimensions
- If `error`, show `<AnalyticsError />` with retry button
- Colors: If array provided, cycle through colors for multi-series
- Default color: `#2F8FA5` (Evalia primary)

**Chart Library:** Recharts (recommended) or Chart.js
- Recharts: Better React integration, TypeScript support
- Chart.js: More features, but requires wrapper component

**Example:**
```tsx
<BarChart
  data={[
    { range: "0-20", count: 5 },
    { range: "21-40", count: 18 }
  ]}
  xKey="range"
  yKey="count"
  orientation="vertical"
  color="#2F8FA5"
  height={300}
/>
```

---

### `<DonutChart />`

**Purpose:** Display donut/pie charts for band distribution and category breakdowns.

**Props:**
```typescript
interface DonutChartProps {
  // Required
  data: Array<Record<string, any>>;
  labelKey: string; // Key for segment label
  valueKey: string; // Key for segment value
  
  // Optional
  colors?: string[]; // Array of colors (one per segment)
  showLegend?: boolean; // Show legend (default: true)
  showPercentages?: boolean; // Show percentages in segments (default: true)
  size?: number; // Chart diameter in px (default: 200)
  innerRadius?: number; // Inner radius for donut (default: 60% of radius)
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}
```

**Layout Constraints:**
- Square aspect ratio (size x size)
- Legend: Positioned below chart (mobile) or to the right (desktop)
- Minimum size: `200px`

**Behavior:**
- Colors: If `colors` array provided, use in order. If not, use default palette.
- Default color palette: Evalia colors + grays
- If segment value is 0, hide segment (don't show empty slices)
- Loading/error states same as BarChart

**Example:**
```tsx
<DonutChart
  data={[
    { band: "Highly Engaged", count: 22, color: "#22c55e" },
    { band: "Engaged", count: 52, color: "#84cc16" }
  ]}
  labelKey="band"
  valueKey="count"
  colors={["#22c55e", "#84cc16", "#f59e0b", "#ef4444"]}
  size={250}
/>
```

---

### `<LineChart />`

**Purpose:** Display time series and trends over time.

**Props:**
```typescript
interface LineChartProps {
  // Required
  data: Array<Record<string, any>>;
  xKey: string; // Time/date key
  yKey: string; // Value key
  
  // Optional
  series?: Array<{ // Multiple series support
    key: string;
    label: string;
    color: string;
  }>;
  height?: number; // Chart height (default: 300)
  showGrid?: boolean; // Show grid lines (default: true)
  showDots?: boolean; // Show data point dots (default: true)
  smooth?: boolean; // Smooth curve (default: false)
  xAxisLabel?: string;
  yAxisLabel?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}
```

**Layout Constraints:**
- Minimum height: `200px`
- Responsive width
- Time axis: Auto-format dates (e.g., "Dec 1", "Dec 6")

**Behavior:**
- Single series: Use `yKey` directly
- Multiple series: Use `series` array, each with its own `key` in data
- Default color: `#2F8FA5`
- Loading/error states same as other charts

**Example:**
```tsx
<LineChart
  data={[
    { date: "2025-12-01", responses: 10 },
    { date: "2025-12-02", responses: 15 }
  ]}
  xKey="date"
  yKey="responses"
  height={250}
/>
```

---

### `<AnalyticsSkeleton />`

**Purpose:** Unified loading skeleton for all analytics components.

**Props:**
```typescript
interface AnalyticsSkeletonProps {
  type: "card" | "chart" | "table" | "metric";
  width?: number | string; // px or Tailwind class
  height?: number | string; // px or Tailwind class
  lines?: number; // For table/card skeletons
  className?: string;
}
```

**Behavior:**
- Shimmer animation: `animate-pulse` with gradient
- Matches final component dimensions
- Preserves layout (doesn't cause shift)

**Patterns:**
- `type="card"`: Rectangular skeleton with rounded corners
- `type="chart"`: Chart-shaped skeleton (bar/line/donut)
- `type="table"`: Multiple rows with columns
- `type="metric"`: Small card with icon + value placeholders

**Example:**
```tsx
<AnalyticsSkeleton type="chart" width="100%" height={300} />
```

---

### `<AnalyticsError />`

**Purpose:** Unified error state for all analytics components.

**Props:**
```typescript
interface AnalyticsErrorProps {
  message?: string; // Custom error message (default: "Failed to load data")
  onRetry?: () => void; // Retry callback
  size?: "sm" | "md" | "lg"; // Icon size (default: "md")
  className?: string;
}
```

**Layout:**
- Centered content
- Icon (AlertCircle) + message + optional retry button
- Doesn't break parent layout (preserves card structure)

**Behavior:**
- If `onRetry` provided, show retry button
- Error message: User-friendly, not technical
- Icon color: `text-red-500`

**Example:**
```tsx
<AnalyticsError
  message="Unable to load participation metrics"
  onRetry={() => refetch()}
/>
```

---

## Layout & Style System

### Grid Structure

**12-Column Grid System:**
- Base: `grid grid-cols-1` (mobile)
- Tablet: `md:grid-cols-2` (768px+)
- Desktop: `lg:grid-cols-3` or `lg:grid-cols-4` (1024px+)
- Gap: `gap-4` (mobile) → `gap-6` (desktop)

**Card Spanning:**
- Full width: `col-span-1 md:col-span-2 lg:col-span-4`
- Half width: `col-span-1 md:col-span-2`
- Third width: `col-span-1 lg:col-span-1` (default)

**Responsive Breakpoints:**
```css
/* Tailwind defaults */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
```

---

### Card Patterns

**Base Card:**
```tsx
<Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
  <CardHeader className="px-5 py-4 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900">
      {title}
    </CardTitle>
    {description && (
      <CardDescription className="text-sm text-gray-500 mt-1">
        {description}
      </CardDescription>
    )}
  </CardHeader>
  <CardContent className="p-5">
    {children}
  </CardContent>
</Card>
```

**Spacing:**
- Card padding: `p-5` (standard) or `p-6` (large cards)
- Header padding: `px-5 py-4`
- Content padding: `p-5`
- Gap between cards: `gap-4` (mobile) → `gap-6` (desktop)

**Typography:**
- Card title: `text-lg font-semibold text-gray-900`
- Card description: `text-sm text-gray-500`
- Section spacing: `space-y-6` between major sections

---

### Chart Color Rules

**Primary Palette:**
- Primary: `#2F8FA5` (Evalia teal)
- Success: `#10B981` (emerald)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)
- Info: `#3B82F6` (blue)

**Band Colors:**
- Use colors directly from `scoreConfig.scoreRanges[].color`
- If color not provided, fall back to palette based on band order:
  1. `#22c55e` (emerald - best)
  2. `#84cc16` (lime - good)
  3. `#f59e0b` (amber - neutral)
  4. `#ef4444` (red - poor)

**Category Colors:**
- Cycle through palette: `#2F8FA5`, `#10B981`, `#F59E0B`, `#3B82F6`, `#8B5CF6` (purple)
- Ensure sufficient contrast for accessibility (WCAG AA)

**Gradient Rules:**
- Use subtle gradients for filled areas (charts)
- Avoid harsh gradients (maintains minimal aesthetic)

---

### Dark Mode Considerations

**Status:** Not implemented in Phase 0, but design should be dark-mode ready.

**Future Considerations:**
- All colors should have dark mode variants
- Use CSS variables for colors (not hardcoded hex)
- Chart libraries should support theme switching
- Text colors: `text-gray-900` → `text-gray-100` (dark mode)
- Background: `bg-white` → `bg-gray-900` (dark mode)
- Borders: `border-gray-200` → `border-gray-700` (dark mode)

**Implementation Note:** Phase 0 uses light mode only. Dark mode will be Phase 1+.

---

## Version-Aware Analytics Rules

### Version Selection Logic

**Default Behavior:**
1. If survey has only one version → Use that version (no selector shown)
2. If survey has multiple versions → Default to latest version (highest `versionNumber`)
3. User can change version via dropdown → Updates all version-aware components

**Version Selector Component:**
```tsx
<VersionSelector
  versions={[
    { id: "v1-id", number: 1, createdAt: "2025-12-01" },
    { id: "v2-id", number: 2, createdAt: "2025-12-05" }
  ]}
  selectedVersion={selectedVersionId}
  onVersionChange={(versionId) => setSelectedVersion(versionId)}
/>
```

**Placement:**
- Header level: Global version selector (affects all charts)
- Card level: Per-card version selector (if different charts need different versions)

**Recommendation:** Header-level selector for consistency.

---

### Version-Aware Data Fetching

**API Endpoint Pattern:**
```
GET /api/analytics/surveys/:id/score-distribution?versionId=xxx
```

**If `versionId` omitted:**
- Backend defaults to latest version
- Response includes `meta.version` so frontend knows which version was used

**Version-Specific Queries:**
- Filter `survey_responses` by `score_config_version_id`
- Only include responses scored with that specific version
- Historical versions may have fewer responses (only responses from that time period)

---

### No Data States Per Version

**Scenario:** User selects an old version that has no responses (version created but no responses yet).

**Behavior:**
- Show empty state: "No responses for this version"
- Don't show error (this is expected)
- Optionally show: "This version was created on [date] but has no responses yet"

**Empty State Component:**
```tsx
<AnalyticsEmpty
  message="No responses for this version"
  icon={BarChart3}
  actionLabel="View latest version"
  onAction={() => setVersion("latest")}
/>
```

---

### Version Change Behavior

**When user changes version:**
1. Show loading state on all version-aware components
2. Fetch new data for selected version
3. Update all charts/tables simultaneously
4. Preserve scroll position (don't jump to top)

**Optimistic Updates:**
- Don't use optimistic updates for version changes (data is different)
- Always show loading state during version switch

---

## Error, Loading, and Empty States

### Unified Skeleton Pattern

**Component:** `<AnalyticsSkeleton />`

**Usage:**
```tsx
{isLoading ? (
  <AnalyticsSkeleton type="card" width="100%" height={200} />
) : (
  <ParticipationMetricsCard metrics={data} />
)}
```

**Skeleton Types:**
1. **`type="card"`**: Generic card skeleton
2. **`type="chart"`**: Chart-shaped (bar/line/donut)
3. **`type="table"`**: Table with rows/columns
4. **`type="metric"`**: Small metric card

**Animation:**
- Shimmer effect: `animate-pulse` with gradient
- Duration: `2s` ease-in-out infinite
- Color: `bg-gray-200` → `bg-gray-100` gradient

---

### Empty State Messages

**Component:** `<AnalyticsEmpty />`

**Props:**
```typescript
interface AnalyticsEmptyProps {
  message: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
```

**Common Messages:**
- "No responses yet" (participation metrics)
- "No data for this version" (version-specific)
- "No scores available" (scoring charts)
- "No questions answered" (question summary)

**Layout:**
- Centered content
- Icon (optional, large, gray)
- Message text
- Optional action button

**Example:**
```tsx
<AnalyticsEmpty
  message="No responses yet"
  icon={Users}
  actionLabel="Share Survey"
  onAction={() => navigateToShare()}
/>
```

---

### API Error Handling Strategy

**Error Types:**
1. **Network Error:** Request failed (no response)
2. **4xx Error:** Client error (bad request, not found)
3. **5xx Error:** Server error (internal error)
4. **Timeout:** Request took too long

**Error Handling:**
```typescript
// In React Query
const { data, isLoading, error } = useQuery({
  queryKey: ["analytics", surveyId],
  queryFn: fetchAnalytics,
  retry: 1, // Retry once on failure
  retryDelay: 1000,
  onError: (error) => {
    // Log to error tracking service
    console.error("[Analytics] Fetch error:", error);
  }
});
```

**Error Display:**
- Use `<AnalyticsError />` component
- Show user-friendly message (not technical error)
- Include retry button if `onRetry` provided
- Don't break page layout (preserve card structure)

**Error Messages:**
- Network: "Unable to connect. Please check your internet connection."
- 404: "Survey not found."
- 500: "Something went wrong. Please try again."
- Timeout: "Request timed out. Please try again."

---

### Loading State Hierarchy

**Page Level:**
- Show full-page skeleton if no data loaded yet
- Once initial data loads, show individual component skeletons for subsequent loads

**Component Level:**
- Each component manages its own loading state
- Skeleton matches final component dimensions
- Loading states are independent (one can load while others show data)

**Example:**
```tsx
// Page loads
{isLoadingInitial ? (
  <AnalyticsSkeleton type="card" /> // Full page skeleton
) : (
  <>
    {/* Participation metrics loads independently */}
    <ParticipationMetricsCard
      metrics={participationData}
      isLoading={isLoadingParticipation}
    />
    
    {/* Score distribution loads independently */}
    <ScoreDistributionChart
      data={scoreData}
      isLoading={isLoadingScores}
    />
  </>
)}
```

---

## Page Structure & Navigation

### Analytics Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ ← Back    Survey Title                    [Export]    │  │
│ │            Survey Description              [Version ▼] │  │
│ └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ Tab Navigation                                               │
│ [Overview] [Participation] [Categories] [Questions] [Export] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Content Area (Tab Content)                                   │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Participation Metrics Card (4 metrics)                 │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│ │ Score        │  │ Band         │  │ Response     │      │
│ │ Distribution │  │ Distribution │  │ Trend        │      │
│ └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Question Summary Table                                │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Tab Structure

**Tabs:**
1. **Overview** (default)
   - Participation metrics
   - Score distribution
   - Band distribution
   - Response trend
   - Question summary (top 5)

2. **Participation**
   - Detailed participation metrics
   - Response rate over time
   - Completion rate trends
   - Drop-off analysis

3. **Categories**
   - Category score breakdown
   - Category comparison charts
   - Category trends over time

4. **Questions**
   - Full question summary table
   - Question-level drill-down
   - Response distributions per question

5. **Comments** (Future)
   - Open-text responses
   - Sentiment analysis (if implemented)

6. **Export**
   - CSV/JSON export options
   - Filtered export
   - Scheduled exports (future)

---

### Navigation Flow

**Entry Points:**
- Dashboard → Click survey → Analytics page
- Survey list → "View Analytics" button → Analytics page
- Builder → "View Analytics" button → Analytics page

**Breadcrumbs:**
- Analytics Page → Back to Dashboard
- Or: Dashboard → Surveys → [Survey Name] → Analytics

**Version Selector:**
- Located in header (right side, next to Export)
- Only visible if multiple versions exist
- Dropdown: "Version 2 (Latest)" or "Version 1"

---

## Implementation Checklist

### Phase 0: Foundation
- [ ] ANAL-000: Analytics API Foundation
- [ ] BUILD-010: Analytics Query Helpers
- [ ] BUILD-020: Component Library (all base components)

### Phase 0: Features
- [ ] ANAL-001: Participation Metrics Card
- [ ] ANAL-004: Score Distribution Chart
- [ ] ANAL-005: Band Distribution Chart
- [ ] ANAL-006: Question Summary Table

### Phase 0: Polish
- [ ] Error/loading/empty states
- [ ] Version selector integration
- [ ] Responsive testing
- [ ] Performance optimization

---

## Questions Resolved

1. **Tab Structure:** ✅ Keep Overview, Participation, Categories, Questions, Export
2. **Filter Sidebar:** ✅ Top bar filters (not left panel) - keeps layout simple
3. **Chart Library:** ✅ Recharts (better React/TypeScript integration)
4. **Mobile Priority:** ✅ Mobile-first responsive design
5. **Export Location:** ✅ Header buttons + dedicated Export tab

---

## Next Steps

1. ✅ **This spec is complete** - Ready for review
2. 🔲 **Review & Approval** - User reviews this spec
3. 🔲 **BUILD-020** - Implement component library
4. 🔲 **ANAL-001** - Build participation metrics using new components
5. 🔲 **ANAL-004, ANAL-005, ANAL-006** - Build remaining features

---

## People Development Layer (Leadership & Wellbeing)

### Overview

Evalia's analytics are built on a **people development measurement model** that maps scoring categories to organizational health indices. This layer provides diagnostic insights for leadership effectiveness, team wellbeing, burnout risk, psychological safety, and engagement.

**See:** `docs/ANALYTICS_MEASUREMENT_MODEL_PEOPLE_DEV.md` for complete measurement model specification.

---

### Core Indices

The measurement model defines **5 core indices** computed from scoring categories:

1. **Leadership Effectiveness** (0-100)
   - Measures leadership clarity, coaching, fairness, empowerment, communication
   - Bands: Highly Effective (85-100), Effective (70-84), Developing (55-69), Needs Improvement (40-54), Critical (0-39)

2. **Team Wellbeing** (0-100)
   - Measures workload, support, balance, civility, recognition
   - Bands: Healthy (80-100), Stable (65-79), Watch (50-64), At Risk (35-49), Critical (0-34)

3. **Burnout Risk** (0-100, inverse: higher = lower risk)
   - Measures exhaustion, cynicism, reduced efficacy, overload, lack of control
   - Bands: Low Risk (0-20), Moderate Risk (21-40), High Risk (41-60), Very High Risk (61-80), Critical Risk (81-100)

4. **Psychological Safety** (0-100)
   - Measures safe to speak up, make mistakes, disagree, be yourself, trust in leadership
   - Bands: High Safety (75-100), Moderate Safety (60-74), Low Safety (45-59), Very Low Safety (30-44), Critical (0-29)

5. **Engagement Energy** (0-100)
   - Measures motivation, growth, alignment, resources, recognition
   - Bands: Highly Engaged (80-100), Engaged (65-79), Neutral (50-64), Disengaged (35-49), Highly Disengaged (0-34)

**All Insight Dimensions are:**
- Version-aware (computed using `score_config_version_id`)
- Config-driven (mapped from `scoreConfig.categories[]`)
- Non-clinical (organizational metrics, not diagnostic)

---

### UI Integration Points

**Overview Tab:**
- **Dimension Stat Cards:** 5 `<MetricStatCard />` components showing current dimension scores
- **Dimension Band Distribution:** `<DonutChart />` showing distribution across bands for each dimension
- **Dimension Trends:** `<LineChart />` showing dimension trends over time (if multi-wave)

**Categories Tab:**
- **Domain Overview:** `<BarChart />` showing domain scores within each index category
- **Domain Heatmap:** Heatmap showing domain scores by manager/team (future)
- **Domain Comparison:** Side-by-side domain comparisons across segments

**New Tab: "People Development" (Future):**
- **Manager/Team Segmentation:** Table or cards showing indices by manager/team
- **Hotspot Detection:** List of segments with critical scores requiring intervention
- **Self vs Team Comparison:** Compare manager self-assessment vs team assessment
- **Trend Comparison:** Before/after intervention comparisons

**Export Tab:**
- **Index Reports:** Export index scores, domain breakdowns, hotspot summaries
- **Manager Reports:** Per-manager index and domain summaries

---

### Metric Definitions

The people development metrics reuse Phase 0 metric shapes:

- **Index Distribution:** `ScoreDistributionResponse` shape → `<BarChart />`
- **Index Band Distribution:** `BandDistributionResponse` shape → `<DonutChart />`
- **Domain Overview:** `CategoryBreakdownResponse` shape → `<BarChart />`
- **Domain by Manager:** Extended `CategoryBreakdownResponse` → Heatmap/Grouped bars
- **Index Trends:** `LineChart` data shape → `<LineChart />`
- **Hotspot Summary:** Custom shape → `<HotspotList />` or table
- **Self vs Team:** Custom comparison shape → Comparison cards
- **Index Summary by Segment:** Aggregated indices → Table/grid of `<MetricStatCard />`

**See:** `docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md` for complete metric definitions and JSON shapes.

---

### Implementation Priority

**Phase 0 (Current):**
- Participation metrics (ANAL-001)
- Score distribution (ANAL-004)
- Band distribution (ANAL-005)
- Question summary (ANAL-006)

**Phase 0+ (After Base Analytics):**
- Index stat cards on Overview tab
- Index band distribution charts
- Domain overview charts

**Phase 1 (Future):**
- Manager/team segmentation
- Hotspot detection
- Self vs team comparisons
- Domain heatmaps

---

**End of Specification**
