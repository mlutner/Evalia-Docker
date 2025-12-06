# HARDEN-004: Publish Validation Gate

## Priority: CRITICAL
## Status: Ready
## Time Estimate: 1 day
## Category: Survey Lifecycle
## Epic: HARDEN-000
## Depends On: HARDEN-001

---

## Objective

Prevent surveys with broken scoring from being published. Block at both client and server with clear error messages.

---

## Implementation Instructions

### Step 1: Create Publish Validation Hook

**Create:** `client/src/hooks/usePublishValidation.ts`

```typescript
/**
 * Publish Validation Hook
 * 
 * Validates survey before publishing. Blocks publish if critical issues found.
 * 
 * [HARDEN-004]
 */

import { useCallback, useState } from 'react';
import { checkSurveyHealth, type SurveyHealthReport, type SurveyIssue } from '@shared/utils/surveyHealthCheck';
import type { Survey } from '@shared/schema';

export interface PublishValidationResult {
  canPublish: boolean;
  blockers: SurveyIssue[];
  warnings: SurveyIssue[];
  healthReport: SurveyHealthReport;
}

export function usePublishValidation() {
  const [validationResult, setValidationResult] = useState<PublishValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const validate = useCallback((survey: Survey): PublishValidationResult => {
    setIsValidating(true);
    
    try {
      // Run health check
      const healthReport = checkSurveyHealth(survey);
      
      // Extract blockers (errors) and warnings
      const blockers = healthReport.issues.filter(i => i.type === 'error');
      const warnings = healthReport.issues.filter(i => i.type === 'warning');
      
      const result: PublishValidationResult = {
        canPublish: blockers.length === 0,
        blockers,
        warnings,
        healthReport
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);
  
  return { 
    validate, 
    validationResult, 
    isValidating, 
    clearValidation 
  };
}
```

### Step 2: Create Publish Validation Dialog

**Create:** `client/src/components/builder-v2/PublishValidationDialog.tsx`

```typescript
/**
 * Publish Validation Dialog
 * 
 * Shows validation results before publishing.
 * Blocks publish if errors, warns if warnings.
 * 
 * [HARDEN-004]
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wrench 
} from 'lucide-react';
import type { PublishValidationResult } from '@/hooks/usePublishValidation';
import type { SurveyIssue } from '@shared/utils/surveyHealthCheck';

interface PublishValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: PublishValidationResult | null;
  onConfirmPublish: () => void;
  onFixIssues: () => void;
  isPublishing?: boolean;
}

export function PublishValidationDialog({
  open,
  onOpenChange,
  result,
  onConfirmPublish,
  onFixIssues,
  isPublishing
}: PublishValidationDialogProps) {
  if (!result) return null;
  
  const { canPublish, blockers, warnings, healthReport } = result;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {canPublish ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Ready to Publish
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Cannot Publish
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {canPublish 
              ? 'Your survey passed validation checks.'
              : 'Please fix the following issues before publishing.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Blockers (Errors) */}
          {blockers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Must Fix ({blockers.length})
              </h4>
              <div className="space-y-2">
                {blockers.map((issue, i) => (
                  <IssueRow key={i} issue={issue} severity="error" />
                ))}
              </div>
            </div>
          )}
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Warnings ({warnings.length})
              </h4>
              <div className="space-y-2">
                {warnings.map((issue, i) => (
                  <IssueRow key={i} issue={issue} severity="warning" />
                ))}
              </div>
            </div>
          )}
          
          {/* All Good */}
          {canPublish && blockers.length === 0 && warnings.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                All validation checks passed. Your survey is ready to collect responses.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          {!canPublish && (
            <Button variant="outline" onClick={onFixIssues}>
              <Wrench className="h-4 w-4 mr-1" />
              Auto-Fix Issues
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={onConfirmPublish}
            disabled={!canPublish || isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Survey'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function IssueRow({ 
  issue, 
  severity 
}: { 
  issue: SurveyIssue; 
  severity: 'error' | 'warning' 
}) {
  const bgColor = severity === 'error' 
    ? 'bg-red-50 border-red-200' 
    : 'bg-yellow-50 border-yellow-200';
  
  return (
    <div className={`p-3 rounded-md border ${bgColor}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm">{issue.message}</p>
        {issue.autoFixable && (
          <Badge variant="outline" className="text-xs">
            Auto-fixable
          </Badge>
        )}
      </div>
      {issue.fixDescription && (
        <p className="text-xs text-muted-foreground mt-1">
          Fix: {issue.fixDescription}
        </p>
      )}
    </div>
  );
}
```

### Step 3: Integrate into Publish Flow

**Modify:** `client/src/components/builder-v2/PublishButton.tsx`

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { usePublishValidation } from '@/hooks/usePublishValidation';
import { PublishValidationDialog } from './PublishValidationDialog';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { useAutoWireScoring } from '@/hooks/useAutoWireScoring';

export function PublishButton() {
  const { survey, saveSurvey, publishSurvey } = useSurveyBuilder();
  const { validate, validationResult } = usePublishValidation();
  const { autoWire } = useAutoWireScoring();
  
  const [showDialog, setShowDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const handlePublishClick = () => {
    // Validate before showing dialog
    validate(survey);
    setShowDialog(true);
  };
  
  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    try {
      await saveSurvey();
      await publishSurvey();
      setShowDialog(false);
      // Show success toast
    } catch (error) {
      console.error('Publish failed:', error);
      // Show error toast
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleFixIssues = () => {
    // Auto-wire to fix issues
    const { survey: fixedSurvey } = autoWire(survey);
    // Update survey in context
    // Re-validate
    validate(fixedSurvey);
  };
  
  return (
    <>
      <Button onClick={handlePublishClick}>
        <Send className="h-4 w-4 mr-2" />
        Publish
      </Button>
      
      <PublishValidationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        result={validationResult}
        onConfirmPublish={handleConfirmPublish}
        onFixIssues={handleFixIssues}
        isPublishing={isPublishing}
      />
    </>
  );
}
```

### Step 4: Add Server-Side Validation

**Modify:** `server/routes/surveys.ts`

```typescript
import { checkSurveyHealth } from '@shared/utils/surveyHealthCheck';

// Add to the publish endpoint
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch survey
    const survey = await storage.getSurvey(id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // VALIDATION GATE: Check health before publishing
    const healthReport = checkSurveyHealth(survey);
    
    if (!healthReport.canPublish) {
      const blockers = healthReport.issues.filter(i => i.type === 'error');
      return res.status(400).json({
        error: 'Survey cannot be published due to configuration issues',
        code: 'VALIDATION_FAILED',
        issues: blockers.map(b => ({
          code: b.code,
          message: b.message,
          autoFixable: b.autoFixable
        }))
      });
    }
    
    // Proceed with publish
    const published = await storage.publishSurvey(id);
    
    // Log for audit
    console.log(`[Survey] Published survey ${id}, health: ${healthReport.status}`);
    
    return res.json({ 
      success: true, 
      survey: published,
      warnings: healthReport.issues.filter(i => i.type === 'warning').length
    });
    
  } catch (error) {
    console.error('[Survey] Publish error:', error);
    return res.status(500).json({ error: 'Failed to publish survey' });
  }
});
```

### Step 5: Handle Server Validation Errors on Client

**Modify:** `client/src/api/surveys.ts`

```typescript
export async function publishSurvey(surveyId: string): Promise<Survey> {
  const response = await fetch(`/api/surveys/${surveyId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    // Handle validation failure specifically
    if (error.code === 'VALIDATION_FAILED') {
      throw new ValidationError(error.error, error.issues);
    }
    
    throw new Error(error.error || 'Failed to publish survey');
  }
  
  return response.json();
}

// Custom error class for validation failures
export class ValidationError extends Error {
  issues: Array<{ code: string; message: string; autoFixable: boolean }>;
  
  constructor(message: string, issues: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
```

---

## Testing Instructions

### Manual Test 1: Block Publish for Broken Survey

1. Create survey with Likert questions
2. Remove all scoring configuration
3. Click "Publish"
4. Verify: Dialog shows with blockers
5. Verify: Publish button is disabled

### Manual Test 2: Allow Publish with Warnings

1. Create survey with valid scoring
2. Remove results screen (warning, not error)
3. Click "Publish"
4. Verify: Dialog shows warning
5. Verify: Publish button is enabled

### Manual Test 3: Auto-Fix from Dialog

1. Create survey with fixable issues
2. Click "Publish" (sees errors)
3. Click "Auto-Fix Issues"
4. Verify: Issues are fixed
5. Verify: Can now publish

### Manual Test 4: Server Rejects Invalid

1. Disable client-side validation temporarily
2. Try to publish broken survey
3. Verify: Server returns 400 with issues
4. Verify: Client shows error message

---

## Acceptance Criteria

- [ ] Client validates before showing publish dialog
- [ ] Blockers (errors) prevent publish
- [ ] Warnings allow publish with acknowledgment
- [ ] "Auto-Fix Issues" button repairs fixable issues
- [ ] Server validates independently (defense in depth)
- [ ] Clear error messages for each issue type

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/hooks/usePublishValidation.ts` | CREATE |
| `client/src/components/builder-v2/PublishValidationDialog.tsx` | CREATE |
| `client/src/components/builder-v2/PublishButton.tsx` | MODIFY |
| `server/routes/surveys.ts` | MODIFY |
| `client/src/api/surveys.ts` | MODIFY |

---

## Next Ticket

→ HARDEN-005: Global Error Boundaries (Week 2)

