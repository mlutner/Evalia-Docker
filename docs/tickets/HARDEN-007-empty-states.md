# HARDEN-007: User-Friendly Empty States

## Priority: MEDIUM
## Status: Ready
## Time Estimate: 1 day
## Category: UX
## Epic: HARDEN-000

---

## Objective

Every list, table, and data display should have a helpful empty state that tells users what to do next. No blank screens.

---

## Implementation Instructions

### Step 1: Create Empty State Component Library

**Create:** `client/src/components/EmptyStates.tsx`

```typescript
/**
 * Empty State Components
 * 
 * Reusable empty states for different contexts.
 * 
 * [HARDEN-007]
 */

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileQuestion, 
  BarChart3, 
  Users, 
  ClipboardList,
  MessageSquare,
  PlusCircle,
  Send,
  Search
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex gap-2 mt-4">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PRE-BUILT EMPTY STATES
// ============================================================================

export function NoSurveysEmpty({ onCreateSurvey }: { onCreateSurvey: () => void }) {
  return (
    <EmptyState
      icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
      title="No surveys yet"
      description="Create your first survey to start collecting feedback from your team."
      action={{
        label: "Create Survey",
        onClick: onCreateSurvey
      }}
    />
  );
}

export function NoResponsesEmpty({ onShareSurvey }: { onShareSurvey?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="Waiting for responses"
      description="Share your survey link to start collecting responses. Analytics will appear here."
      action={onShareSurvey ? {
        label: "Share Survey",
        onClick: onShareSurvey
      } : undefined}
    />
  );
}

export function NoAnalyticsEmpty({ surveyId }: { surveyId?: string }) {
  return (
    <EmptyState
      icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
      title="No analytics data"
      description="Analytics will be available once you have completed survey responses."
    />
  );
}

export function NoQuestionsEmpty({ onAddQuestion }: { onAddQuestion: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
      title="No questions yet"
      description="Add questions to your survey using the panel on the left."
      action={{
        label: "Add Question",
        onClick: onAddQuestion
      }}
    />
  );
}

export function NoTemplatesEmpty({ onBrowseTemplates }: { onBrowseTemplates?: () => void }) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-8 w-8 text-muted-foreground" />}
      title="No templates found"
      description="Browse our template library to get started quickly."
      action={onBrowseTemplates ? {
        label: "Browse Templates",
        onClick: onBrowseTemplates
      } : undefined}
    />
  );
}

export function NoSearchResultsEmpty({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={{
        label: "Clear Search",
        onClick: onClear
      }}
    />
  );
}

export function ScoringNotEnabledEmpty({ onConfigureScoring }: { onConfigureScoring?: () => void }) {
  return (
    <EmptyState
      icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
      title="Scoring not enabled"
      description="Enable scoring in the survey builder to see analytics and insights."
      action={onConfigureScoring ? {
        label: "Configure Scoring",
        onClick: onConfigureScoring
      } : undefined}
    />
  );
}

export function SurveyNotPublishedEmpty({ onPublish }: { onPublish?: () => void }) {
  return (
    <EmptyState
      icon={<Send className="h-8 w-8 text-muted-foreground" />}
      title="Survey not published"
      description="Publish your survey to start collecting responses."
      action={onPublish ? {
        label: "Publish Survey",
        onClick: onPublish
      } : undefined}
    />
  );
}
```

### Step 2: Update Home/Dashboard Page

**Modify:** `client/src/pages/HomePage.tsx`

```typescript
import { NoSurveysEmpty } from '@/components/EmptyStates';

// In the surveys list section:
{surveys.length === 0 ? (
  <NoSurveysEmpty onCreateSurvey={() => navigate('/builder/new')} />
) : (
  <SurveyList surveys={surveys} />
)}
```

### Step 3: Update Builder Questions Panel

**Modify:** `client/src/components/builder-v2/QuestionsPanel.tsx`

```typescript
import { NoQuestionsEmpty } from '@/components/EmptyStates';

// In the questions list:
{questions.length === 0 ? (
  <NoQuestionsEmpty onAddQuestion={handleAddQuestion} />
) : (
  <QuestionList questions={questions} />
)}
```

### Step 4: Update Templates Page

**Modify:** `client/src/pages/TemplatesPage.tsx`

```typescript
import { NoTemplatesEmpty, NoSearchResultsEmpty } from '@/components/EmptyStates';

// For search results:
{searchQuery && filteredTemplates.length === 0 ? (
  <NoSearchResultsEmpty query={searchQuery} onClear={() => setSearchQuery('')} />
) : templates.length === 0 ? (
  <NoTemplatesEmpty />
) : (
  <TemplateGrid templates={filteredTemplates} />
)}
```

### Step 5: Update Response List

**Modify:** `client/src/components/ResponseList.tsx` (or similar)

```typescript
import { NoResponsesEmpty } from '@/components/EmptyStates';

// In the responses section:
{responses.length === 0 ? (
  <NoResponsesEmpty onShareSurvey={() => setShowShareDialog(true)} />
) : (
  <ResponseTable responses={responses} />
)}
```

---

## Testing Instructions

### Manual Test 1: Empty Survey List

1. Create new account or clear surveys
2. Navigate to home
3. Verify: "No surveys yet" with "Create Survey" button
4. Click button
5. Verify: Navigates to builder

### Manual Test 2: Empty Analytics

1. Create survey with scoring
2. Don't submit responses
3. Go to analytics
4. Verify: "Waiting for responses" message

### Manual Test 3: Empty Search

1. Go to templates
2. Search for "xyznonexistent"
3. Verify: "No results found" with "Clear Search"
4. Click clear
5. Verify: Shows all templates

---

## Acceptance Criteria

- [ ] Empty states exist for: surveys, responses, analytics, questions, templates
- [ ] Each empty state has icon + title + description
- [ ] Primary action button where appropriate
- [ ] No blank white spaces anywhere
- [ ] Messages are helpful and guide user

---

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/components/EmptyStates.tsx` | CREATE |
| `client/src/pages/HomePage.tsx` | MODIFY |
| `client/src/pages/TemplatesPage.tsx` | MODIFY |
| `client/src/pages/AnalyticsPage.tsx` | MODIFY |
| `client/src/components/builder-v2/QuestionsPanel.tsx` | MODIFY |
| `client/src/components/ResponseList.tsx` | MODIFY |

---

## Next Ticket

→ HARDEN-008: Centralized Error Logging

