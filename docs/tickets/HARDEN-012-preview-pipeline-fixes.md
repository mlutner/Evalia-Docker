# HARDEN-012: Preview Pipeline Fixes

## Priority: CRITICAL
## Status: Ready
## Time Estimate: 2 days
## Category: Survey Lifecycle
## Epic: HARDEN-000

---

## Problem Statement

The survey preview is not loading properly. Users cannot reliably test their surveys before publishing, which breaks the core workflow.

---

## Investigation Steps

### Step 1: Identify Current Issues

Run these diagnostics first:

```bash
# Check for preview-related errors in console
# Navigate to /preview/:surveyId and capture errors

# Check preview routes exist
grep -rn "preview" client/src/App.tsx

# Check PreviewV2 component
cat client/src/pages/PreviewV2.tsx | head -100
```

### Step 2: Common Preview Issues to Check

**A. Route Not Matching**
```typescript
// In App.tsx, verify route exists:
<Route path="/preview/:id">
  {(params) => <PreviewV2 surveyId={params.id} />}
</Route>
```

**B. Survey Data Not Loading**
```typescript
// In PreviewV2.tsx, check data fetching:
const { data: survey, isLoading, error } = useQuery({
  queryKey: ['survey-preview', surveyId],
  queryFn: () => fetchSurvey(surveyId),
  enabled: !!surveyId
});

// Add error logging
if (error) {
  console.error('[Preview] Failed to load survey:', error);
}
```

**C. Question Renderer Crashing**
```typescript
// Check for null/undefined questions
if (!survey?.questions || survey.questions.length === 0) {
  return <EmptyPreview message="No questions to preview" />;
}
```

---

## Implementation Instructions

### Step 1: Add Preview Error Handling

**Modify:** `client/src/pages/PreviewV2.tsx`

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PreviewErrorFallback } from '@/components/ErrorFallbacks';

export function PreviewV2({ surveyId }: { surveyId: string }) {
  const { data: survey, isLoading, error, refetch } = useQuery({
    queryKey: ['survey-preview', surveyId],
    queryFn: async () => {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (!response.ok) {
        throw new Error(`Failed to load survey: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!surveyId,
    retry: 2,
    retryDelay: 1000
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="font-semibold text-lg">Preview Unavailable</h3>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Failed to load survey'}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No survey
  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Survey not found</p>
      </div>
    );
  }
  
  // No questions
  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Questions</h3>
            <p className="text-muted-foreground mt-2">
              Add questions to your survey before previewing.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.href = `/builder/${surveyId}`}
            >
              Open Builder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render preview with error boundary
  return (
    <ErrorBoundary section="Preview" fallback={<PreviewErrorFallback />}>
      <SurveyPreviewRenderer survey={survey} />
    </ErrorBoundary>
  );
}
```

### Step 2: Fix Question Renderer Null Checks

**Modify:** `client/src/components/survey/QuestionRenderer.tsx`

```typescript
export function QuestionRenderer({ question, onAnswer, value }: QuestionRendererProps) {
  // Guard against null/undefined question
  if (!question) {
    console.warn('[QuestionRenderer] Received null question');
    return null;
  }
  
  // Guard against missing type
  if (!question.type) {
    console.warn('[QuestionRenderer] Question missing type:', question.id);
    return (
      <div className="p-4 border border-yellow-300 rounded bg-yellow-50">
        <p className="text-yellow-800">Question configuration error</p>
      </div>
    );
  }
  
  // Get renderer for question type
  const Renderer = QUESTION_RENDERERS[question.type];
  
  if (!Renderer) {
    console.warn('[QuestionRenderer] Unknown question type:', question.type);
    return (
      <div className="p-4 border rounded">
        <p className="text-muted-foreground">
          Unsupported question type: {question.type}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Question text */}
      <div>
        <p className="font-medium">{question.text || 'Untitled Question'}</p>
        {question.description && (
          <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
        )}
      </div>
      
      {/* Question input */}
      <Renderer 
        question={question} 
        value={value} 
        onChange={onAnswer}
      />
    </div>
  );
}
```

### Step 3: Add Preview Debug Panel

**Create:** `client/src/components/preview/PreviewDebugPanel.tsx`

```typescript
/**
 * Preview Debug Panel
 * 
 * Shows preview state for debugging (dev only).
 * 
 * [HARDEN-012]
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, ChevronDown, ChevronRight } from 'lucide-react';
import type { Survey } from '@shared/schema';

interface PreviewDebugPanelProps {
  survey: Survey;
  currentQuestionIndex: number;
  answers: Record<string, any>;
}

export function PreviewDebugPanel({ 
  survey, 
  currentQuestionIndex, 
  answers 
}: PreviewDebugPanelProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Dev only
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_TOOLS !== 'true') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader 
          className="py-2 px-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Preview Debug
            {expanded ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronRight className="h-4 w-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        
        {expanded && (
          <CardContent className="py-2 px-3 text-xs space-y-2">
            <div>
              <strong>Survey ID:</strong> {survey.id}
            </div>
            <div>
              <strong>Questions:</strong> {survey.questions?.length || 0}
            </div>
            <div>
              <strong>Current Index:</strong> {currentQuestionIndex}
            </div>
            <div>
              <strong>Answers:</strong> {Object.keys(answers).length}
            </div>
            <div>
              <strong>Scoring:</strong> {survey.scoreConfig?.enabled ? 'Enabled' : 'Disabled'}
            </div>
            
            <details className="mt-2">
              <summary className="cursor-pointer text-muted-foreground">
                View Answers JSON
              </summary>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(answers, null, 2)}
              </pre>
            </details>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
```

---

## Testing Instructions

### Manual Test 1: Basic Preview Load

1. Create a survey with 3+ questions
2. Click "Preview" in builder
3. Verify: Preview loads without errors
4. Verify: All questions display correctly

### Manual Test 2: Empty Survey Preview

1. Create survey with no questions
2. Try to preview
3. Verify: Shows helpful "No Questions" message
4. Verify: Link to open builder works

### Manual Test 3: Preview Error Recovery

1. Navigate to `/preview/invalid-id`
2. Verify: Error message shown (not white screen)
3. Click "Try Again"
4. Verify: Refetch is attempted

### Manual Test 4: Question Type Support

Test preview with each question type:
- [ ] Likert
- [ ] Multiple choice
- [ ] Single choice
- [ ] Text
- [ ] Rating
- [ ] Open-ended

---

## Acceptance Criteria

- [ ] Preview loads reliably for valid surveys
- [ ] Error states show helpful messages
- [ ] Empty surveys show "No Questions" guidance
- [ ] All question types render correctly
- [ ] Debug panel available in dev mode
- [ ] No white screens on any preview error

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/pages/PreviewV2.tsx` | MODIFY |
| `client/src/components/survey/QuestionRenderer.tsx` | MODIFY |
| `client/src/components/preview/PreviewDebugPanel.tsx` | CREATE |

---

## Related Issues

- HARDEN-013: Survey Completion Flow
- HARDEN-014: Builder Design Bugs

