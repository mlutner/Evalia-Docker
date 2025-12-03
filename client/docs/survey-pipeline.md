# Survey Pipeline Documentation

This document describes the data flow from survey creation through runtime rendering.

---

## Pipeline Overview

```text
BuilderQuestion (editing)
    ↓ toRuntimeQuestion()
RuntimeQuestion (schema)
    ↓
QuestionRenderer (unified UI)
    ↓
Answer stored in response (+ optional scoring/logic)
```

---

## Type Definitions

### BuilderQuestion

**Location:** `src/contexts/SurveyBuilderContext.tsx`

Builder-specific fields used during survey editing:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique question identifier |
| `type` | `ValidQuestionType` | Question type from schema |
| `text` | `string` | Question text (maps to `question` in runtime) |
| `description` | `string?` | Optional helper text |
| `required` | `boolean` | Whether answer is required |
| `order` | `number` | Position in survey |
| `hasLogic` | `boolean` | Whether skip logic is attached |
| `displayType` | `string` | Human-readable type name |

**Type-specific fields (examples):**

| Category | Fields |
|----------|--------|
| Options-based | `options: string[]` |
| Rating | `ratingScale`, `ratingStyle`, `ratingLabels` |
| Slider | `min`, `max`, `step`, `unit` |
| Matrix | `rowLabels`, `colLabels` |
| NPS | `npsLabels` |
| Likert | `likertPoints`, `customLabels` |

**Logic-related fields (if present):**
- `skipCondition?: SkipCondition` (see logic section)

> **Rule:** BuilderQuestion is allowed to be "richer" than runtime (helper flags, UI hints), but it must always be convertible to a valid `Question` via `toRuntimeQuestion`.

---

### RuntimeQuestion (Question)

**Location:** `@shared/schema` (Zod schema)

Runtime fields for survey execution:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `type` | `QuestionType` | Question type |
| `question` | `string` | Question text (`text` → `question` mapping) |
| `description` | `string?` | Optional helper text |
| `required` | `boolean` | Whether answer is required |

**Type-specific fields:**
- `options`, `scales`, `ranges`, `labels`, etc. (must match Zod schema)

**Optional:**
- `skipCondition?: SkipCondition` (used by runtime logic engine)

> **Rule:** Anything rendered by `QuestionRenderer` should be valid against this schema. If the Zod schema changes, `BuilderQuestion` and `toRuntimeQuestion` must be updated together.

---

### BuilderSurvey

**Location:** `src/contexts/SurveyBuilderContext.tsx`

Container for a full survey in the builder:

**Core:**
- `id: string`
- `title: string`
- `description?: string`

**Experience:**
- `welcomeScreen: WelcomeScreen`
- `thankYouScreen: ThankYouScreen`
- `estimatedMinutes?: number`

**Questions:**
- `questions: BuilderQuestion[]`

**Scoring:**
- `scoringSettings?: ScoringSettings` (per-dimension config, ranges, labels, etc.)

> `BuilderSurvey` → API → stored as a runtime survey object compatible with `Question[]` and `scoringSettings`.

---

## Adapter Functions

### toRuntimeQuestion(builderQuestion: BuilderQuestion): Question

**Location:** `src/lib/questionAdapter.ts`

Maps BuilderQuestion to runtime Question schema:

```typescript
export function toRuntimeQuestion(builderQuestion: BuilderQuestion): Question {
  return {
    ...builderQuestion,
    question: builderQuestion.text, // Key mapping: text → question
  } as Question;
}
```

**Responsibilities:**
1. Rename `text` → `question`
2. Drop any builder-only fields (e.g., `displayType`, purely UI flags)
3. Ensure the result satisfies the Zod `Question` schema

> If you add a new field to the Zod `Question` schema, you **MUST** check whether it should be populated here.

---

### toBuilderQuestion(question: Question, index: number): Partial<BuilderQuestion>

**Location:** `src/lib/questionAdapter.ts`

Reverse mapping for loading surveys from the API:

```typescript
export function toBuilderQuestion(
  question: Question,
  index: number
): Partial<BuilderQuestion> {
  return {
    ...question,
    text: question.question,      // Key mapping: question → text
    order: index,
    hasLogic: !!question.skipCondition,
  };
}
```

**Responsibilities:**
1. Rename `question` → `text`
2. Initialize `order` from array index
3. Derive `hasLogic` from presence of `skipCondition`

---

## Rendering Pipeline

### QuestionRenderer

**Location:** `src/components/surveys/QuestionRenderer.tsx`

**THE** single source of truth for question UI. Used in:

| Mode | Context | File |
|------|---------|------|
| `builder` | BuilderCanvas question preview | `BuilderCanvas.tsx` |
| `preview` | PreviewV2 interactive testing | `PreviewV2.tsx` |
| `live` | SurveyView/SurveyViewV2 respondent-facing | `SurveyView.tsx` |
| `readonly` | Design view static preview | `DesignV2.tsx` |

```typescript
interface QuestionRendererProps {
  question: Question;          // Runtime question (use toRuntimeQuestion)
  mode: 'builder' | 'preview' | 'live' | 'readonly';
  value?: unknown;             // Current answer value (see below)
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  readOnly?: boolean;
  themeColors?: {
    primary: string;
    background: string;
    text: string;
  };
  onAutoAdvance?: () => void;  // For single-select auto-advance
}
```

---

## Answer Shape Contract

For each question type, `value` **MUST** have a consistent shape:

| Question Type | Value Shape |
|---------------|-------------|
| `text`, `email`, `phone`, `url`, `number`, `textarea` | `string \| number \| null` |
| `multiple_choice`, `dropdown`, `yes_no`, `opinion_scale`, `rating`, `nps` | `string \| number \| null` |
| `checkbox` | `string[]` |
| `likert` | `string \| number \| null` (label or index) |
| `slider` | `number` |
| `date`, `time` | `string` (ISO-ish date/time) |
| `matrix` | `{ [rowId: string]: string \| number \| null }` |
| `ranking` | `string[]` (ordered option IDs) |

> **Rule:** If you change any value shape, you must update:
> 1. `QuestionRenderer`
> 2. Live response serialization/deserialization
> 3. Any scoring logic that reads answers

---

## Answer Storage

### Preview Mode

Answers are stored in local component state:

```typescript
const [previewAnswers, setPreviewAnswers] =
  useState<Record<string, unknown>>({});
```

- Not persisted
- Used only for interaction testing
- Cleared on "Restart Preview"

### Live Mode

Answers stored via survey response API:

- `POST /api/surveys/:id/responses` – Create response
- `PATCH /api/surveys/:id/responses/:responseId` – Append/update answers

Runtime survey screens (`SurveyView` / `SurveyViewV2`) are responsible for:
1. Managing `responseId`
2. Calling `QuestionRenderer` with the correct `value` + `onChange`
3. Posting/patching answers using the API

---

## Skip Logic & Flow Control

*(If not fully implemented yet, this defines the intended design.)*

**Logic definition:**
- `skipCondition` lives on the runtime `Question` (Zod schema)
- Builder exposes `hasLogic` + configuration UI

**Runtime engine:**
- Lives in `src/lib/logicEngine.ts` (or similar)
- Takes: `questions`, `currentQuestionId`, `answers`
- Returns: `nextQuestionId` (or "end of survey")

> **Rule:** PreviewV2 is allowed to run a simplified linear flow now, but when logic is enabled, both Preview and Live **must** use the same logic engine.

---

## Scoring Pipeline (High-Level)

*(Skeleton – fill in when scoring is wired.)*

**Scoring config:**
- `BuilderSurvey.scoringSettings` holds:
  - Dimensions
  - Question → dimension mappings
  - Weighting, ranges, labels

**Runtime scoring:**
- Takes `answers` + `scoringSettings`
- Outputs:
  - Per-dimension scores
  - Overall score object

*When scoring is implemented, document:*
- Where the scoring function lives
- How it's called after completion
- Where scores are stored (same response object vs separate table)

---

## Files That MUST Stay in Sync

The following always form a unit:

| File | Purpose |
|------|---------|
| `@shared/schema` | Zod question schema (runtime truth) |
| `src/contexts/SurveyBuilderContext.tsx` | `BuilderQuestion` + `QUESTION_TYPES` |
| `src/lib/questionAdapter.ts` | `toRuntimeQuestion` / `toBuilderQuestion` |
| `src/components/surveys/QuestionRenderer.tsx` | All type renderers |
| Any scoring/logic engine | Branches on `Question.type` |

> If you change question types, fields, or answer shapes, you **MUST** review all of the above before merging.

---

## Schema Change Checklist

If you touch `QuestionType` or the Zod schema:

- [ ] Update `BuilderQuestion` type if needed
- [ ] Update `toRuntimeQuestion` adapter
- [ ] Update `QuestionRenderer` switch statement
- [ ] Update Answer Shape Contract table above
- [ ] Run full `docs/builder-qa-checklist.md` end-to-end
- [ ] Update `docs/question-types.md` coverage table

---

## Anti-Patterns to Avoid

| ❌ Don't | Why |
|----------|-----|
| Create parallel question renderers (e.g., `QuestionInput`, `QuestionPreview`) | Causes drift, duplicate bugs |
| Bypass `toRuntimeQuestion` when passing to `QuestionRenderer` | Builder uses `text`, runtime uses `question` |
| Store question text in both `text` and `question` fields | Confuses which is source of truth |
| Add question types without updating all sync points | Breaks Builder/Preview/Live consistency |
| Change answer shapes silently | Breaks scoring, response storage, analytics |
