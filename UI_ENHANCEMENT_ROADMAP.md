# Evalia Survey - UI/UX Enhancement Roadmap

## Overview
This document outlines potential improvements based on UI/UX best practices, industry research, and feature parity with leading survey platforms (Typeform, SurveyMonkey, Qualtrics, Tally, Formsort).

---

## 1. API Endpoint Connectivity Audit

### Current Status
| Endpoint Category | Status | Notes |
|-------------------|--------|-------|
| Survey CRUD | ✅ Connected | `/api/surveys/*` |
| Response submission | ✅ Connected | `/api/surveys/:id/responses` |
| AI generation | ✅ Connected | `/api/ai/generate` |
| AI refinement | ✅ Connected | `/api/ai/refine` |
| AI scoring | ⚠️ Partial | Needs frontend integration |
| Templates | ✅ Connected | `/api/templates` |
| User auth | ✅ Connected | Replit Auth |
| File upload | ✅ Connected | `/api/ai/generate-from-file` |
| Analytics | ⚠️ Partial | Basic charts, needs enhancement |
| Webhooks | 🔴 Not implemented | Schema exists, no triggers |

### Action Items
- [ ] Implement webhook firing on response submission
- [ ] Add real-time response notifications (WebSocket/SSE)
- [ ] Create analytics API with aggregations
- [ ] Add export endpoints (CSV, PDF, Excel)

---

## 2. CSS/Styling Improvements

### Current Issues
- Inline styles mixed with Tailwind
- Inconsistent color usage (hex vs theme tokens)
- Limited dark mode support
- Mobile responsiveness gaps

### Recommendations

#### Short-term
```css
/* Use CSS variables consistently */
:root {
  --evalia-primary: #2F8FA5;
  --evalia-secondary: #37C0A3;
  --evalia-accent: #A3D65C;
  --evalia-bg: #F7F9FC;
  --evalia-border: #E2E7EF;
  --evalia-text: #1C2635;
  --evalia-text-muted: #6A7789;
}
```

#### Long-term
- Migrate all inline styles to Tailwind utilities
- Create component-level CSS modules for complex components
- Implement CSS-in-JS solution (styled-components or Emotion) for dynamic styles
- Add Tailwind dark mode variants

### Component Library Enhancements
- [ ] Create consistent button variants (primary, secondary, ghost, danger)
- [ ] Standardize card shadows and borders
- [ ] Implement skeleton loaders for all async content
- [ ] Add micro-animations for interactions

---

## 3. UI/UX Improvements

### Survey Taking Experience

#### Current Pain Points
- Long surveys feel overwhelming
- No progress saving
- Limited accessibility
- No keyboard navigation

#### Enhancements
| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Auto-save progress | High | Medium | High |
| Question branching visualization | High | High | High |
| Keyboard shortcuts (Enter to advance) | High | Low | Medium |
| Accessibility audit (WCAG 2.1) | High | Medium | High |
| Estimated time display | Medium | Low | Medium |
| Progress bar with question count | Medium | Low | Medium |
| "Save and continue later" | Medium | Medium | High |
| Mobile gesture support (swipe) | Low | Medium | Medium |

### Survey Builder Experience

#### Current Pain Points
- Question reordering is functional but not intuitive
- Limited preview options
- No undo/redo
- No bulk operations

#### Enhancements
| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Visual question flow editor | High | High | Very High |
| Undo/redo support | High | Medium | High |
| Bulk select/edit/delete | Medium | Medium | Medium |
| Question templates/snippets | Medium | Medium | High |
| Real-time collaboration | Low | Very High | Medium |
| Version history | Low | High | Medium |

---

## 4. Smart Question Features

### 4.1 Predictive/Suggested Questions

**Concept:** AI suggests follow-up questions based on:
- Survey topic
- Existing questions
- Response patterns
- Industry best practices

**Implementation:**
```typescript
// Add to aiService.ts
export async function suggestNextQuestions(
  existingQuestions: Question[],
  surveyTopic: string,
  targetAudience?: string
): Promise<{
  suggestions: Array<{
    question: Question;
    rationale: string;
    confidence: number;
  }>;
}> {
  // AI prompt to analyze gaps and suggest
}
```

**UI Integration:**
- "Add AI Suggestion" button in builder
- Sidebar panel with question recommendations
- Context-aware suggestions based on cursor position

### 4.2 Adaptive Question Algorithm

**Concept:** Dynamically adjust survey based on responses

**Features:**
- Skip irrelevant questions based on prior answers
- Show follow-up questions based on scores
- Adjust difficulty/depth based on expertise signals

**Implementation:**
```typescript
interface AdaptiveRule {
  condition: {
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number;
  };
  action: 'show' | 'hide' | 'skip' | 'branch';
  targetQuestionIds: string[];
}

// Add to questionSchema
adaptiveRules: z.array(adaptiveRuleSchema).optional();
```

### 4.3 Question Quality Scoring

**Current:** Basic feedback in `QuestionQualityFeedback.tsx`

**Enhancements:**
- Real-time clarity score (readability metrics)
- Bias detection (leading questions)
- Option balance analysis
- Similar question detection (avoid redundancy)
- Response prediction (estimated completion rate)

---

## 5. Drag-and-Drop Builder Assessment

### Current State
Using `@dnd-kit/sortable` for question reordering.

### Advanced Drag-and-Drop Requirements

#### Visual Flow Builder (Like Typeform Logic)
**Difficulty: HIGH (3-4 weeks)**

**Components Needed:**
| Library | Purpose | Learning Curve |
|---------|---------|----------------|
| `reactflow` | Node-based flow editor | Medium |
| `@dnd-kit/core` | Drag-and-drop primitives | Low (already using) |
| `zustand` | State management for complex flows | Low |
| `dagre` | Auto-layout for flow graphs | Medium |

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│  Survey Flow Canvas (ReactFlow)                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │ Start   │───▶│ Q1      │───▶│ Q2      │         │
│  │ Node    │    │ (Rating)│    │(Choice) │         │
│  └─────────┘    └─────────┘    └────┬────┘         │
│                                      │              │
│                      ┌───────────────┼───────────┐  │
│                      ▼               ▼           ▼  │
│               ┌─────────┐    ┌─────────┐  ┌──────┐ │
│               │ Q3a     │    │ Q3b     │  │ End  │ │
│               │(if Yes) │    │(if No)  │  │ Node │ │
│               └─────────┘    └─────────┘  └──────┘ │
└─────────────────────────────────────────────────────┘
```

**Recommended Libraries:**
```json
{
  "dependencies": {
    "reactflow": "^11.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "zustand": "^4.x",
    "immer": "^10.x"
  }
}
```

#### Simple Block Builder (Like Notion/Tally)
**Difficulty: MEDIUM (1-2 weeks)**

**Components Needed:**
| Component | Purpose |
|-----------|---------|
| `DndContext` | Drag container |
| `SortableContext` | Reorderable list |
| `DragOverlay` | Visual feedback |
| Custom `QuestionBlock` | Draggable question |
| `BlockToolbar` | Insert new blocks |

**Current Implementation Gap:**
- Missing drag handles visual feedback
- No drag preview styling
- No insertion indicator (line between items)
- No multi-select drag

### Recommendation
**Start with Enhanced Block Builder** → then add Flow Visualization

---

## 6. Question Database Feature

### Concept
A reusable library of pre-built, validated questions organized by:
- Category (Training, HR, Customer Feedback, etc.)
- Question type
- Industry
- Validation status

### Database Schema
```sql
-- Add new table for question library
CREATE TABLE question_library (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id), -- NULL for global/system questions
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type VARCHAR NOT NULL,
  options JSONB,
  description TEXT,
  
  -- Metadata
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  tags JSONB DEFAULT '[]',
  industry VARCHAR,
  
  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validation_score NUMERIC,
  usage_count INTEGER DEFAULT 0,
  average_completion_rate NUMERIC,
  
  -- Configuration
  default_config JSONB, -- ratingScale, ratingStyle, etc.
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast category/tag searches
CREATE INDEX idx_question_library_category ON question_library(category);
CREATE INDEX idx_question_library_tags ON question_library USING GIN(tags);
```

### Integration Points

1. **Survey Builder**
   - "Browse Question Library" button
   - Search/filter by category, type, tags
   - One-click add to survey
   - Customize after adding

2. **AI Generation**
   - AI references library for inspiration
   - Suggests existing validated questions
   - Learns from high-performing questions

3. **Admin Panel**
   - CRUD for library questions
   - Bulk import from CSV
   - Analytics on question usage

### Pre-populated Categories
```typescript
const QUESTION_CATEGORIES = {
  training: {
    label: "Training & Development",
    subcategories: [
      "Pre-training assessment",
      "Post-training evaluation",
      "Knowledge check",
      "Trainer feedback",
      "Content quality"
    ]
  },
  hr: {
    label: "Human Resources",
    subcategories: [
      "Employee engagement",
      "Performance review",
      "Onboarding feedback",
      "Exit interview",
      "Culture assessment"
    ]
  },
  customer: {
    label: "Customer Feedback",
    subcategories: [
      "Product satisfaction",
      "Service quality",
      "NPS & loyalty",
      "Feature requests",
      "Support experience"
    ]
  },
  // ... more categories
};
```

---

## 7. NPS Best Practices (Implemented)

### Changes Made
✅ **Horizontal Layout:** All 11 buttons (0-10) now display horizontally
✅ **Color Coding:** 
  - Detractors (0-6): Red
  - Passives (7-8): Yellow
  - Promoters (9-10): Green
✅ **Responsive:** Flexbox with wrapping on mobile
✅ **Labels:** Clear endpoint labels below scale
✅ **Selection Feedback:** Shows selected value with zone indicator

### Additional NPS Enhancements (Future)
- [ ] Animated selection transitions
- [ ] Follow-up question trigger (Why did you give this score?)
- [ ] Historical score comparison display
- [ ] Benchmark comparison (industry average)

---

## 8. AI Builder Parameter Access

### Current Coverage
The AI prompt now includes all 27 question types with their parameters:

| Category | Types Included | Parameters |
|----------|----------------|------------|
| Text | text, textarea, email, phone, url, number | placeholder, validation |
| Selection | multiple_choice, checkbox, dropdown, yes_no | options, displayStyle |
| Rating | rating, nps, likert, opinion_scale, slider | scale, style, labels, min/max |
| Advanced | matrix, ranking, constant_sum | rowLabels, colLabels, totalPoints |
| Structural | section, statement, legal | N/A |

### Verification Checklist
- [x] `generateSurveyFromText` knows all types
- [x] `refineSurvey` can modify all parameters
- [ ] `suggestScoringConfig` handles new scorable types
- [ ] Response analysis handles new answer formats

---

## 9. Additional Research-Based Enhancements

### 9.1 From Typeform
| Feature | Benefit | Effort |
|---------|---------|--------|
| One question at a time | Focus, higher completion | Low |
| Background images/videos | Engagement | Medium |
| Calculator/score display | Gamification | Medium |
| Conditional thank-you | Personalization | Low |

### 9.2 From SurveyMonkey
| Feature | Benefit | Effort |
|---------|---------|--------|
| Question bank | Faster creation | Medium |
| A/B testing questions | Optimization | High |
| Benchmarking | Context for results | High |
| Multi-language | Global reach | High |

### 9.3 From Qualtrics
| Feature | Benefit | Effort |
|---------|---------|--------|
| Advanced logic builder | Complex surveys | High |
| Heat maps | Visual analysis | Medium |
| Text analytics | AI insights | Medium |
| Panel integration | Recruitment | High |

### 9.4 From Tally/Formsort
| Feature | Benefit | Effort |
|---------|---------|--------|
| No-code integrations | Workflow | Medium |
| Partial submissions | Data recovery | Medium |
| Custom CSS | Branding | Low |
| File uploads | Rich responses | Low |

---

## 10. Implementation Priority Matrix

### Phase 1: Quick Wins (1-2 weeks)
- [x] Fix NPS horizontal display
- [x] Update AI with all question types
- [ ] Add keyboard navigation (Enter to advance)
- [ ] Improve drag-and-drop visual feedback
- [ ] Add progress auto-save (localStorage)

### Phase 2: Core Improvements (3-4 weeks)
- [ ] Question library database + UI
- [ ] Enhanced drag-and-drop builder
- [ ] Undo/redo in builder
- [ ] Real-time preview improvements
- [ ] Response analytics enhancements

### Phase 3: Advanced Features (6-8 weeks)
- [ ] Visual flow builder (ReactFlow)
- [ ] AI predictive questions
- [ ] Adaptive questioning algorithm
- [ ] Webhooks and integrations
- [ ] Multi-language support

### Phase 4: Enterprise Features (Future)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Custom branding/white-label
- [ ] API for external integrations
- [ ] SSO/enterprise auth

---

## 11. Technical Debt to Address

| Item | Impact | Effort |
|------|--------|--------|
| Consolidate inline styles → Tailwind | High | Medium |
| Add comprehensive error boundaries | High | Low |
| Implement proper form validation (zod) | High | Medium |
| Add E2E tests for critical paths | High | High |
| Optimize bundle size (code splitting) | Medium | Medium |
| Add proper logging/monitoring | Medium | Medium |

---

## Summary

The most impactful immediate improvements are:
1. **Question Library** - Speeds up survey creation dramatically
2. **Enhanced Drag-and-Drop** - Better builder UX
3. **AI Predictive Questions** - Unique differentiator
4. **Response Analytics** - Value for survey creators

The foundation is solid. Focus on **Phase 1 & 2** to deliver the most value with reasonable effort.

