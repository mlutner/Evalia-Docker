# HARDEN-002: Scoring Config Inference

## Priority: CRITICAL
## Status: Ready
## Time Estimate: 2 days
## Category: Scoring Infrastructure
## Epic: HARDEN-000
## Depends On: HARDEN-001

---

## Objective

Create a utility that automatically infers valid scoring configuration from survey questions, fixing the most common template issues.

---

## Implementation Instructions

### Step 1: Create the Inference File

**Create:** `shared/utils/inferScoringConfig.ts`

```typescript
/**
 * Scoring Config Inference Utility
 * 
 * Automatically generates valid scoring configuration from survey questions.
 * Used to auto-heal templates that are missing scoring setup.
 * 
 * [HARDEN-002]
 */

import type { Question, SurveyScoreConfig, ScoringCategory } from '../schema';
import { CATEGORY_TAXONOMY } from '../taxonomy/tags';

// ============================================================================
// TYPES
// ============================================================================

export interface InferenceResult {
  scoreConfig: Partial<SurveyScoreConfig>;
  changes: InferenceChange[];
  confidence: 'high' | 'medium' | 'low';
}

export interface InferenceChange {
  type: 'added' | 'modified' | 'inferred';
  field: string;
  value: any;
  reason: string;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function inferScoringConfig(
  questions: Question[],
  existingConfig?: Partial<SurveyScoreConfig>
): InferenceResult {
  const changes: InferenceChange[] = [];
  
  // Start with existing or empty config
  const config: Partial<SurveyScoreConfig> = {
    enabled: true,
    scoringEngineId: existingConfig?.scoringEngineId || 'engagement_v1',
    categories: existingConfig?.categories || [],
    bands: existingConfig?.bands || [],
    ...existingConfig
  };
  
  // Step 1: Mark scorable questions
  const scorableQuestions = markScorableQuestions(questions, changes);
  
  // Step 2: Infer categories from questions
  const inferredCategories = inferCategories(scorableQuestions, changes);
  
  // Step 3: Merge with existing categories
  config.categories = mergeCategories(
    config.categories as ScoringCategory[],
    inferredCategories,
    changes
  );
  
  // Step 4: Add default bands if missing
  if (!config.bands || config.bands.length === 0) {
    config.bands = getDefaultBands();
    changes.push({
      type: 'added',
      field: 'bands',
      value: config.bands,
      reason: 'No bands defined, using default engagement bands'
    });
  }
  
  // Step 5: Ensure scoring engine is set
  if (!config.scoringEngineId) {
    config.scoringEngineId = 'engagement_v1';
    changes.push({
      type: 'added',
      field: 'scoringEngineId',
      value: 'engagement_v1',
      reason: 'No engine specified, using default'
    });
  }
  
  // Calculate confidence
  const confidence = calculateConfidence(changes, scorableQuestions.length);
  
  return { scoreConfig: config, changes, confidence };
}

// ============================================================================
// INFERENCE FUNCTIONS
// ============================================================================

function markScorableQuestions(
  questions: Question[],
  changes: InferenceChange[]
): Question[] {
  const scorableTypes = ['likert', 'rating', 'scale', 'multiple_choice', 'single_choice'];
  
  return questions.map(q => {
    // Already marked scorable
    if (q.scorable === true) return q;
    
    // Should be scorable based on type
    if (scorableTypes.includes(q.type)) {
      changes.push({
        type: 'inferred',
        field: `questions.${q.id}.scorable`,
        value: true,
        reason: `${q.type} questions are typically scorable`
      });
      return { ...q, scorable: true };
    }
    
    return q;
  });
}

function inferCategories(
  questions: Question[],
  changes: InferenceChange[]
): ScoringCategory[] {
  const categoryMap = new Map<string, ScoringCategory>();
  
  questions.forEach(q => {
    if (!q.scorable) return;
    
    // If question already has a category, use it
    if (q.scoringCategory) {
      if (!categoryMap.has(q.scoringCategory)) {
        const inferredCategory = inferCategoryDetails(q.scoringCategory, q.text);
        categoryMap.set(q.scoringCategory, inferredCategory);
        changes.push({
          type: 'inferred',
          field: `categories.${q.scoringCategory}`,
          value: inferredCategory,
          reason: `Category referenced by question "${q.text.slice(0, 30)}..."`
        });
      }
      return;
    }
    
    // Try to infer category from question text
    const inferredCategoryId = inferCategoryFromText(q.text);
    if (inferredCategoryId) {
      if (!categoryMap.has(inferredCategoryId)) {
        const inferredCategory = inferCategoryDetails(inferredCategoryId, q.text);
        categoryMap.set(inferredCategoryId, inferredCategory);
      }
      changes.push({
        type: 'inferred',
        field: `questions.${q.id}.scoringCategory`,
        value: inferredCategoryId,
        reason: `Inferred from question text keywords`
      });
    }
  });
  
  return Array.from(categoryMap.values());
}

function inferCategoryFromText(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // 5D dimension keywords
  const dimensionKeywords: Record<string, string[]> = {
    purpose: ['purpose', 'meaning', 'mission', 'impact', 'contribution', 'values', 'goals'],
    autonomy: ['autonomy', 'freedom', 'independence', 'choice', 'control', 'flexibility', 'decide'],
    mastery: ['mastery', 'growth', 'learn', 'skill', 'develop', 'improve', 'challenge', 'training'],
    belonging: ['belong', 'team', 'colleague', 'relationship', 'support', 'culture', 'respect', 'trust'],
    wellbeing: ['wellbeing', 'well-being', 'stress', 'balance', 'health', 'workload', 'burnout', 'energy']
  };
  
  for (const [dimension, keywords] of Object.entries(dimensionKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return dimension;
    }
  }
  
  // Generic engagement keywords
  if (lowerText.includes('satisf') || lowerText.includes('engag') || lowerText.includes('happy')) {
    return 'engagement';
  }
  
  // Leadership keywords
  if (lowerText.includes('manager') || lowerText.includes('leader') || lowerText.includes('supervis')) {
    return 'leadership';
  }
  
  return null;
}

function inferCategoryDetails(categoryId: string, questionText: string): ScoringCategory {
  // Check taxonomy for known categories
  const taxonomyCategory = CATEGORY_TAXONOMY?.[categoryId];
  
  if (taxonomyCategory) {
    return {
      id: categoryId,
      name: taxonomyCategory.name || capitalize(categoryId),
      dimension: taxonomyCategory.dimension || categoryId,
      weight: taxonomyCategory.weight || 1
    };
  }
  
  // Generate from ID
  return {
    id: categoryId,
    name: capitalize(categoryId),
    dimension: categoryId,
    weight: 1
  };
}

function mergeCategories(
  existing: ScoringCategory[],
  inferred: ScoringCategory[],
  changes: InferenceChange[]
): ScoringCategory[] {
  const merged = new Map<string, ScoringCategory>();
  
  // Add existing first
  existing.forEach(cat => merged.set(cat.id, cat));
  
  // Add inferred if not already present
  inferred.forEach(cat => {
    if (!merged.has(cat.id)) {
      merged.set(cat.id, cat);
      changes.push({
        type: 'added',
        field: `categories.${cat.id}`,
        value: cat,
        reason: 'Category inferred from questions'
      });
    }
  });
  
  return Array.from(merged.values());
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

function getDefaultBands(): any[] {
  return [
    { id: 'struggling', name: 'Struggling', min: 0, max: 40, color: '#ef4444' },
    { id: 'emerging', name: 'Emerging', min: 40, max: 55, color: '#f97316' },
    { id: 'developing', name: 'Developing', min: 55, max: 70, color: '#eab308' },
    { id: 'performing', name: 'Performing', min: 70, max: 85, color: '#84cc16' },
    { id: 'thriving', name: 'Thriving', min: 85, max: 100, color: '#22c55e' }
  ];
}

// ============================================================================
// HELPERS
// ============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

function calculateConfidence(
  changes: InferenceChange[],
  scorableCount: number
): 'high' | 'medium' | 'low' {
  // High confidence: few changes needed, categories were explicit
  const inferredCount = changes.filter(c => c.type === 'inferred').length;
  const ratio = inferredCount / Math.max(scorableCount, 1);
  
  if (ratio < 0.2) return 'high';
  if (ratio < 0.5) return 'medium';
  return 'low';
}

// ============================================================================
// QUESTION FIXER
// ============================================================================

export function fixQuestionScoring(question: Question): Question {
  const fixed = { ...question };
  
  // Add scorable flag for likert
  if (['likert', 'rating', 'scale'].includes(question.type) && !question.scorable) {
    fixed.scorable = true;
  }
  
  // Add default option scores for likert
  if (fixed.scorable && fixed.type === 'likert' && !fixed.optionScores) {
    const optionCount = fixed.options?.length || 5;
    fixed.optionScores = Array.from({ length: optionCount }, (_, i) => i + 1);
  }
  
  // Fix mismatched option scores
  if (fixed.optionScores && fixed.options && 
      fixed.optionScores.length !== fixed.options.length) {
    const optionCount = fixed.options.length;
    fixed.optionScores = Array.from({ length: optionCount }, (_, i) => i + 1);
  }
  
  return fixed;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { inferScoringConfig, fixQuestionScoring };
```

### Step 2: Create Category Taxonomy (if doesn't exist)

**Check/Create:** `shared/taxonomy/tags.ts`

```typescript
/**
 * Category Taxonomy
 * 
 * Defines known scoring categories and their mappings to dimensions.
 */

export const CATEGORY_TAXONOMY: Record<string, {
  name: string;
  dimension: string;
  weight?: number;
  keywords?: string[];
}> = {
  // 5D Engagement Model
  purpose: {
    name: 'Purpose',
    dimension: 'purpose',
    weight: 1,
    keywords: ['purpose', 'meaning', 'mission', 'impact', 'values']
  },
  autonomy: {
    name: 'Autonomy',
    dimension: 'autonomy',
    weight: 1,
    keywords: ['autonomy', 'freedom', 'independence', 'choice', 'flexibility']
  },
  mastery: {
    name: 'Mastery',
    dimension: 'mastery',
    weight: 1,
    keywords: ['mastery', 'growth', 'learning', 'skills', 'development']
  },
  belonging: {
    name: 'Belonging',
    dimension: 'belonging',
    weight: 1,
    keywords: ['belonging', 'team', 'relationships', 'culture', 'trust']
  },
  wellbeing: {
    name: 'Wellbeing',
    dimension: 'wellbeing',
    weight: 1,
    keywords: ['wellbeing', 'stress', 'balance', 'health', 'workload']
  },
  
  // Common additional categories
  engagement: {
    name: 'Engagement',
    dimension: 'engagement',
    weight: 1,
    keywords: ['engagement', 'satisfaction', 'motivation', 'commitment']
  },
  leadership: {
    name: 'Leadership',
    dimension: 'leadership',
    weight: 1,
    keywords: ['manager', 'leader', 'supervisor', 'feedback', 'support']
  },
  communication: {
    name: 'Communication',
    dimension: 'communication',
    weight: 1,
    keywords: ['communication', 'information', 'updates', 'transparency']
  }
};
```

### Step 3: Create Unit Tests

**Create:** `shared/__tests__/inferScoringConfig.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { inferScoringConfig, fixQuestionScoring } from '../utils/inferScoringConfig';

describe('inferScoringConfig', () => {
  it('infers categories from 5D keywords in question text', () => {
    const questions = [
      { id: 'q1', text: 'I find meaning and purpose in my work', type: 'likert', options: ['1','2','3','4','5'] },
      { id: 'q2', text: 'I have autonomy in how I do my job', type: 'likert', options: ['1','2','3','4','5'] }
    ];
    
    const result = inferScoringConfig(questions as any);
    
    expect(result.scoreConfig.enabled).toBe(true);
    expect(result.scoreConfig.categories).toHaveLength(2);
    expect(result.scoreConfig.categories?.map(c => c.id)).toContain('purpose');
    expect(result.scoreConfig.categories?.map(c => c.id)).toContain('autonomy');
  });
  
  it('preserves existing config while adding missing pieces', () => {
    const questions = [
      { id: 'q1', text: 'Test question', type: 'likert', scorable: true, scoringCategory: 'custom' }
    ];
    const existingConfig = {
      enabled: true,
      scoringEngineId: 'custom_v1',
      categories: [{ id: 'existing', name: 'Existing', dimension: 'existing' }]
    };
    
    const result = inferScoringConfig(questions as any, existingConfig);
    
    expect(result.scoreConfig.scoringEngineId).toBe('custom_v1');
    expect(result.scoreConfig.categories).toContainEqual(
      expect.objectContaining({ id: 'existing' })
    );
  });
  
  it('adds default bands when missing', () => {
    const questions = [
      { id: 'q1', text: 'Test', type: 'likert' }
    ];
    
    const result = inferScoringConfig(questions as any);
    
    expect(result.scoreConfig.bands).toHaveLength(5);
    expect(result.changes).toContainEqual(
      expect.objectContaining({ field: 'bands', type: 'added' })
    );
  });
  
  it('returns high confidence when little inference needed', () => {
    const questions = [
      { 
        id: 'q1', 
        text: 'Test', 
        type: 'likert', 
        scorable: true, 
        scoringCategory: 'purpose',
        optionScores: [1, 2, 3, 4, 5]
      }
    ];
    const existingConfig = {
      enabled: true,
      categories: [{ id: 'purpose', name: 'Purpose', dimension: 'purpose' }],
      bands: [{ id: 'test', min: 0, max: 100 }]
    };
    
    const result = inferScoringConfig(questions as any, existingConfig);
    
    expect(result.confidence).toBe('high');
  });
});

describe('fixQuestionScoring', () => {
  it('adds scorable flag to likert questions', () => {
    const question = { id: 'q1', type: 'likert', text: 'Test' };
    const fixed = fixQuestionScoring(question as any);
    
    expect(fixed.scorable).toBe(true);
  });
  
  it('adds default option scores for likert', () => {
    const question = { 
      id: 'q1', 
      type: 'likert', 
      text: 'Test',
      scorable: true,
      options: ['A', 'B', 'C', 'D', 'E']
    };
    const fixed = fixQuestionScoring(question as any);
    
    expect(fixed.optionScores).toEqual([1, 2, 3, 4, 5]);
  });
  
  it('fixes mismatched option scores', () => {
    const question = {
      id: 'q1',
      type: 'likert',
      text: 'Test',
      scorable: true,
      options: ['A', 'B', 'C'],
      optionScores: [1, 2, 3, 4, 5]  // Wrong length!
    };
    const fixed = fixQuestionScoring(question as any);
    
    expect(fixed.optionScores).toHaveLength(3);
  });
});
```

### Step 4: Run Tests

```bash
npm test -- inferScoringConfig
```

---

## Acceptance Criteria

- [ ] `inferScoringConfig()` generates valid config from bare questions
- [ ] 5D dimension keywords are correctly identified
- [ ] Existing config is preserved and extended (not replaced)
- [ ] Default bands are added when missing
- [ ] `fixQuestionScoring()` repairs individual questions
- [ ] Confidence score reflects inference quality
- [ ] All unit tests pass

---

## Files Created/Modified

| File | Action |
|------|--------|
| `shared/utils/inferScoringConfig.ts` | CREATE |
| `shared/taxonomy/tags.ts` | CREATE or VERIFY |
| `shared/__tests__/inferScoringConfig.test.ts` | CREATE |

---

## Next Ticket

→ HARDEN-003: Template Auto-Wire on Load (uses this inference)

