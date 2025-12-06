# HARDEN-013: Survey Completion Flow Fixes

## Priority: CRITICAL
## Status: Ready
## Time Estimate: 2 days
## Category: Survey Lifecycle
## Epic: HARDEN-000

---

## Problem Statement

The completed survey view (respondent-facing survey) is not working properly. This is critical because it's the actual user-facing product.

---

## Investigation Steps

### Step 1: Identify Current Issues

```bash
# Check SurveyView component
grep -rn "SurveyView" client/src/

# Check survey routes
grep -rn "\/survey\/" client/src/App.tsx

# Check response submission
grep -rn "submitResponse" client/src/
```

### Step 2: Common Issues to Check

**A. Survey Route Issues**
- Route not matching `/survey/:id`
- Survey ID not being passed correctly
- Published status not being checked

**B. Response Submission Issues**
- API endpoint failing
- Response data malformed
- Scoring not being calculated

**C. Thank You / Results Screen Issues**
- Not navigating after submission
- Results not displaying
- Scoring results not loading

---

## Implementation Instructions

### Step 1: Fix SurveyView Loading and Error States

**Modify:** `client/src/pages/SurveyView.tsx`

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function SurveyView({ surveyId }: { surveyId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  
  // Fetch survey
  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['survey-public', surveyId],
    queryFn: async () => {
      const response = await fetch(`/api/surveys/${surveyId}/public`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Survey not found');
        }
        if (response.status === 403) {
          throw new Error('This survey is not currently accepting responses');
        }
        throw new Error('Failed to load survey');
      }
      return response.json();
    },
    enabled: !!surveyId,
    retry: 2
  });
  
  // Submit response
  const submitMutation = useMutation({
    mutationFn: async (responseData: any) => {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit response');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResponseId(data.id);
      setIsComplete(true);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed');
      setIsSubmitting(false);
    }
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="font-semibold text-lg">Unable to Load Survey</h2>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Survey not found
  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-semibold text-lg">Survey Not Found</h2>
            <p className="text-muted-foreground mt-2">
              This survey may have been removed or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Survey not published
  if (survey.status !== 'published' && survey.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="font-semibold text-lg">Survey Not Available</h2>
            <p className="text-muted-foreground mt-2">
              This survey is not currently accepting responses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Completion screen
  if (isComplete) {
    return (
      <SurveyCompletionScreen 
        survey={survey}
        responseId={responseId}
        answers={answers}
      />
    );
  }
  
  // Survey form
  return (
    <ErrorBoundary section="Survey">
      <SurveyForm
        survey={survey}
        currentStep={currentStep}
        answers={answers}
        onAnswer={(questionId, value) => {
          setAnswers(prev => ({ ...prev, [questionId]: value }));
        }}
        onNext={() => setCurrentStep(prev => prev + 1)}
        onPrev={() => setCurrentStep(prev => prev - 1)}
        onSubmit={async () => {
          setIsSubmitting(true);
          setSubmitError(null);
          
          submitMutation.mutate({
            answers,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          });
        }}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </ErrorBoundary>
  );
}
```

### Step 2: Create Survey Completion Screen

**Create:** `client/src/components/survey/SurveyCompletionScreen.tsx`

```typescript
/**
 * Survey Completion Screen
 * 
 * Shows thank you message and optionally results.
 * 
 * [HARDEN-013]
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BarChart3, Loader2 } from 'lucide-react';
import type { Survey } from '@shared/schema';

interface SurveyCompletionScreenProps {
  survey: Survey;
  responseId: string | null;
  answers: Record<string, any>;
}

export function SurveyCompletionScreen({ 
  survey, 
  responseId,
  answers 
}: SurveyCompletionScreenProps) {
  // Check if survey shows results
  const showResults = survey.scoreConfig?.enabled && 
    survey.resultsConfig?.showResults !== false;
  
  // Fetch results if enabled
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['survey-results', responseId],
    queryFn: async () => {
      if (!responseId) return null;
      const response = await fetch(`/api/responses/${responseId}/results`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: showResults && !!responseId
  });
  
  // Get thank you message
  const thankYouConfig = survey.screens?.find(s => s.type === 'thank_you') || 
    survey.thankYouScreen;
  
  const title = thankYouConfig?.title || 'Thank You!';
  const message = thankYouConfig?.message || 
    'Your response has been recorded. We appreciate your feedback.';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          {/* Thank You Message */}
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{message}</p>
          
          {/* Results Section */}
          {showResults && (
            <div className="mt-8 pt-6 border-t">
              {resultsLoading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating your results...</span>
                </div>
              ) : results ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Your Results</h2>
                  </div>
                  
                  {/* Overall Score */}
                  {results.overallScore !== undefined && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-4xl font-bold text-primary">
                        {Math.round(results.overallScore)}
                      </p>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      {results.band && (
                        <p className="mt-2 font-medium">{results.band.name}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Category Scores */}
                  {results.categoryScores && results.categoryScores.length > 0 && (
                    <div className="space-y-2 text-left">
                      {results.categoryScores.map((cat: any) => (
                        <div key={cat.id} className="flex justify-between items-center">
                          <span className="text-sm">{cat.name}</span>
                          <span className="font-medium">{Math.round(cat.score)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Results are being processed.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Fix Response Submission API

**Verify/Modify:** `server/routes/surveys.ts`

```typescript
// POST /api/surveys/:id/responses
router.post('/:id/responses', async (req, res) => {
  try {
    const { id: surveyId } = req.params;
    const { answers, startedAt, completedAt } = req.body;
    
    // Validate survey exists and is published
    const survey = await storage.getSurvey(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    if (survey.status !== 'published' && survey.status !== 'active') {
      return res.status(403).json({ error: 'Survey is not accepting responses' });
    }
    
    // Validate answers
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers format' });
    }
    
    // Create response
    const response = await storage.createResponse({
      surveyId,
      answers,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      status: 'completed'
    });
    
    // Calculate scores if scoring enabled
    let scores = null;
    if (survey.scoreConfig?.enabled) {
      try {
        scores = calculateSurveyScores(survey, response);
        
        // Update response with scores
        await storage.updateResponse(response.id, { scores });
      } catch (scoreError) {
        console.error('[Survey] Score calculation failed:', scoreError);
        // Don't fail the response, just log
      }
    }
    
    return res.status(201).json({
      id: response.id,
      message: 'Response submitted successfully',
      hasScores: !!scores
    });
    
  } catch (error) {
    console.error('[Survey] Response submission error:', error);
    return res.status(500).json({ error: 'Failed to submit response' });
  }
});

// GET /api/responses/:id/results
router.get('/responses/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await storage.getResponse(id);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    // Get survey for context
    const survey = await storage.getSurvey(response.surveyId);
    
    // Return scores if available
    if (response.scores) {
      return res.json({
        overallScore: response.scores.overallScore,
        band: response.scores.band,
        categoryScores: response.scores.categoryScores || [],
        dimensionScores: response.scores.dimensionScores || []
      });
    }
    
    // Calculate on-the-fly if not stored
    if (survey?.scoreConfig?.enabled) {
      try {
        const scores = calculateSurveyScores(survey, response);
        return res.json(scores);
      } catch {
        return res.json({ error: 'Unable to calculate results' });
      }
    }
    
    return res.json({ message: 'No scoring configured' });
    
  } catch (error) {
    console.error('[Survey] Results fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
});
```

---

## Testing Instructions

### Manual Test 1: Complete Survey Flow

1. Publish a survey with scoring enabled
2. Open survey link (`/survey/:id`)
3. Answer all questions
4. Submit
5. Verify: Thank you screen appears
6. Verify: Results show (if scoring enabled)

### Manual Test 2: Unpublished Survey

1. Create survey (don't publish)
2. Try to access `/survey/:id`
3. Verify: "Survey not available" message

### Manual Test 3: Invalid Survey ID

1. Navigate to `/survey/invalid-id-12345`
2. Verify: "Survey not found" message (not white screen)

### Manual Test 4: Response Submission

1. Open browser Network tab
2. Complete and submit survey
3. Verify: POST request succeeds (201)
4. Verify: Response ID returned

---

## Acceptance Criteria

- [ ] Survey loads for published surveys
- [ ] Clear error messages for unpublished/missing surveys
- [ ] All question types submit correctly
- [ ] Response is saved to database
- [ ] Scores calculated if scoring enabled
- [ ] Thank you screen displays
- [ ] Results show if configured
- [ ] No white screens on any error

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/pages/SurveyView.tsx` | MODIFY |
| `client/src/components/survey/SurveyCompletionScreen.tsx` | CREATE |
| `server/routes/surveys.ts` | MODIFY |

---

## Related Issues

- HARDEN-012: Preview Pipeline Fixes
- HARDEN-014: Builder Design Bugs

