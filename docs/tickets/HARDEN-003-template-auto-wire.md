# HARDEN-003: Template Auto-Wire on Load

## Priority: CRITICAL
## Status: Ready
## Time Estimate: 1 day
## Category: Template Infrastructure
## Epic: HARDEN-000
## Depends On: HARDEN-002

---

## Objective

When a template is loaded (from library, AI generation, or import), automatically wire up valid scoring configuration so templates "just work."

---

## Implementation Instructions

### Step 1: Create Auto-Wire Hook

**Create:** `client/src/hooks/useAutoWireScoring.ts`

```typescript
/**
 * Auto-Wire Scoring Hook
 * 
 * Automatically applies scoring configuration to surveys/templates
 * when they're loaded and found to be missing scoring setup.
 * 
 * [HARDEN-003]
 */

import { useCallback, useState } from 'react';
import { checkSurveyHealth, type SurveyHealthReport } from '@shared/utils/surveyHealthCheck';
import { inferScoringConfig, fixQuestionScoring, type InferenceResult } from '@shared/utils/inferScoringConfig';
import type { Survey, Question } from '@shared/schema';

export interface AutoWireResult {
  survey: Survey;
  healthBefore: SurveyHealthReport;
  healthAfter: SurveyHealthReport;
  inference: InferenceResult | null;
  wasModified: boolean;
  fixedQuestions: string[];
}

export function useAutoWireScoring() {
  const [lastResult, setLastResult] = useState<AutoWireResult | null>(null);
  
  const autoWire = useCallback((survey: Survey): AutoWireResult => {
    // Step 1: Check current health
    const healthBefore = checkSurveyHealth(survey);
    
    // Step 2: If healthy, no changes needed
    if (healthBefore.status === 'healthy') {
      const result: AutoWireResult = {
        survey,
        healthBefore,
        healthAfter: healthBefore,
        inference: null,
        wasModified: false,
        fixedQuestions: []
      };
      setLastResult(result);
      return result;
    }
    
    // Step 3: Fix questions first
    const fixedQuestions: string[] = [];
    const repairedQuestions = survey.questions.map(q => {
      const fixed = fixQuestionScoring(q);
      if (JSON.stringify(fixed) !== JSON.stringify(q)) {
        fixedQuestions.push(q.id);
      }
      return fixed;
    });
    
    // Step 4: Infer scoring config
    const inference = inferScoringConfig(repairedQuestions, survey.scoreConfig);
    
    // Step 5: Apply inferred config
    const wiredSurvey: Survey = {
      ...survey,
      questions: applyInferredCategories(repairedQuestions, inference),
      scoreConfig: {
        ...survey.scoreConfig,
        ...inference.scoreConfig,
        enabled: true
      }
    };
    
    // Step 6: Check health after
    const healthAfter = checkSurveyHealth(wiredSurvey);
    
    const result: AutoWireResult = {
      survey: wiredSurvey,
      healthBefore,
      healthAfter,
      inference,
      wasModified: true,
      fixedQuestions
    };
    
    setLastResult(result);
    return result;
  }, []);
  
  return { autoWire, lastResult };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyInferredCategories(
  questions: Question[],
  inference: InferenceResult
): Question[] {
  // Find category assignments from inference changes
  const categoryAssignments = new Map<string, string>();
  
  inference.changes
    .filter(c => c.field.includes('scoringCategory'))
    .forEach(c => {
      const match = c.field.match(/questions\.([^.]+)\.scoringCategory/);
      if (match) {
        categoryAssignments.set(match[1], c.value);
      }
    });
  
  return questions.map(q => {
    // If question already has category, keep it
    if (q.scoringCategory) return q;
    
    // Apply inferred category
    const inferredCategory = categoryAssignments.get(q.id);
    if (inferredCategory) {
      return { ...q, scoringCategory: inferredCategory };
    }
    
    return q;
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { useAutoWireScoring };
```

### Step 2: Integrate into Template Loader

**Modify:** `client/src/hooks/useTemplateLoader.ts`

Find the template loading function and add auto-wire:

```typescript
import { useAutoWireScoring } from './useAutoWireScoring';

export function useTemplateLoader() {
  const { autoWire } = useAutoWireScoring();
  
  const loadTemplate = useCallback(async (templateId: string) => {
    // Fetch template
    const template = await fetchTemplate(templateId);
    
    // Convert to survey format
    const survey = templateToSurvey(template);
    
    // AUTO-WIRE: Apply scoring configuration
    const { survey: wiredSurvey, wasModified, healthAfter } = autoWire(survey);
    
    // Log for debugging
    if (wasModified) {
      console.log('[Template Loader] Auto-wired scoring:', {
        templateId,
        health: healthAfter.status,
        issues: healthAfter.summary
      });
    }
    
    return wiredSurvey;
  }, [autoWire]);
  
  return { loadTemplate };
}
```

### Step 3: Integrate into AI Survey Generation

**Modify:** `client/src/hooks/useAIGeneration.ts` (or similar)

```typescript
import { useAutoWireScoring } from './useAutoWireScoring';

export function useAIGeneration() {
  const { autoWire } = useAutoWireScoring();
  
  const generateSurvey = useCallback(async (prompt: string) => {
    // Call AI to generate survey
    const generatedSurvey = await callAIEndpoint(prompt);
    
    // AUTO-WIRE: Ensure valid scoring
    const { survey: wiredSurvey, healthAfter } = autoWire(generatedSurvey);
    
    if (healthAfter.status === 'error') {
      console.warn('[AI Generation] Could not fully auto-wire scoring:', 
        healthAfter.issues.filter(i => i.type === 'error')
      );
    }
    
    return wiredSurvey;
  }, [autoWire]);
  
  return { generateSurvey };
}
```

### Step 4: Add Auto-Wire Banner Component

**Create:** `client/src/components/builder-v2/AutoWireBanner.tsx`

```typescript
/**
 * Auto-Wire Banner
 * 
 * Shows user what was automatically fixed when loading a template.
 * 
 * [HARDEN-003]
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Info, Undo2 } from 'lucide-react';
import type { AutoWireResult } from '@/hooks/useAutoWireScoring';

interface AutoWireBannerProps {
  result: AutoWireResult;
  onUndo?: () => void;
  onDismiss?: () => void;
}

export function AutoWireBanner({ result, onUndo, onDismiss }: AutoWireBannerProps) {
  if (!result.wasModified) return null;
  
  const { healthBefore, healthAfter, inference, fixedQuestions } = result;
  
  // Determine banner type
  const improved = healthAfter.summary.errors < healthBefore.summary.errors;
  const fullyFixed = healthAfter.status === 'healthy';
  
  return (
    <Alert 
      variant={fullyFixed ? 'default' : 'warning'}
      className="mb-4"
    >
      <div className="flex items-start gap-3">
        {fullyFixed ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        )}
        
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-2">
            Scoring Configuration Auto-Applied
            <Badge variant="secondary" className="text-xs">
              {inference?.confidence || 'medium'} confidence
            </Badge>
          </AlertTitle>
          
          <AlertDescription className="mt-2 space-y-2">
            {/* Summary */}
            <p className="text-sm">
              {fixedQuestions.length > 0 && (
                <span>{fixedQuestions.length} questions fixed. </span>
              )}
              {inference?.changes.filter(c => c.field.includes('categories')).length || 0} categories configured.
            </p>
            
            {/* Remaining issues */}
            {healthAfter.summary.errors > 0 && (
              <p className="text-sm text-yellow-700">
                {healthAfter.summary.errors} issue(s) still need manual attention.
              </p>
            )}
            
            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {onUndo && (
                <Button variant="outline" size="sm" onClick={onUndo}>
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo Changes
                </Button>
              )}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
```

### Step 5: Add to Builder Context

**Modify:** `client/src/contexts/SurveyBuilderContext.tsx`

```typescript
// Add to context state
interface SurveyBuilderState {
  // ... existing state
  autoWireResult: AutoWireResult | null;
  originalSurvey: Survey | null;  // For undo
}

// Add actions
const undoAutoWire = useCallback(() => {
  if (state.originalSurvey) {
    setSurvey(state.originalSurvey);
    setAutoWireResult(null);
  }
}, [state.originalSurvey]);

// In the loadSurvey function
const loadSurvey = useCallback(async (surveyId: string) => {
  const survey = await fetchSurvey(surveyId);
  
  // Store original before auto-wire
  setOriginalSurvey(survey);
  
  // Auto-wire if needed
  const result = autoWire(survey);
  setAutoWireResult(result);
  setSurvey(result.survey);
}, [autoWire]);
```

---

## Testing Instructions

### Manual Test 1: Load Template Without Scoring

1. Create a template with Likert questions but no scoring config
2. Load it in builder
3. Verify: Auto-wire banner appears
4. Verify: Questions now have `scorable: true` and `scoringCategory`
5. Verify: `scoreConfig.enabled` is true

### Manual Test 2: Load Complete Template

1. Load a fully-configured 5D template
2. Verify: No auto-wire banner (nothing to fix)
3. Verify: Original config preserved

### Manual Test 3: Undo Auto-Wire

1. Load template that gets auto-wired
2. Click "Undo Changes"
3. Verify: Survey reverts to original (broken) state
4. Verify: Banner disappears

---

## Acceptance Criteria

- [ ] Templates auto-wire scoring on load
- [ ] AI-generated surveys auto-wire on creation
- [ ] User sees banner explaining what changed
- [ ] User can undo auto-wire
- [ ] Fully configured templates are not modified
- [ ] Console logs show auto-wire activity

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/hooks/useAutoWireScoring.ts` | CREATE |
| `client/src/hooks/useTemplateLoader.ts` | MODIFY |
| `client/src/hooks/useAIGeneration.ts` | MODIFY |
| `client/src/components/builder-v2/AutoWireBanner.tsx` | CREATE |
| `client/src/contexts/SurveyBuilderContext.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-004: Publish Validation Gate

