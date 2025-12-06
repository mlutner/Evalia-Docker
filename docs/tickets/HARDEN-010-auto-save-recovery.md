# HARDEN-010: Auto-Save & Recovery

## Priority: MEDIUM
## Status: Ready
## Time Estimate: 2 days
## Category: Data Safety
## Epic: HARDEN-000

---

## Objective

Implement automatic saving and crash recovery to prevent data loss in the builder.

---

## Implementation Instructions

### Step 1: Create Auto-Save Hook

**Create:** `client/src/hooks/useAutoSave.ts`

```typescript
/**
 * Auto-Save Hook
 * 
 * Automatically saves survey data at intervals and on changes.
 * Stores backup in localStorage for crash recovery.
 * 
 * [HARDEN-010]
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Survey } from '@shared/schema';

interface AutoSaveOptions {
  /** Interval between auto-saves in ms */
  interval?: number;
  /** Debounce delay after changes in ms */
  debounceDelay?: number;
  /** Callback to save to server */
  onSave: (survey: Survey) => Promise<void>;
  /** Callback on save error */
  onError?: (error: Error) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
}

const LOCAL_BACKUP_PREFIX = 'evalia_survey_backup_';

export function useAutoSave(
  survey: Survey | null,
  options: AutoSaveOptions
) {
  const {
    interval = 30000, // 30 seconds
    debounceDelay = 2000, // 2 seconds
    onSave,
    onError
  } = options;
  
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  });
  
  const surveyRef = useRef(survey);
  const lastSavedVersionRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const intervalTimerRef = useRef<NodeJS.Timeout>();
  
  // Update ref when survey changes
  useEffect(() => {
    surveyRef.current = survey;
    
    if (survey) {
      const currentVersion = JSON.stringify(survey);
      if (currentVersion !== lastSavedVersionRef.current) {
        setState(s => ({ ...s, hasUnsavedChanges: true }));
        
        // Save to localStorage immediately
        saveToLocalStorage(survey);
        
        // Debounce server save
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          performSave();
        }, debounceDelay);
      }
    }
  }, [survey, debounceDelay]);
  
  // Interval-based auto-save
  useEffect(() => {
    intervalTimerRef.current = setInterval(() => {
      if (state.hasUnsavedChanges && !state.isSaving) {
        performSave();
      }
    }, interval);
    
    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [interval, state.hasUnsavedChanges, state.isSaving]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const performSave = useCallback(async () => {
    const currentSurvey = surveyRef.current;
    if (!currentSurvey || state.isSaving) return;
    
    setState(s => ({ ...s, isSaving: true, error: null }));
    
    try {
      await onSave(currentSurvey);
      
      lastSavedVersionRef.current = JSON.stringify(currentSurvey);
      setState(s => ({
        ...s,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      }));
      
      // Clear local backup on successful save
      clearLocalBackup(currentSurvey.id);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      setState(s => ({ ...s, isSaving: false, error: err }));
      onError?.(err);
    }
  }, [onSave, onError, state.isSaving]);
  
  const forceSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    performSave();
  }, [performSave]);
  
  return {
    ...state,
    forceSave
  };
}

// ============================================================================
// LOCAL STORAGE BACKUP
// ============================================================================

function saveToLocalStorage(survey: Survey): void {
  try {
    const key = `${LOCAL_BACKUP_PREFIX}${survey.id}`;
    const backup = {
      survey,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(backup));
  } catch {
    // Ignore localStorage errors
  }
}

function clearLocalBackup(surveyId: string): void {
  try {
    localStorage.removeItem(`${LOCAL_BACKUP_PREFIX}${surveyId}`);
  } catch {
    // Ignore
  }
}

export function getLocalBackup(surveyId: string): { survey: Survey; timestamp: string } | null {
  try {
    const key = `${LOCAL_BACKUP_PREFIX}${surveyId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function hasNewerLocalBackup(surveyId: string, serverTimestamp: Date): boolean {
  const backup = getLocalBackup(surveyId);
  if (!backup) return false;
  return new Date(backup.timestamp) > serverTimestamp;
}
```

### Step 2: Create Recovery Dialog

**Create:** `client/src/components/builder-v2/RecoveryDialog.tsx`

```typescript
/**
 * Recovery Dialog
 * 
 * Offers to restore from local backup after crash.
 * 
 * [HARDEN-010]
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
import { AlertTriangle, Clock, FileText } from 'lucide-react';
import type { Survey } from '@shared/schema';

interface RecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: {
    survey: Survey;
    timestamp: string;
  };
  serverSurvey: Survey;
  onRestore: () => void;
  onDiscard: () => void;
}

export function RecoveryDialog({
  open,
  onOpenChange,
  backup,
  serverSurvey,
  onRestore,
  onDiscard
}: RecoveryDialogProps) {
  const backupDate = new Date(backup.timestamp);
  const serverDate = new Date(serverSurvey.updatedAt || serverSurvey.createdAt);
  
  const backupQuestionCount = backup.survey.questions?.length || 0;
  const serverQuestionCount = serverSurvey.questions?.length || 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Unsaved Changes Found
          </DialogTitle>
          <DialogDescription>
            We found a local backup that's newer than the saved version.
            Would you like to restore it?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Local Backup */}
          <div className="border rounded-md p-3">
            <h4 className="font-medium flex items-center gap-1 mb-2">
              <FileText className="h-4 w-4" />
              Local Backup
            </h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {backupDate.toLocaleString()}
            </p>
            <p className="text-sm">{backupQuestionCount} questions</p>
          </div>
          
          {/* Server Version */}
          <div className="border rounded-md p-3 bg-muted/50">
            <h4 className="font-medium flex items-center gap-1 mb-2">
              <FileText className="h-4 w-4" />
              Saved Version
            </h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {serverDate.toLocaleString()}
            </p>
            <p className="text-sm">{serverQuestionCount} questions</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onDiscard}>
            Discard Backup
          </Button>
          <Button onClick={onRestore}>
            Restore Backup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 3: Create Save Status Indicator

**Create:** `client/src/components/builder-v2/SaveStatusIndicator.tsx`

```typescript
/**
 * Save Status Indicator
 * 
 * Shows current save status in builder header.
 * 
 * [HARDEN-010]
 */

import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
}

export function SaveStatusIndicator({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error
}: SaveStatusIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center gap-1 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>Save failed</span>
      </div>
    );
  }
  
  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }
  
  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-1 text-sm text-yellow-600">
        <CloudOff className="h-4 w-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }
  
  if (lastSaved) {
    return (
      <div className="flex items-center gap-1 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Saved {formatTimeAgo(lastSaved)}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Cloud className="h-4 w-4" />
      <span>All changes saved</span>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return date.toLocaleTimeString();
}
```

### Step 4: Integrate into Builder

**Modify:** `client/src/pages/SurveyBuilderV2.tsx`

```typescript
import { useAutoSave, getLocalBackup, hasNewerLocalBackup } from '@/hooks/useAutoSave';
import { RecoveryDialog } from '@/components/builder-v2/RecoveryDialog';
import { SaveStatusIndicator } from '@/components/builder-v2/SaveStatusIndicator';

export function SurveyBuilderV2({ surveyId }: { surveyId: string }) {
  const { survey, setSurvey, saveSurvey } = useSurveyBuilder();
  const [showRecovery, setShowRecovery] = useState(false);
  const [localBackup, setLocalBackup] = useState<any>(null);
  
  // Check for local backup on mount
  useEffect(() => {
    if (survey && surveyId) {
      const backup = getLocalBackup(surveyId);
      if (backup && hasNewerLocalBackup(surveyId, new Date(survey.updatedAt))) {
        setLocalBackup(backup);
        setShowRecovery(true);
      }
    }
  }, [surveyId, survey?.updatedAt]);
  
  // Auto-save
  const saveStatus = useAutoSave(survey, {
    interval: 30000,
    debounceDelay: 2000,
    onSave: async (s) => {
      await saveSurvey(s);
    },
    onError: (error) => {
      console.error('[Builder] Auto-save failed:', error);
    }
  });
  
  const handleRestore = () => {
    if (localBackup) {
      setSurvey(localBackup.survey);
      setShowRecovery(false);
    }
  };
  
  const handleDiscard = () => {
    setShowRecovery(false);
    // Backup will be cleared on next successful save
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header with save status */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <h1>{survey?.title || 'Survey Builder'}</h1>
        <SaveStatusIndicator {...saveStatus} />
      </header>
      
      {/* Builder content */}
      <main className="flex-1">
        {/* ... existing builder UI */}
      </main>
      
      {/* Recovery dialog */}
      {localBackup && (
        <RecoveryDialog
          open={showRecovery}
          onOpenChange={setShowRecovery}
          backup={localBackup}
          serverSurvey={survey!}
          onRestore={handleRestore}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  );
}
```

---

## Testing Instructions

### Manual Test 1: Auto-Save

1. Open builder
2. Make changes
3. Wait 30 seconds
4. Verify: "Saved" indicator appears
5. Refresh page
6. Verify: Changes persisted

### Manual Test 2: Crash Recovery

1. Open builder
2. Make changes
3. Close tab WITHOUT saving (kill process)
4. Reopen builder
5. Verify: Recovery dialog appears
6. Click "Restore Backup"
7. Verify: Changes restored

### Manual Test 3: Save Status

1. Make a change
2. Verify: "Unsaved changes" shows immediately
3. Wait 2 seconds (debounce)
4. Verify: "Saving..." appears
5. Verify: "Saved just now" appears

---

## Acceptance Criteria

- [ ] Auto-saves every 30 seconds if changes exist
- [ ] Debounces rapid changes (2 second delay)
- [ ] Shows save status in header
- [ ] Stores backup in localStorage
- [ ] Offers recovery after crash
- [ ] User can restore or discard backup
- [ ] Clears backup after successful save

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/hooks/useAutoSave.ts` | CREATE |
| `client/src/components/builder-v2/RecoveryDialog.tsx` | CREATE |
| `client/src/components/builder-v2/SaveStatusIndicator.tsx` | CREATE |
| `client/src/pages/SurveyBuilderV2.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-011: UI Consistency Polish

