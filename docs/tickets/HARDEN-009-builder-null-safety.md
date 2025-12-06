# HARDEN-009: Builder Null Safety Pass

## Priority: HIGH
## Status: Ready
## Time Estimate: 2 days
## Category: Builder Stability
## Epic: HARDEN-000

---

## Objective

Systematically add null/undefined checks throughout the builder to prevent crashes from missing data.

---

## Implementation Instructions

### Step 1: Create Safe Accessor Utilities

**Create:** `client/src/utils/safeAccessors.ts`

```typescript
/**
 * Safe Accessor Utilities
 * 
 * Helpers for safely accessing potentially undefined values.
 * Prevents "cannot read property of undefined" errors.
 * 
 * [HARDEN-009]
 */

import type { Question, Survey, SurveyScoreConfig } from '@shared/schema';

// ============================================================================
// GENERIC SAFE ACCESSORS
// ============================================================================

export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj?.[key];
}

export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return arr ?? [];
}

export function safeString(str: string | null | undefined, fallback: string = ''): string {
  return str ?? fallback;
}

export function safeNumber(num: number | null | undefined, fallback: number = 0): number {
  if (num === null || num === undefined || isNaN(num)) return fallback;
  return num;
}

export function safeBoolean(bool: boolean | null | undefined, fallback: boolean = false): boolean {
  return bool ?? fallback;
}

// ============================================================================
// SURVEY-SPECIFIC SAFE ACCESSORS
// ============================================================================

export function safeQuestions(survey: Survey | null | undefined): Question[] {
  return safeArray(survey?.questions);
}

export function safeQuestion(survey: Survey | null | undefined, index: number): Question | undefined {
  return safeQuestions(survey)[index];
}

export function safeQuestionById(survey: Survey | null | undefined, id: string): Question | undefined {
  return safeQuestions(survey).find(q => q.id === id);
}

export function safeOptions(question: Question | null | undefined): string[] {
  return safeArray(question?.options);
}

export function safeOptionScores(question: Question | null | undefined): number[] {
  const options = safeOptions(question);
  const scores = question?.optionScores;
  
  if (Array.isArray(scores) && scores.length === options.length) {
    return scores;
  }
  
  // Generate default scores
  return options.map((_, i) => i + 1);
}

export function safeScoreConfig(survey: Survey | null | undefined): Partial<SurveyScoreConfig> {
  return survey?.scoreConfig ?? { enabled: false, categories: [], bands: [] };
}

export function safeCategories(survey: Survey | null | undefined): any[] {
  return safeArray(safeScoreConfig(survey).categories);
}

export function safeBands(survey: Survey | null | undefined): any[] {
  return safeArray(safeScoreConfig(survey).bands);
}

// ============================================================================
// ARRAY OPERATIONS
// ============================================================================

export function safeFind<T>(arr: T[] | null | undefined, predicate: (item: T) => boolean): T | undefined {
  return safeArray(arr).find(predicate);
}

export function safeFilter<T>(arr: T[] | null | undefined, predicate: (item: T) => boolean): T[] {
  return safeArray(arr).filter(predicate);
}

export function safeMap<T, U>(arr: T[] | null | undefined, mapper: (item: T, index: number) => U): U[] {
  return safeArray(arr).map(mapper);
}

export function safeSlice<T>(arr: T[] | null | undefined, start: number, end?: number): T[] {
  return safeArray(arr).slice(start, end);
}

// ============================================================================
// INDEX OPERATIONS
// ============================================================================

export function safeIndex<T>(arr: T[] | null | undefined, index: number): T | undefined {
  const safe = safeArray(arr);
  if (index < 0 || index >= safe.length) return undefined;
  return safe[index];
}

export function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

// ============================================================================
// OBJECT OPERATIONS
// ============================================================================

export function safeEntries<T extends object>(obj: T | null | undefined): [string, T[keyof T]][] {
  if (!obj) return [];
  return Object.entries(obj) as [string, T[keyof T]][];
}

export function safeKeys<T extends object>(obj: T | null | undefined): string[] {
  if (!obj) return [];
  return Object.keys(obj);
}
```

### Step 2: Apply to Question List Component

**Modify:** `client/src/components/builder-v2/QuestionList.tsx`

```typescript
import { safeQuestions, safeQuestion, safeOptions } from '@/utils/safeAccessors';

export function QuestionList({ survey, onSelectQuestion, selectedIndex }: QuestionListProps) {
  // SAFE: Use accessor instead of direct access
  const questions = safeQuestions(survey);
  
  if (questions.length === 0) {
    return <NoQuestionsEmpty onAddQuestion={onAddQuestion} />;
  }
  
  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <QuestionCard
          key={question?.id ?? `question-${index}`}
          question={question}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={() => onSelectQuestion(index)}
        />
      ))}
    </div>
  );
}

function QuestionCard({ question, index, isSelected, onSelect }: QuestionCardProps) {
  // SAFE: Handle potentially undefined question
  if (!question) {
    return (
      <div className="p-3 border rounded bg-muted text-muted-foreground">
        Question data missing
      </div>
    );
  }
  
  return (
    <div 
      className={cn("p-3 border rounded cursor-pointer", isSelected && "border-primary")}
      onClick={onSelect}
    >
      <p className="font-medium">
        {index + 1}. {safeString(question.text, 'Untitled Question')}
      </p>
      <p className="text-sm text-muted-foreground">
        {safeString(question.type, 'unknown')} • {safeOptions(question).length} options
      </p>
    </div>
  );
}
```

### Step 3: Apply to Question Editor Component

**Modify:** `client/src/components/builder-v2/QuestionEditor.tsx`

```typescript
import { safeQuestion, safeOptions, safeOptionScores, safeString } from '@/utils/safeAccessors';

export function QuestionEditor({ survey, questionIndex, onUpdate }: QuestionEditorProps) {
  // SAFE: Get question with fallback
  const question = safeQuestion(survey, questionIndex);
  
  // Handle missing question
  if (!question) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Select a question to edit</p>
      </div>
    );
  }
  
  // SAFE: Get options and scores
  const options = safeOptions(question);
  const optionScores = safeOptionScores(question);
  
  const handleTextChange = (text: string) => {
    onUpdate(questionIndex, { ...question, text });
  };
  
  const handleOptionChange = (optionIndex: number, value: string) => {
    // SAFE: Clone array before modifying
    const newOptions = [...options];
    newOptions[optionIndex] = value;
    onUpdate(questionIndex, { ...question, options: newOptions });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Question Text</Label>
        <Textarea
          value={safeString(question.text)}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your question..."
        />
      </div>
      
      {options.length > 0 && (
        <div>
          <Label>Options</Label>
          <div className="space-y-2">
            {options.map((option, i) => (
              <Input
                key={i}
                value={safeString(option)}
                onChange={(e) => handleOptionChange(i, e.target.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Apply to Scoring Panel

**Modify:** `client/src/components/builder-v2/ScoringPanel.tsx`

```typescript
import { 
  safeScoreConfig, 
  safeCategories, 
  safeBands,
  safeBoolean,
  safeString 
} from '@/utils/safeAccessors';

export function ScoringPanel({ survey, onUpdate }: ScoringPanelProps) {
  // SAFE: Get score config with defaults
  const scoreConfig = safeScoreConfig(survey);
  const categories = safeCategories(survey);
  const bands = safeBands(survey);
  const enabled = safeBoolean(scoreConfig.enabled);
  
  const handleEnableChange = (checked: boolean) => {
    onUpdate({
      scoreConfig: {
        ...scoreConfig,
        enabled: checked
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={handleEnableChange} />
        <Label>Enable Scoring</Label>
      </div>
      
      {enabled && (
        <>
          <div>
            <Label>Categories ({categories.length})</Label>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories defined</p>
            ) : (
              <ul className="space-y-1">
                {categories.map((cat, i) => (
                  <li key={cat?.id ?? i} className="text-sm">
                    {safeString(cat?.name, `Category ${i + 1}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <Label>Bands ({bands.length})</Label>
            {bands.length === 0 ? (
              <p className="text-sm text-muted-foreground">Using default bands</p>
            ) : (
              <ul className="space-y-1">
                {bands.map((band, i) => (
                  <li key={band?.id ?? i} className="text-sm">
                    {safeString(band?.name, `Band ${i + 1}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

### Step 5: Apply to Builder Context

**Modify:** `client/src/contexts/SurveyBuilderContext.tsx`

```typescript
import { safeQuestions, safeQuestion, clampIndex } from '@/utils/safeAccessors';

// In question operations:
const addQuestion = useCallback((question: Question) => {
  setSurvey(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      questions: [...safeQuestions(prev), question]
    };
  });
}, []);

const removeQuestion = useCallback((index: number) => {
  setSurvey(prev => {
    if (!prev) return prev;
    const questions = safeQuestions(prev);
    if (index < 0 || index >= questions.length) return prev;
    
    return {
      ...prev,
      questions: questions.filter((_, i) => i !== index)
    };
  });
  
  // SAFE: Clamp selected index
  setSelectedQuestionIndex(prev => clampIndex(prev, safeQuestions(survey).length - 1));
}, [survey]);

const updateQuestion = useCallback((index: number, updates: Partial<Question>) => {
  setSurvey(prev => {
    if (!prev) return prev;
    const questions = safeQuestions(prev);
    const question = safeQuestion(prev, index);
    
    if (!question) return prev;
    
    const newQuestions = [...questions];
    newQuestions[index] = { ...question, ...updates };
    
    return { ...prev, questions: newQuestions };
  });
}, []);
```

---

## Files to Audit

Run this grep to find potential null access issues:

```bash
grep -rn "\.questions\[" client/src/components/builder-v2/
grep -rn "\.options\[" client/src/components/builder-v2/
grep -rn "survey\." client/src/components/builder-v2/ | grep -v "survey?."
```

---

## Testing Instructions

### Manual Test 1: Empty Survey

1. Create new empty survey
2. Navigate to builder
3. Verify: No crashes
4. Verify: Empty state shows

### Manual Test 2: Missing Question Data

1. Temporarily corrupt a question (remove required fields)
2. Open builder
3. Verify: Shows fallback UI, doesn't crash

### Manual Test 3: Index Out of Bounds

1. Select question at index 5
2. Delete questions until only 2 remain
3. Verify: Selected index adjusts, no crash

---

## Acceptance Criteria

- [ ] `safeAccessors.ts` utility created
- [ ] QuestionList handles missing questions
- [ ] QuestionEditor handles undefined question
- [ ] ScoringPanel handles missing config
- [ ] BuilderContext uses safe operations
- [ ] No "cannot read property of undefined" errors

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/utils/safeAccessors.ts` | CREATE |
| `client/src/components/builder-v2/QuestionList.tsx` | MODIFY |
| `client/src/components/builder-v2/QuestionEditor.tsx` | MODIFY |
| `client/src/components/builder-v2/ScoringPanel.tsx` | MODIFY |
| `client/src/contexts/SurveyBuilderContext.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-010: Auto-Save & Recovery

