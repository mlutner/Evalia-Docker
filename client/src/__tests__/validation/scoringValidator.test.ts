import { describe, it, expect } from 'vitest';
import {
  validateScoreConfig,
  summarizeScoringValidation,
} from '@/utils/scoringValidator';
import type { Question, SurveyScoreConfig, ScoreBandConfig } from '@shared/schema';

// ============================================================================
// FIXTURES
// ============================================================================

function makeScorableQuestion(
  id: string,
  category?: string,
  weight: number = 1,
  optionScores?: Record<string, number>
): Question {
  return {
    id,
    type: 'multiple_choice',
    question: `Question ${id}`,
    options: ['A', 'B', 'C'],
    scorable: true,
    scoringCategory: category,
    scoreWeight: weight,
    optionScores: optionScores || { A: 1, B: 2, C: 3 },
  } as Question;
}

function makeNonScorableQuestion(id: string): Question {
  return {
    id,
    type: 'text',
    question: `Question ${id}`,
    scorable: false,
  } as Question;
}

function makeBand(id: string, label: string, min: number, max: number): ScoreBandConfig {
  return { id, label, min, max };
}

function makeScoreConfig(
  options: {
    enabled?: boolean;
    categories?: Array<{ id: string; name: string }>;
    bands?: ScoreBandConfig[];
  } = {}
): SurveyScoreConfig {
  return {
    enabled: options.enabled ?? true,
    categories: options.categories || [],
    scoreRanges: options.bands || [],
  };
}

// ============================================================================
// TESTS: Clean Configuration
// ============================================================================

describe('validateScoreConfig - clean configs', () => {
  it('passes for disabled scoring', () => {
    const questions = [makeScorableQuestion('q1')];
    const config = makeScoreConfig({ enabled: false });

    const results = validateScoreConfig(questions, config);
    expect(results).toHaveLength(0);
  });

  it('passes for valid complete configuration', () => {
    const questions = [
      makeScorableQuestion('q1', 'engagement'),
      makeScorableQuestion('q2', 'engagement'),
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [
        makeBand('low', 'Low', 0, 33),
        makeBand('mid', 'Medium', 34, 66),
        makeBand('high', 'High', 67, 100),
      ],
    });

    const results = validateScoreConfig(questions, config);
    const summary = summarizeScoringValidation(results);

    expect(summary.errorCount).toBe(0);
    expect(summary.isValid).toBe(true);
  });
});

// ============================================================================
// TESTS: Band Coverage
// ============================================================================

describe('validateScoreConfig - band coverage', () => {
  it('detects gaps in band coverage', () => {
    const questions = [makeScorableQuestion('q1', 'engagement')];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [
        makeBand('low', 'Low', 0, 30),
        makeBand('high', 'High', 70, 100),
        // Gap: 31-69 not covered
      ],
    });

    const results = validateScoreConfig(questions, config);
    const gaps = results.filter(r => r.code === 'BAND_GAP');

    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0].severity).toBe('error');
  });

  it('warns when no bands are defined', () => {
    const questions = [makeScorableQuestion('q1', 'engagement')];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [],
    });

    const results = validateScoreConfig(questions, config);
    const noBands = results.filter(r => r.code === 'NO_BANDS_DEFINED');

    expect(noBands).toHaveLength(1);
    expect(noBands[0].severity).toBe('warning');
  });
});

// ============================================================================
// TESTS: Band Overlaps
// ============================================================================

describe('validateScoreConfig - band overlaps', () => {
  it('detects overlapping bands', () => {
    const questions = [makeScorableQuestion('q1', 'engagement')];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [
        makeBand('low', 'Low', 0, 50),
        makeBand('mid', 'Medium', 40, 70), // Overlaps with Low
        makeBand('high', 'High', 71, 100),
      ],
    });

    const results = validateScoreConfig(questions, config);
    const overlaps = results.filter(r => r.code === 'BAND_OVERLAP');

    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].severity).toBe('error');
    expect(overlaps[0].details?.overlapRange).toEqual({ start: 40, end: 50 });
  });

  it('passes for adjacent bands', () => {
    const questions = [makeScorableQuestion('q1', 'engagement')];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [
        makeBand('low', 'Low', 0, 33),
        makeBand('mid', 'Medium', 34, 66),
        makeBand('high', 'High', 67, 100),
      ],
    });

    const results = validateScoreConfig(questions, config);
    const overlaps = results.filter(r => r.code === 'BAND_OVERLAP');

    expect(overlaps).toHaveLength(0);
  });
});

// ============================================================================
// TESTS: Band Min/Max
// ============================================================================

describe('validateScoreConfig - band min/max', () => {
  it('detects invalid min >= max', () => {
    const questions = [makeScorableQuestion('q1', 'engagement')];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [
        makeBand('broken', 'Broken', 50, 30), // min > max
      ],
    });

    const results = validateScoreConfig(questions, config);
    const invalid = results.filter(r => r.code === 'INVALID_BAND_RANGE');

    expect(invalid).toHaveLength(1);
    expect(invalid[0].severity).toBe('error');
  });

  it('detects negative min values', () => {
    const questions = [makeScorableQuestion('q1', 'engagement')];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [
        makeBand('bad', 'Bad', -10, 30),
      ],
    });

    const results = validateScoreConfig(questions, config);
    const outOfRange = results.filter(r => r.code === 'BAND_OUT_OF_RANGE');

    expect(outOfRange).toHaveLength(1);
    expect(outOfRange[0].severity).toBe('error');
  });
});

// ============================================================================
// TESTS: Category Usage
// ============================================================================

describe('validateScoreConfig - category usage', () => {
  it('warns about unused categories', () => {
    const questions = [
      makeScorableQuestion('q1', 'engagement'),
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'growth', name: 'Growth' }, // Unused
      ],
      bands: [
        makeBand('low', 'Low', 0, 50),
        makeBand('high', 'High', 51, 100),
      ],
    });

    const results = validateScoreConfig(questions, config);
    const unused = results.filter(r => r.code === 'UNUSED_CATEGORY');

    expect(unused).toHaveLength(1);
    expect(unused[0].categoryId).toBe('growth');
    expect(unused[0].severity).toBe('warning');
  });
});

// ============================================================================
// TESTS: Scorable Questions
// ============================================================================

describe('validateScoreConfig - scorable questions', () => {
  it('warns about scorable questions without category', () => {
    const questions = [
      makeScorableQuestion('q1', undefined), // No category
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [makeBand('all', 'All', 0, 100)],
    });

    const results = validateScoreConfig(questions, config);
    const noCategory = results.filter(r => r.code === 'SCORABLE_NO_CATEGORY');

    expect(noCategory).toHaveLength(1);
    expect(noCategory[0].questionId).toBe('q1');
  });

  it('errors on invalid category reference', () => {
    const questions = [
      makeScorableQuestion('q1', 'nonexistent'),
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [makeBand('all', 'All', 0, 100)],
    });

    const results = validateScoreConfig(questions, config);
    const invalid = results.filter(r => r.code === 'INVALID_CATEGORY_REF');

    expect(invalid).toHaveLength(1);
    expect(invalid[0].severity).toBe('error');
  });

  it('warns about missing option scores', () => {
    const questions = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Test',
        options: ['A', 'B'],
        scorable: true,
        scoringCategory: 'engagement',
        optionScores: {}, // Empty
      } as Question,
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [makeBand('all', 'All', 0, 100)],
    });

    const results = validateScoreConfig(questions, config);
    const missing = results.filter(r => r.code === 'MISSING_OPTION_SCORES');

    expect(missing).toHaveLength(1);
    expect(missing[0].severity).toBe('warning');
  });
});

// ============================================================================
// TESTS: Weight Distribution
// ============================================================================

describe('validateScoreConfig - weight distribution', () => {
  it('warns about extreme weight imbalance', () => {
    const questions = [
      makeScorableQuestion('q1', 'engagement', 1),
      makeScorableQuestion('q2', 'engagement', 1),
      makeScorableQuestion('q3', 'engagement', 10), // 10x the others
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [makeBand('all', 'All', 0, 100)],
    });

    const results = validateScoreConfig(questions, config);
    const imbalance = results.filter(
      r => r.code === 'WEIGHT_IMBALANCE' || r.code === 'EXTREME_WEIGHT_VARIANCE'
    );

    expect(imbalance.length).toBeGreaterThan(0);
  });

  it('passes for reasonable weight distribution', () => {
    const questions = [
      makeScorableQuestion('q1', 'engagement', 1),
      makeScorableQuestion('q2', 'engagement', 2),
      makeScorableQuestion('q3', 'engagement', 1),
    ];
    const config = makeScoreConfig({
      enabled: true,
      categories: [{ id: 'engagement', name: 'Engagement' }],
      bands: [makeBand('all', 'All', 0, 100)],
    });

    const results = validateScoreConfig(questions, config);
    const imbalance = results.filter(r => r.code === 'WEIGHT_IMBALANCE');

    expect(imbalance).toHaveLength(0);
  });
});

