# AI Editing Rules & Guardrails

These rules apply to ALL AI tools (Cursor, Warp, Copilot, Claude, etc.) when editing the Evalia codebase.

---

## Core Principles

1. **Small, isolated diffs only** – No "rewrite the whole component" changes
2. **No parallel implementations** – One way to do each thing
3. **Types are contracts** – Changing types requires updating all consumers
4. **Test before committing** – Run `tsc --noEmit` at minimum

---

## File Protection Rules

### DO NOT touch without explicit human approval:

| File/Directory | Reason |
|----------------|--------|
| `src/contexts/SurveyBuilderContext.tsx` | Core state management |
| `src/components/surveys/QuestionRenderer.tsx` | Single source of truth for question UI |
| `src/lib/questionAdapter.ts` | Type mapping bridge |
| `@shared/schema` | Zod schema definitions |
| `prisma/schema.prisma` | Database schema |
| `server/routes.ts` | API endpoints |

### DO NOT automatically:

- Delete or rename files
- Restructure directories
- Create new question rendering components
- Add new database fields
- Modify API response shapes

---

## Question Rendering Rules

### The Law: One Renderer

```
QuestionRenderer is THE ONLY component that renders question UI.
```

**Violations that must be blocked:**

- Creating `QuestionInput`, `QuestionPreview`, `QuestionView` or similar
- Inline switch statements on `question.type` in page components
- Duplicating rating/NPS/slider UI outside QuestionRenderer

**Correct pattern:**

```tsx
// ✅ CORRECT
import { QuestionRenderer } from '@/components/surveys/QuestionRenderer';
import { toRuntimeQuestion } from '@/lib/questionAdapter';

<QuestionRenderer
  question={toRuntimeQuestion(builderQuestion)}
  mode="preview"
  value={answers[question.id]}
  onChange={(v) => setAnswer(question.id, v)}
/>
```

```tsx
// ❌ WRONG - parallel implementation
function QuestionInput({ question }) {
  switch (question.type) {
    case 'rating': return <RatingInput ... />
    // NO! Use QuestionRenderer
  }
}
```

---

## Type System Rules

### BuilderQuestion ↔ RuntimeQuestion

These types MUST stay in sync via `toRuntimeQuestion`:

```
BuilderQuestion uses: text
RuntimeQuestion uses: question
Adapter maps: text → question
```

**Before changing either type:**

1. Check `src/lib/questionAdapter.ts`
2. Update the mapping if needed
3. Verify all consumers still work

### Adding a new question type

Required changes (in order):

1. `@shared/schema` – Add to QuestionType union
2. `SurveyBuilderContext.tsx` – Add to QUESTION_TYPES config
3. `QuestionRenderer.tsx` – Add renderer case
4. `questionAdapter.ts` – Verify mapping handles new fields
5. `docs/question-types.md` – Document the type
6. Run full QA checklist

---

## Diff Size Limits

| Change Type | Max Lines Changed |
|-------------|-------------------|
| Bug fix | ~50 lines |
| Small feature | ~150 lines |
| Refactor | ~200 lines |
| New component | ~300 lines |

If a diff exceeds these limits, it should be split into multiple PRs.

---

## Pre-Commit Checklist

Before any AI-generated code is committed:

- [ ] `npx tsc --noEmit` passes
- [ ] No new `any` types introduced
- [ ] No unused imports
- [ ] No parallel question renderers created
- [ ] Types match between Builder and Runtime
- [ ] Changes are isolated to requested scope

---

## Forbidden Patterns

### Type safety violations

```typescript
// ❌ NEVER
const question = data as any;
survey?.welcomeScreen.themeColors; // unsafe access

// ✅ ALWAYS
const question: BuilderQuestion = validateQuestion(data);
survey?.welcomeScreen?.themeColors ?? defaultTheme;
```

### State management anti-patterns

```typescript
// ❌ NEVER - direct mutation
questions[0].text = 'new text';

// ✅ ALWAYS - immutable update
updateQuestion(id, { text: 'new text' });
```

### UI duplication

```typescript
// ❌ NEVER - inline question rendering
{question.type === 'rating' && (
  <div className="flex gap-2">
    {[1,2,3,4,5].map(n => <button>{n}</button>)}
  </div>
)}

// ✅ ALWAYS - use QuestionRenderer
<QuestionRenderer question={toRuntimeQuestion(question)} mode="preview" />
```

---

## When in Doubt

1. **Ask** before making structural changes
2. **Check** `docs/survey-pipeline.md` for the correct pattern
3. **Run** the QA checklist after changes
4. **Keep** changes small and reversible

---

## Enforcement

The `WARP.md` file in the project root contains machine-readable rules.
AI tools should read and follow those rules automatically.

Human reviewers should reject PRs that violate these guidelines.
