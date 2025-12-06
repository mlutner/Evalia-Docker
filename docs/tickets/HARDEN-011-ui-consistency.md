# HARDEN-011: UI Consistency Polish

## Priority: LOW
## Status: Ready
## Time Estimate: 1 day
## Category: UI/UX
## Epic: HARDEN-000

---

## Objective

Quick pass to ensure consistent styling across the application: buttons, spacing, loading states.

---

## Implementation Instructions

### Step 1: Create Consistent Button Variants

**Create:** `client/src/components/ui/consistent-buttons.tsx`

```typescript
/**
 * Consistent Button Presets
 * 
 * Pre-configured button variants for common actions.
 * 
 * [HARDEN-011]
 */

import { Button, ButtonProps } from '@/components/ui/button';
import { 
  Plus, 
  Save, 
  Trash2, 
  Send, 
  RefreshCw, 
  ArrowLeft,
  Download,
  Upload,
  Copy,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { forwardRef } from 'react';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  loading?: boolean;
}

// Primary Actions
export const CreateButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} {...props}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
      Create
    </Button>
  )
);

export const SaveButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} {...props}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
      {loading ? 'Saving...' : 'Save'}
    </Button>
  )
);

export const PublishButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} {...props}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
      {loading ? 'Publishing...' : 'Publish'}
    </Button>
  )
);

// Secondary Actions
export const DeleteButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} variant="destructive" {...props}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
      Delete
    </Button>
  )
);

export const RefreshButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} variant="outline" size="icon" {...props}>
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
    </Button>
  )
);

export const BackButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (props, ref) => (
    <Button ref={ref} variant="ghost" {...props}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  )
);

// Utility Actions
export const CopyButton = forwardRef<HTMLButtonElement, ActionButtonProps & { copied?: boolean }>(
  ({ copied, ...props }, ref) => (
    <Button ref={ref} variant="outline" size="sm" {...props}>
      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  )
);

export const ExportButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} variant="outline" {...props}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Export
    </Button>
  )
);

export const ImportButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ loading, ...props }, ref) => (
    <Button ref={ref} variant="outline" {...props}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
      Import
    </Button>
  )
);

// Cancel/Close
export const CancelButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (props, ref) => (
    <Button ref={ref} variant="ghost" {...props}>
      Cancel
    </Button>
  )
);

export const CloseButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (props, ref) => (
    <Button ref={ref} variant="ghost" size="icon" {...props}>
      <X className="h-4 w-4" />
    </Button>
  )
);
```

### Step 2: Create Spacing Constants

**Create:** `client/src/styles/spacing.ts`

```typescript
/**
 * Spacing Constants
 * 
 * Consistent spacing values for the application.
 * 
 * [HARDEN-011]
 */

// Use Tailwind classes for consistency
export const SPACING = {
  // Page padding
  page: 'px-6 py-8',
  pageCompact: 'px-4 py-4',
  
  // Section spacing
  sectionGap: 'space-y-6',
  sectionGapCompact: 'space-y-4',
  
  // Card padding
  card: 'p-6',
  cardCompact: 'p-4',
  
  // List item gaps
  listGap: 'space-y-2',
  listGapLarge: 'space-y-4',
  
  // Form spacing
  formGap: 'space-y-4',
  formFieldGap: 'space-y-2',
  
  // Button groups
  buttonGroup: 'flex gap-2',
  buttonGroupSpaced: 'flex gap-4',
  
  // Grid gaps
  gridGap: 'gap-4',
  gridGapLarge: 'gap-6'
} as const;

// Common layout patterns
export const LAYOUT = {
  // Centered container
  container: 'container mx-auto max-w-6xl',
  containerNarrow: 'container mx-auto max-w-4xl',
  containerWide: 'container mx-auto max-w-7xl',
  
  // Flex patterns
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-start gap-4',
  
  // Stack patterns
  stack: 'flex flex-col',
  stackGap: 'flex flex-col gap-4'
} as const;
```

### Step 3: Create Loading Components

**Create:** `client/src/components/ui/loading-states.tsx`

```typescript
/**
 * Loading State Components
 * 
 * Consistent loading indicators across the app.
 * 
 * [HARDEN-011]
 */

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Full page loader
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

// Inline loader
export function InlineLoader({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];
  
  return <Loader2 className={`${sizeClass} animate-spin`} />;
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// List skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div style={{ height }} className="flex items-end gap-2 p-4">
      {[40, 65, 45, 80, 55, 70, 50, 90, 60, 75].map((h, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
```

### Step 4: Audit and Apply

Run through these files and ensure consistent usage:

```bash
# Find inconsistent button usage
grep -rn "variant=\"" client/src/pages/ | head -20

# Find raw Loader2 usage (should use LoadingStates)
grep -rn "Loader2" client/src/pages/

# Find inconsistent spacing
grep -rn "space-y-" client/src/pages/ | sort | uniq -c | sort -rn
```

### Step 5: Update Key Pages

Apply consistent patterns to:

1. **HomePage.tsx** - Use `SPACING.page`, `CardSkeleton`
2. **AnalyticsPage.tsx** - Use `ChartSkeleton`, consistent card spacing
3. **SurveyBuilderV2.tsx** - Use `SaveButton`, `PublishButton`
4. **TemplatesPage.tsx** - Use `ListSkeleton`, `CreateButton`

---

## Quick Wins Checklist

- [ ] All save buttons use `SaveButton` with loading state
- [ ] All delete buttons use `DeleteButton` (red)
- [ ] All back buttons use `BackButton` (ghost)
- [ ] Page containers use `SPACING.page`
- [ ] Lists use `SPACING.listGap`
- [ ] Cards use `SPACING.card`
- [ ] Loading states show skeletons, not spinners
- [ ] Button groups use `gap-2`

---

## Acceptance Criteria

- [ ] Consistent button components created
- [ ] Spacing constants defined
- [ ] Loading skeletons for all content types
- [ ] Key pages updated to use patterns
- [ ] No raw `<Loader2>` in pages (use loading components)

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/components/ui/consistent-buttons.tsx` | CREATE |
| `client/src/styles/spacing.ts` | CREATE |
| `client/src/components/ui/loading-states.tsx` | CREATE |
| `client/src/pages/HomePage.tsx` | MODIFY |
| `client/src/pages/AnalyticsPage.tsx` | MODIFY |
| `client/src/pages/SurveyBuilderV2.tsx` | MODIFY |
| `client/src/pages/TemplatesPage.tsx` | MODIFY |

---

## Sprint Complete! 🎉

After completing HARDEN-011, the 3-week hardening sprint is done.

### Summary of What Was Built

**Week 1: Scoring Auto-Wiring**
- Survey health check utility
- Scoring config inference
- Template auto-wire on load
- Publish validation gate

**Week 2: Error Handling**
- Global error boundaries
- Analytics graceful degradation
- User-friendly empty states
- Centralized error logging

**Week 3: Builder Stability**
- Null safety utilities
- Auto-save & crash recovery
- UI consistency polish

### Verification Checklist

Before closing the sprint:
- [ ] All 11 tickets complete
- [ ] npm test passes
- [ ] Manual smoke test of builder
- [ ] Manual smoke test of analytics
- [ ] No white screens on any error
- [ ] Templates auto-wire correctly
- [ ] Auto-save working in builder

