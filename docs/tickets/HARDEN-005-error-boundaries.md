# HARDEN-005: Global Error Boundaries

## Priority: HIGH
## Status: Ready
## Time Estimate: 1 day
## Category: Error Handling
## Epic: HARDEN-000

---

## Objective

Wrap all major routes in error boundaries so users never see white screens. Show helpful recovery UI instead.

---

## Implementation Instructions

### Step 1: Create Error Boundary Component

**Create:** `client/src/components/ErrorBoundary.tsx`

```typescript
/**
 * Global Error Boundary
 * 
 * Catches React errors and shows recovery UI instead of white screen.
 * 
 * [HARDEN-005]
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Name of the section for better error messages */
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console
    console.error(`[ErrorBoundary${this.props.section ? `:${this.props.section}` : ''}]`, error, errorInfo);
    
    // Store error info
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                {this.props.section 
                  ? `An error occurred in the ${this.props.section} section.`
                  : 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {this.state.error && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mt-4">
                Don't worry, your work is likely saved. Try refreshing the page.
              </p>
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-1" />
                Go Home
              </Button>
              <Button variant="outline" onClick={this.handleRetry}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
              <Button onClick={this.handleRefresh}>
                Refresh Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// HOOK VERSION FOR FUNCTIONAL COMPONENTS
// ============================================================================

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  section?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary section={section}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
```

### Step 2: Create Section-Specific Fallbacks

**Create:** `client/src/components/ErrorFallbacks.tsx`

```typescript
/**
 * Section-Specific Error Fallbacks
 * 
 * Custom error UIs for different parts of the app.
 * 
 * [HARDEN-005]
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Pencil, BarChart3 } from 'lucide-react';

export function BuilderErrorFallback() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <Pencil className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Builder Error</h3>
          <p className="text-muted-foreground mt-2">
            The survey builder encountered an error. Your changes are auto-saved.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reload Builder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalyticsErrorFallback() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Analytics Unavailable</h3>
          <p className="text-muted-foreground mt-2">
            Unable to load analytics. This might be due to missing data or a temporary issue.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PreviewErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="font-semibold text-lg">Preview Error</h3>
          <p className="text-muted-foreground mt-2">
            The survey preview couldn't load. There might be an issue with the survey configuration.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reload Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Wrap Routes in App.tsx

**Modify:** `client/src/App.tsx`

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { 
  BuilderErrorFallback, 
  AnalyticsErrorFallback,
  PreviewErrorFallback 
} from '@/components/ErrorFallbacks';

// ... in the router

// Builder routes
<Route path="/builder/:id">
  {(params) => (
    <ErrorBoundary section="Builder" fallback={<BuilderErrorFallback />}>
      <ProtectedRoute component={() => <SurveyBuilderV2 surveyId={params.id} />} />
    </ErrorBoundary>
  )}
</Route>

// Analytics routes
<Route path="/analytics/:id">
  {(params) => (
    <ErrorBoundary section="Analytics" fallback={<AnalyticsErrorFallback />}>
      <ProtectedRoute component={() => <AnalyticsPage surveyId={params.id} />} />
    </ErrorBoundary>
  )}
</Route>

// Preview routes
<Route path="/preview/:id">
  {(params) => (
    <ErrorBoundary section="Preview" fallback={<PreviewErrorFallback />}>
      <PreviewV2 surveyId={params.id} />
    </ErrorBoundary>
  )}
</Route>

// Survey view (respondent)
<Route path="/survey/:id">
  {(params) => (
    <ErrorBoundary section="Survey" fallback={<PreviewErrorFallback />}>
      <SurveyView surveyId={params.id} />
    </ErrorBoundary>
  )}
</Route>

// Global fallback for everything else
<ErrorBoundary section="App">
  {/* ... rest of routes */}
</ErrorBoundary>
```

### Step 4: Add Error Logging Utility

**Create:** `client/src/utils/errorLogger.ts`

```typescript
/**
 * Error Logging Utility
 * 
 * Centralized error logging for the application.
 * 
 * [HARDEN-005]
 */

interface ErrorContext {
  section?: string;
  surveyId?: string;
  userId?: string;
  action?: string;
  [key: string]: any;
}

export function logError(
  error: Error,
  context: ErrorContext = {}
): void {
  // Always log to console in development
  console.error('[Error]', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // TODO: Integrate with Sentry, LogRocket, etc.
    // Example:
    // Sentry.captureException(error, { extra: context });
  }
  
  // Store in localStorage for debugging (last 10 errors)
  try {
    const errors = JSON.parse(localStorage.getItem('evalia_errors') || '[]');
    errors.unshift({
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      ...context,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('evalia_errors', JSON.stringify(errors.slice(0, 10)));
  } catch {
    // Ignore localStorage errors
  }
}

export function getRecentErrors(): any[] {
  try {
    return JSON.parse(localStorage.getItem('evalia_errors') || '[]');
  } catch {
    return [];
  }
}

export function clearErrors(): void {
  localStorage.removeItem('evalia_errors');
}
```

---

## Testing Instructions

### Manual Test 1: Trigger Error in Builder

1. Temporarily add `throw new Error('Test')` in builder component
2. Navigate to builder
3. Verify: BuilderErrorFallback shows (not white screen)
4. Verify: Console shows error log
5. Click "Reload Builder" - should recover

### Manual Test 2: Trigger Error in Analytics

1. Temporarily break analytics component
2. Navigate to analytics page
3. Verify: AnalyticsErrorFallback shows
4. Click "Try Again" - should attempt recovery

### Manual Test 3: Check Error Logging

1. Open browser console
2. Trigger an error
3. Check localStorage `evalia_errors`
4. Verify: Error is logged with context

---

## Acceptance Criteria

- [ ] ErrorBoundary component catches all React errors
- [ ] Section-specific fallbacks for Builder, Analytics, Preview
- [ ] Users can recover (refresh, go home, try again)
- [ ] Errors are logged to console
- [ ] Error history stored in localStorage
- [ ] No white screens on any error

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/components/ErrorBoundary.tsx` | CREATE |
| `client/src/components/ErrorFallbacks.tsx` | CREATE |
| `client/src/utils/errorLogger.ts` | CREATE |
| `client/src/App.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-006: Analytics Graceful Degradation

