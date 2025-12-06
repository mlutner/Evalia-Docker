# HARDEN-001: Survey Health Check Utility

## Priority: CRITICAL
## Status: Ready
## Time Estimate: 1 day
## Category: Scoring Infrastructure
## Epic: HARDEN-000

---

## Objective

Create a centralized utility that diagnoses survey configuration issues BEFORE they cause runtime failures.

---

## Implementation Instructions

### Step 1: Create the Health Check File

**Create:** `shared/utils/surveyHealthCheck.ts`

```typescript
/**
 * Survey Health Check Utility
 * 
 * Diagnoses survey configuration issues before they cause runtime failures.
 * Used by: template loader, publish gate, builder sidebar, dev tools
 * 
 * [HARDEN-001]
 */

import type { Survey, Question, SurveyScoreConfig } from '../schema';

// ============================================================================
// TYPES
// ============================================================================

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface SurveyIssue {
  type: IssueSeverity;
  code: string;
  message: string;
  questionId?: string;
  categoryId?: string;
  autoFixable?: boolean;
  fixDescription?: string;
}

export interface SurveyHealthReport {
  surveyId: string;
  status: 'healthy' | 'warning' | 'error';
  issues: SurveyIssue[];
  canPublish: boolean;
  canShowAnalytics: boolean;
  summary: {
    errors: number;
    warnings: number;
    autoFixable: number;
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function checkSurveyHealth(survey: Survey): SurveyHealthReport {
  const issues: SurveyIssue[] = [];
  
  // Run all checks
  checkBasicStructure(survey, issues);
  checkScoringConfiguration(survey, issues);
  checkQuestionScoring(survey, issues);
  checkCategoryMappings(survey, issues);
  checkBandConfiguration(survey, issues);
  checkResultsScreen(survey, issues);
  
  // Compute summary
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const autoFixable = issues.filter(i => i.autoFixable);
  
  return {
    surveyId: survey.id,
    status: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy',
    issues,
    canPublish: errors.length === 0,
    canShowAnalytics: errors.filter(e => e.code.startsWith('SCORING_')).length === 0,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      autoFixable: autoFixable.length
    }
  };
}

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

function checkBasicStructure(survey: Survey, issues: SurveyIssue[]): void {
  // No questions
  if (!survey.questions || survey.questions.length === 0) {
    issues.push({
      type: 'error',
      code: 'STRUCTURE_NO_QUESTIONS',
      message: 'Survey has no questions'
    });
    return;
  }
  
  // No title
  if (!survey.title || survey.title.trim() === '' || survey.title === 'Untitled Survey') {
    issues.push({
      type: 'warning',
      code: 'STRUCTURE_NO_TITLE',
      message: 'Survey needs a descriptive title',
      autoFixable: false
    });
  }
  
  // Check for duplicate question IDs
  const questionIds = survey.questions.map(q => q.id);
  const duplicates = questionIds.filter((id, i) => questionIds.indexOf(id) !== i);
  if (duplicates.length > 0) {
    issues.push({
      type: 'error',
      code: 'STRUCTURE_DUPLICATE_IDS',
      message: `Duplicate question IDs found: ${duplicates.join(', ')}`
    });
  }
}

function checkScoringConfiguration(survey: Survey, issues: SurveyIssue[]): void {
  const scoreConfig = survey.scoreConfig;
  
  // Scoring not enabled - just info, not an error
  if (!scoreConfig?.enabled) {
    issues.push({
      type: 'info',
      code: 'SCORING_DISABLED',
      message: 'Scoring is disabled - analytics will show response counts only'
    });
    return;
  }
  
  // Scoring enabled but no engine ID
  if (!scoreConfig.scoringEngineId) {
    issues.push({
      type: 'warning',
      code: 'SCORING_NO_ENGINE',
      message: 'No scoring engine specified, will use default (engagement_v1)',
      autoFixable: true,
      fixDescription: 'Set scoringEngineId to "engagement_v1"'
    });
  }
  
  // No categories defined
  if (!scoreConfig.categories || scoreConfig.categories.length === 0) {
    issues.push({
      type: 'error',
      code: 'SCORING_NO_CATEGORIES',
      message: 'Scoring enabled but no categories defined',
      autoFixable: true,
      fixDescription: 'Infer categories from question scoringCategory fields'
    });
  }
}

function checkQuestionScoring(survey: Survey, issues: SurveyIssue[]): void {
  if (!survey.scoreConfig?.enabled) return;
  
  const scorableTypes = ['likert', 'rating', 'multiple_choice', 'single_choice'];
  
  survey.questions.forEach((question, index) => {
    // Likert without scorable flag
    if (scorableTypes.includes(question.type) && question.scorable !== true) {
      issues.push({
        type: 'warning',
        code: 'QUESTION_NOT_SCORABLE',
        message: `Q${index + 1}: "${truncate(question.text)}" is ${question.type} but not marked scorable`,
        questionId: question.id,
        autoFixable: true,
        fixDescription: 'Set scorable: true'
      });
    }
    
    // Scorable but no category
    if (question.scorable && !question.scoringCategory) {
      issues.push({
        type: 'error',
        code: 'QUESTION_NO_CATEGORY',
        message: `Q${index + 1}: "${truncate(question.text)}" is scorable but has no scoring category`,
        questionId: question.id,
        autoFixable: true,
        fixDescription: 'Infer category from question content or assign default'
      });
    }
    
    // Likert without option scores
    if (question.scorable && question.type === 'likert') {
      if (!question.optionScores || question.optionScores.length === 0) {
        issues.push({
          type: 'warning',
          code: 'QUESTION_NO_SCORES',
          message: `Q${index + 1}: "${truncate(question.text)}" missing option scores`,
          questionId: question.id,
          autoFixable: true,
          fixDescription: 'Generate default 1-5 scale'
        });
      } else if (question.options && question.optionScores.length !== question.options.length) {
        issues.push({
          type: 'error',
          code: 'QUESTION_SCORE_MISMATCH',
          message: `Q${index + 1}: Has ${question.options.length} options but ${question.optionScores.length} scores`,
          questionId: question.id,
          autoFixable: true,
          fixDescription: 'Regenerate option scores to match option count'
        });
      }
    }
    
    // Check for reversed Likert (scores descending when options ascending)
    if (question.optionScores && question.optionScores.length >= 3) {
      const isDescending = question.optionScores[0] > question.optionScores[question.optionScores.length - 1];
      if (isDescending) {
        issues.push({
          type: 'info',
          code: 'QUESTION_REVERSED_SCALE',
          message: `Q${index + 1}: Option scores are reversed (high to low) - verify this is intentional`,
          questionId: question.id
        });
      }
    }
  });
}

function checkCategoryMappings(survey: Survey, issues: SurveyIssue[]): void {
  if (!survey.scoreConfig?.enabled) return;
  
  const categories = survey.scoreConfig.categories || [];
  const categoryIds = new Set(categories.map(c => c.id || c.name));
  
  // Check that all question categories exist in config
  survey.questions.forEach((question, index) => {
    if (question.scoringCategory && !categoryIds.has(question.scoringCategory)) {
      issues.push({
        type: 'error',
        code: 'CATEGORY_NOT_FOUND',
        message: `Q${index + 1}: References category "${question.scoringCategory}" which doesn't exist`,
        questionId: question.id,
        categoryId: question.scoringCategory,
        autoFixable: true,
        fixDescription: 'Add category to scoreConfig.categories'
      });
    }
  });
  
  // Check for categories with no questions
  const usedCategories = new Set(
    survey.questions
      .filter(q => q.scoringCategory)
      .map(q => q.scoringCategory)
  );
  
  categories.forEach(category => {
    const catId = category.id || category.name;
    if (!usedCategories.has(catId)) {
      issues.push({
        type: 'warning',
        code: 'CATEGORY_UNUSED',
        message: `Category "${category.name}" has no questions assigned`,
        categoryId: catId
      });
    }
  });
  
  // Check dimension mappings for 5D surveys
  const dimensionCategories = categories.filter(c => c.dimension);
  if (dimensionCategories.length > 0) {
    const dimensions = new Set(dimensionCategories.map(c => c.dimension));
    const expected5D = ['purpose', 'autonomy', 'mastery', 'belonging', 'wellbeing'];
    
    expected5D.forEach(dim => {
      if (!dimensions.has(dim)) {
        issues.push({
          type: 'warning',
          code: 'DIMENSION_MISSING',
          message: `5D survey missing dimension: ${dim}`,
          autoFixable: false
        });
      }
    });
  }
}

function checkBandConfiguration(survey: Survey, issues: SurveyIssue[]): void {
  if (!survey.scoreConfig?.enabled) return;
  
  const bands = survey.scoreConfig.bands || [];
  
  if (bands.length === 0) {
    issues.push({
      type: 'warning',
      code: 'BANDS_MISSING',
      message: 'No bands defined - will use default engagement bands',
      autoFixable: true,
      fixDescription: 'Apply INDEX_BAND_DEFINITIONS from analyticsBands.ts'
    });
    return;
  }
  
  // Check band thresholds
  const sortedBands = [...bands].sort((a, b) => (a.min || 0) - (b.min || 0));
  
  // Check for gaps
  for (let i = 1; i < sortedBands.length; i++) {
    const prev = sortedBands[i - 1];
    const curr = sortedBands[i];
    if (prev.max !== undefined && curr.min !== undefined && prev.max !== curr.min) {
      issues.push({
        type: 'error',
        code: 'BANDS_GAP',
        message: `Gap in bands: ${prev.name} ends at ${prev.max}, ${curr.name} starts at ${curr.min}`,
        autoFixable: true,
        fixDescription: 'Adjust band thresholds to be contiguous'
      });
    }
  }
  
  // Check coverage (should span 0-100)
  const minThreshold = Math.min(...bands.map(b => b.min || 0));
  const maxThreshold = Math.max(...bands.map(b => b.max || 100));
  
  if (minThreshold > 0) {
    issues.push({
      type: 'warning',
      code: 'BANDS_NO_FLOOR',
      message: `Bands don't cover scores below ${minThreshold}`,
      autoFixable: true
    });
  }
  
  if (maxThreshold < 100) {
    issues.push({
      type: 'warning',
      code: 'BANDS_NO_CEILING',
      message: `Bands don't cover scores above ${maxThreshold}`,
      autoFixable: true
    });
  }
}

function checkResultsScreen(survey: Survey, issues: SurveyIssue[]): void {
  if (!survey.scoreConfig?.enabled) return;
  
  // Check if survey has a results screen
  const hasResultsScreen = survey.screens?.some(s => 
    s.type === 'results' || s.type === 'thank_you_with_results'
  );
  
  if (!hasResultsScreen) {
    issues.push({
      type: 'warning',
      code: 'NO_RESULTS_SCREEN',
      message: 'Survey has scoring but no results screen - respondents won\'t see their scores',
      autoFixable: true,
      fixDescription: 'Add default results screen configuration'
    });
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function truncate(text: string, length: number = 30): string {
  if (!text) return '[no text]';
  return text.length > length ? text.slice(0, length) + '...' : text;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { checkSurveyHealth };
export type { SurveyHealthReport, SurveyIssue, IssueSeverity };
```

### Step 2: Add Export to Shared Index

**Modify:** `shared/index.ts` (or create if doesn't exist)

```typescript
// Add this line:
export * from './utils/surveyHealthCheck';
```

### Step 3: Create Unit Tests

**Create:** `shared/__tests__/surveyHealthCheck.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { checkSurveyHealth } from '../utils/surveyHealthCheck';

describe('surveyHealthCheck', () => {
  describe('basic structure', () => {
    it('returns error for survey with no questions', () => {
      const survey = { id: 'test', questions: [] };
      const report = checkSurveyHealth(survey as any);
      
      expect(report.status).toBe('error');
      expect(report.canPublish).toBe(false);
      expect(report.issues).toContainEqual(
        expect.objectContaining({ code: 'STRUCTURE_NO_QUESTIONS' })
      );
    });
    
    it('returns warning for untitled survey', () => {
      const survey = { 
        id: 'test', 
        title: 'Untitled Survey',
        questions: [{ id: 'q1', text: 'Test', type: 'text' }]
      };
      const report = checkSurveyHealth(survey as any);
      
      expect(report.issues).toContainEqual(
        expect.objectContaining({ code: 'STRUCTURE_NO_TITLE' })
      );
    });
  });
  
  describe('scoring configuration', () => {
    it('returns info when scoring disabled', () => {
      const survey = {
        id: 'test',
        questions: [{ id: 'q1', text: 'Test', type: 'likert' }],
        scoreConfig: { enabled: false }
      };
      const report = checkSurveyHealth(survey as any);
      
      expect(report.issues).toContainEqual(
        expect.objectContaining({ code: 'SCORING_DISABLED' })
      );
    });
    
    it('returns error for scorable question without category', () => {
      const survey = {
        id: 'test',
        questions: [{ 
          id: 'q1', 
          text: 'How satisfied are you?', 
          type: 'likert',
          scorable: true,
          scoringCategory: null  // Missing!
        }],
        scoreConfig: { enabled: true, categories: [] }
      };
      const report = checkSurveyHealth(survey as any);
      
      expect(report.status).toBe('error');
      expect(report.issues).toContainEqual(
        expect.objectContaining({ 
          code: 'QUESTION_NO_CATEGORY',
          autoFixable: true
        })
      );
    });
  });
  
  describe('healthy survey', () => {
    it('returns healthy for properly configured 5D survey', () => {
      const survey = {
        id: 'test',
        title: 'Employee Engagement Survey',
        questions: [{
          id: 'q1',
          text: 'I find meaning in my work',
          type: 'likert',
          scorable: true,
          scoringCategory: 'purpose',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          optionScores: [1, 2, 3, 4, 5]
        }],
        scoreConfig: {
          enabled: true,
          scoringEngineId: 'engagement_v1',
          categories: [
            { id: 'purpose', name: 'Purpose', dimension: 'purpose' }
          ],
          bands: [
            { name: 'Low', min: 0, max: 40 },
            { name: 'Medium', min: 40, max: 70 },
            { name: 'High', min: 70, max: 100 }
          ]
        },
        screens: [{ type: 'results' }]
      };
      const report = checkSurveyHealth(survey as any);
      
      expect(report.status).toBe('healthy');
      expect(report.canPublish).toBe(true);
      expect(report.summary.errors).toBe(0);
    });
  });
});
```

### Step 4: Run Tests

```bash
npm test -- surveyHealthCheck
```

---

## Acceptance Criteria

- [ ] `checkSurveyHealth()` function exists and is exported
- [ ] Returns correct status (healthy/warning/error)
- [ ] Identifies all issue types listed above
- [ ] `autoFixable` flag is accurate
- [ ] All unit tests pass
- [ ] No runtime errors on malformed input

---

## Files Created/Modified

| File | Action |
|------|--------|
| `shared/utils/surveyHealthCheck.ts` | CREATE |
| `shared/__tests__/surveyHealthCheck.test.ts` | CREATE |
| `shared/index.ts` | MODIFY (add export) |

---

## Next Ticket

→ HARDEN-002: Scoring Config Inference (uses this health check)

