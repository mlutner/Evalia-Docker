import { describe, it, expect } from 'vitest';
import { validateResultsConfig } from '../resultsValidation';
import type { SurveyScoreConfig } from '../schema';

const baseConfig: SurveyScoreConfig = {
  enabled: true,
  categories: [
    { id: 'eng', name: 'Engagement' },
    { id: 'sat', name: 'Satisfaction' },
  ],
  scoreRanges: [
    { id: 'low', min: 0, max: 49, label: 'Low' },
    { id: 'high', min: 50, max: 100, label: 'High' },
  ],
  resultsScreen: {
    enabled: true,
    layout: 'simple',
    showTotalScore: true,
    showPercentage: true,
    showOverallBand: true,
    showCategoryBreakdown: true,
    showCategoryBands: true,
    showStrengthsAndRisks: false,
    showCallToAction: false,
    scoreRanges: [
      { id: 'low', min: 0, max: 40, label: 'Low' },
      { id: 'high', min: 41, max: 100, label: 'High' },
    ],
    categories: [
      { categoryId: 'eng', show: true, bandsMode: 'inherit' },
      { categoryId: 'sat', show: true, bandsMode: 'custom', bands: [{ id: 'single', min: 0, max: 100, label: 'All' }] },
    ],
  },
};

describe('resultsValidation', () => {
  it('passes valid config', () => {
    const res = validateResultsConfig(baseConfig);
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('detects overlapping bands', () => {
    const cfg: SurveyScoreConfig = {
      ...baseConfig,
      resultsScreen: {
        ...baseConfig.resultsScreen!,
        scoreRanges: [
          { id: 'a', min: 0, max: 60, label: 'A' },
          { id: 'b', min: 50, max: 100, label: 'B' },
        ],
      },
    };
    const res = validateResultsConfig(cfg);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('overlaps'))).toBe(true);
  });

  it('flags missing category in resultsScreen', () => {
    const cfg: SurveyScoreConfig = {
      ...baseConfig,
      resultsScreen: {
        ...baseConfig.resultsScreen!,
        categories: [{ categoryId: 'missing', show: true }],
      },
    };
    const res = validateResultsConfig(cfg);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('missing')) || res.errors.some((e) => e.includes('not defined'))).toBe(true);
  });
});
