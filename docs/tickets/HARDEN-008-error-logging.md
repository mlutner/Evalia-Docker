# HARDEN-008: Centralized Error Logging

## Priority: MEDIUM
## Status: Ready
## Time Estimate: 1 day
## Category: Observability
## Epic: HARDEN-000
## Depends On: HARDEN-005

---

## Objective

Create a centralized error logging system that captures errors across the application for debugging and monitoring.

---

## Implementation Instructions

### Step 1: Enhance Error Logger

**Modify:** `client/src/utils/errorLogger.ts`

```typescript
/**
 * Centralized Error Logging
 * 
 * Captures and stores errors for debugging.
 * Ready for integration with external services (Sentry, LogRocket, etc.)
 * 
 * [HARDEN-008]
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'error' | 'warning' | 'info';
  handled: boolean;
}

export interface ErrorContext {
  section?: string;
  surveyId?: string;
  userId?: string;
  action?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

// ============================================================================
// STATE
// ============================================================================

const MAX_STORED_ERRORS = 50;
const STORAGE_KEY = 'evalia_error_log';

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export function logError(
  error: Error | string,
  context: ErrorContext = {},
  severity: 'error' | 'warning' | 'info' = 'error'
): string {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  const entry: ErrorLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    message: errorObj.message,
    stack: errorObj.stack?.split('\n').slice(0, 10).join('\n'),
    context: {
      ...context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    },
    severity,
    handled: true
  };
  
  // Console output
  const consoleMethod = severity === 'error' ? console.error : severity === 'warning' ? console.warn : console.log;
  consoleMethod(`[${severity.toUpperCase()}]`, entry.message, entry.context);
  
  // Store locally
  storeError(entry);
  
  // Send to external service in production
  if (import.meta.env.PROD) {
    sendToExternalService(entry);
  }
  
  return entry.id;
}

export function logWarning(message: string, context: ErrorContext = {}): string {
  return logError(message, context, 'warning');
}

export function logInfo(message: string, context: ErrorContext = {}): string {
  return logError(message, context, 'info');
}

// ============================================================================
// STORAGE
// ============================================================================

function storeError(entry: ErrorLogEntry): void {
  try {
    const existing = getStoredErrors();
    existing.unshift(entry);
    
    // Keep only recent errors
    const trimmed = existing.slice(0, MAX_STORED_ERRORS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage might be full or disabled
  }
}

export function getStoredErrors(): ErrorLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearStoredErrors(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getErrorById(id: string): ErrorLogEntry | undefined {
  return getStoredErrors().find(e => e.id === id);
}

// ============================================================================
// EXTERNAL SERVICE INTEGRATION
// ============================================================================

async function sendToExternalService(entry: ErrorLogEntry): Promise<void> {
  // TODO: Integrate with Sentry, LogRocket, or similar
  // Example Sentry integration:
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(new Error(entry.message), {
  //     extra: entry.context,
  //     level: entry.severity
  //   });
  // }
  
  // For now, just log that we would send
  if (import.meta.env.DEV) {
    console.debug('[ErrorLogger] Would send to external service:', entry.id);
  }
}

// ============================================================================
// REACT INTEGRATION
// ============================================================================

export function useErrorLogger() {
  return {
    logError: (error: Error | string, context?: ErrorContext) => logError(error, context),
    logWarning: (message: string, context?: ErrorContext) => logWarning(message, context),
    getErrors: getStoredErrors,
    clearErrors: clearStoredErrors
  };
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

export function setupGlobalErrorHandlers(): void {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { section: 'global', action: 'unhandledrejection' },
      'error'
    );
  });
  
  // Global errors
  window.addEventListener('error', (event) => {
    logError(
      event.error || new Error(event.message),
      { 
        section: 'global', 
        action: 'error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      'error'
    );
  });
  
  console.log('[ErrorLogger] Global handlers installed');
}

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
```

### Step 2: Create Dev Error Viewer

**Create:** `client/src/components/dev/ErrorLogViewer.tsx`

```typescript
/**
 * Error Log Viewer (Dev Only)
 * 
 * Shows stored errors for debugging.
 * 
 * [HARDEN-008]
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { getStoredErrors, clearStoredErrors, type ErrorLogEntry } from '@/utils/errorLogger';

export function ErrorLogViewer() {
  const [errors, setErrors] = useState<ErrorLogEntry[]>(getStoredErrors());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  
  const refresh = () => setErrors(getStoredErrors());
  const clear = () => {
    clearStoredErrors();
    setErrors([]);
  };
  
  const toggleExpanded = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };
  
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Error Log ({errors.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No errors logged</p>
        ) : (
          <div className="space-y-2">
            {errors.map((error) => (
              <div key={error.id} className="border rounded-md">
                <button
                  className="w-full p-3 flex items-start gap-2 text-left hover:bg-muted/50"
                  onClick={() => toggleExpanded(error.id)}
                >
                  {expanded.has(error.id) ? (
                    <ChevronDown className="h-4 w-4 mt-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={severityColor(error.severity) as any}>
                        {error.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm truncate">{error.message}</p>
                  </div>
                </button>
                
                {expanded.has(error.id) && (
                  <div className="p-3 pt-0 space-y-2">
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Context:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                    {error.stack && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Stack:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 3: Install Global Handlers

**Modify:** `client/src/main.tsx`

```typescript
import { setupGlobalErrorHandlers } from './utils/errorLogger';

// Before React renders
setupGlobalErrorHandlers();

// ... rest of main.tsx
```

### Step 4: Add to Dev Tools

**Modify:** `client/src/pages/dev/InspectorPage.tsx` (or create)

```typescript
import { ErrorLogViewer } from '@/components/dev/ErrorLogViewer';

// Add in the dev tools page:
<section className="space-y-4">
  <h2 className="text-xl font-semibold">Error Log</h2>
  <ErrorLogViewer />
</section>
```

---

## Testing Instructions

### Manual Test 1: Log an Error

1. Open console
2. Run: `throw new Error('Test error')`
3. Verify: Error appears in ErrorLogViewer
4. Verify: Error stored in localStorage

### Manual Test 2: Clear Errors

1. Log some errors
2. Open ErrorLogViewer
3. Click Clear button
4. Verify: All errors removed

### Manual Test 3: Unhandled Promise

1. Run: `Promise.reject('test rejection')`
2. Verify: Captured by global handler
3. Verify: Appears in error log

---

## Acceptance Criteria

- [ ] `logError()` stores errors in localStorage
- [ ] Global handlers catch unhandled errors/rejections
- [ ] ErrorLogViewer shows all logged errors
- [ ] Can expand to see stack/context
- [ ] Can clear error history
- [ ] Ready for external service integration

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/utils/errorLogger.ts` | MODIFY (enhance) |
| `client/src/components/dev/ErrorLogViewer.tsx` | CREATE |
| `client/src/main.tsx` | MODIFY |
| `client/src/pages/dev/InspectorPage.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-009: Builder Null Safety Pass (Week 3)

