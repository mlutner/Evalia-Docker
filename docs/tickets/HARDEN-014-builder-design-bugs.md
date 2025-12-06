# HARDEN-014: Builder Design Bugs

## Priority: HIGH
## Status: Ready
## Time Estimate: 2 days
## Category: Builder UI
## Epic: HARDEN-000

---

## Problem Statement

The builder has accumulated design bugs that affect usability. This ticket addresses the most impactful UI/UX issues.

---

## Known Issues to Fix

### Issue 1: Question Panel Overflow

**Problem:** Question list overflows container when many questions added.

**Fix:**

```typescript
// In client/src/components/builder-v2/QuestionsPanel.tsx
<div className="flex flex-col h-full">
  {/* Header - fixed */}
  <div className="p-4 border-b flex-shrink-0">
    <h3 className="font-medium">Questions</h3>
  </div>
  
  {/* Question list - scrollable */}
  <div className="flex-1 overflow-y-auto p-4">
    <QuestionList questions={questions} />
  </div>
  
  {/* Add button - fixed at bottom */}
  <div className="p-4 border-t flex-shrink-0">
    <Button onClick={onAddQuestion} className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Add Question
    </Button>
  </div>
</div>
```

### Issue 2: Editor Panel Not Updating

**Problem:** Editor panel doesn't update when selecting different questions.

**Fix:**

```typescript
// In client/src/components/builder-v2/QuestionEditor.tsx

// Add key to force re-render on question change
<QuestionEditor 
  key={`question-${selectedQuestionIndex}-${selectedQuestion?.id}`}
  question={selectedQuestion}
  onUpdate={handleUpdate}
/>

// Or use useEffect to sync state
useEffect(() => {
  if (question) {
    setLocalText(question.text || '');
    setLocalOptions(question.options || []);
  }
}, [question?.id, question?.text, question?.options]);
```

### Issue 3: Drag and Drop Jank

**Problem:** Dragging questions causes visual glitches.

**Fix:**

```typescript
// In DraggableQuestionList.tsx

// Add smooth transitions
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 }
};

// Add drag preview styling
<div 
  className={cn(
    "transition-all duration-200",
    isDragging && "opacity-50 scale-95",
    isOver && "ring-2 ring-primary"
  )}
>
```

### Issue 4: Sidebar Collapse Broken

**Problem:** Collapsing sidebar doesn't resize main content.

**Fix:**

```typescript
// In client/src/pages/SurveyBuilderV2.tsx

const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

return (
  <div className="flex h-screen">
    {/* Sidebar */}
    <div 
      className={cn(
        "border-r transition-all duration-300",
        sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      <QuestionsPanel />
    </div>
    
    {/* Main content - should expand */}
    <div className="flex-1 flex flex-col min-w-0">
      <BuilderHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <QuestionEditor />
    </div>
  </div>
);
```

### Issue 5: Form Controls Misaligned

**Problem:** Input labels and fields not aligned consistently.

**Fix:**

```typescript
// Create consistent form field component
// client/src/components/builder-v2/FormField.tsx

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// Usage
<FormField label="Question Text" required>
  <Textarea 
    value={text} 
    onChange={(e) => setText(e.target.value)}
    placeholder="Enter your question..."
  />
</FormField>
```

### Issue 6: Modal/Dialog Z-Index Issues

**Problem:** Modals appear behind other elements.

**Fix:**

```css
/* In global CSS or Tailwind config */
.modal-overlay {
  @apply fixed inset-0 z-50 bg-black/50;
}

.modal-content {
  @apply fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
}

/* Or ensure Dialog uses Portal */
```

```typescript
// Ensure all dialogs use Radix properly
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';

<Dialog>
  <DialogPortal>
    <DialogContent className="z-50">
      {/* Content */}
    </DialogContent>
  </DialogPortal>
</Dialog>
```

### Issue 7: Preview Button Not Working

**Problem:** Preview button doesn't open preview or opens blank.

**Fix:**

```typescript
// In BuilderHeader.tsx

const handlePreview = () => {
  // Ensure survey is saved before preview
  if (hasUnsavedChanges) {
    toast({
      title: "Saving...",
      description: "Saving your changes before preview"
    });
    
    saveSurvey().then(() => {
      // Open preview in new tab
      window.open(`/preview/${surveyId}`, '_blank');
    });
  } else {
    window.open(`/preview/${surveyId}`, '_blank');
  }
};

<Button variant="outline" onClick={handlePreview}>
  <Eye className="h-4 w-4 mr-2" />
  Preview
</Button>
```

### Issue 8: Scoring Panel Toggle

**Problem:** Scoring panel doesn't expand/collapse smoothly.

**Fix:**

```typescript
// In ScoringPanel.tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

<Collapsible open={expanded} onOpenChange={setExpanded}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between">
      <span>Scoring Configuration</span>
      <ChevronDown className={cn(
        "h-4 w-4 transition-transform",
        expanded && "rotate-180"
      )} />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-4 pt-4">
    {/* Scoring options */}
  </CollapsibleContent>
</Collapsible>
```

---

## Implementation Checklist

### Day 1: Layout & Structure

- [ ] Fix question panel overflow (Issue 1)
- [ ] Fix sidebar collapse (Issue 4)
- [ ] Fix z-index issues (Issue 6)
- [ ] Test responsive behavior

### Day 2: Interactions & Polish

- [ ] Fix editor not updating (Issue 2)
- [ ] Fix drag and drop jank (Issue 3)
- [ ] Fix form field alignment (Issue 5)
- [ ] Fix preview button (Issue 7)
- [ ] Fix scoring panel toggle (Issue 8)

---

## Testing Instructions

### Manual Test 1: Question Panel

1. Add 20+ questions
2. Verify: List scrolls, header/footer fixed
3. Verify: No content clipping

### Manual Test 2: Sidebar Toggle

1. Click collapse button
2. Verify: Sidebar collapses smoothly
3. Verify: Main content expands
4. Click again to expand
5. Verify: Layout restores

### Manual Test 3: Editor Updates

1. Select question 1
2. Verify: Editor shows Q1 content
3. Select question 2
4. Verify: Editor updates to Q2 content
5. Edit Q2 content
6. Select Q1
7. Verify: Q2 changes saved, Q1 shows original

### Manual Test 4: Preview Flow

1. Make unsaved changes
2. Click Preview
3. Verify: Changes saved
4. Verify: Preview opens in new tab
5. Verify: Preview shows current questions

---

## Acceptance Criteria

- [ ] Question panel scrolls without overflow
- [ ] Editor updates when selecting questions
- [ ] Drag and drop works smoothly
- [ ] Sidebar collapse/expand works
- [ ] Form fields consistently aligned
- [ ] No z-index/layering issues
- [ ] Preview button works
- [ ] Scoring panel expands/collapses

---

## Files Modified

| File | Issues Fixed |
|------|-------------|
| `client/src/components/builder-v2/QuestionsPanel.tsx` | 1 |
| `client/src/components/builder-v2/QuestionEditor.tsx` | 2, 5 |
| `client/src/components/builder-v2/DraggableQuestionList.tsx` | 3 |
| `client/src/pages/SurveyBuilderV2.tsx` | 4 |
| `client/src/components/builder-v2/BuilderHeader.tsx` | 7 |
| `client/src/components/builder-v2/ScoringPanel.tsx` | 8 |
| `client/src/components/builder-v2/FormField.tsx` | 5 (new) |
| Global CSS / Dialog components | 6 |

---

## Related Issues

- HARDEN-009: Builder Null Safety Pass
- HARDEN-010: Auto-Save & Recovery
- HARDEN-011: UI Consistency Polish

