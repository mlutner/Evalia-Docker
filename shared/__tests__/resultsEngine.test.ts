import { describe, it, expect } from 'vitest';
import { resolveScoreBand, resolveCategoryBands } from '../resultsEngine';
import type { SurveyScoreConfig } from '../schema';

const baseConfig: SurveyScoreConfig = {
  enabled: true,
  categories: [
    { id: 'eng', name: 'Engagement' },
    { id: 'sat', name: 'Satisfaction' },
  ],
  scoreRanges: [
    { id: 'low', min: 0, max: 49, label: 'Low' },
    { id: 'mid', min: 50, max: 74, label: 'Mid' },
    { id: 'high', min: 75, max: 100, label: 'High' },
  ],
  resultsScreen: {
    enabled: true,
    layout: 'bands',
    showTotalScore: true,
    showPercentage: true,
    showOverallBand: true,
    showCategoryBreakdown: true,
    showCategoryBands: true,
    showStrengthsAndRisks: false,
    showCallToAction: false,
    scoreRanges: [
      { id: 'low', min: 0, max: 40, label: 'Low' },
      { id: 'mid', min: 41, max: 70, label: 'Mid' },
      { id: 'high', min: 71, max: 100, label: 'High' },
    ],
    categories: [
      { categoryId: 'eng', show: true, bandsMode: 'inherit' },
      {
        categoryId: 'sat',
        show: true,
        bandsMode: 'custom',
        bands: [
          { id: 'low', min: 0, max: 30, label: 'Low' },
          { id: 'high', min: 31, max: 100, label: 'High' },
        ],
      },
    ],
  },
};

describe('resultsEngine band resolution', () => {
  it('resolves overall band from resultsScreen scoreRanges first', () => {
    const band = resolveScoreBand(65, baseConfig);
    expect(band?.id).toBe('mid'); // from resultsScreen.scoreRanges
  });

  it('falls back to global scoreRanges when resultsScreen scoreRanges missing', () => {
    const cfg = { ...baseConfig, resultsScreen: { ...baseConfig.resultsScreen, scoreRanges: undefined } };
    const band = resolveScoreBand(80, cfg);
    expect(band?.id).toBe('high');
  });

  it('resolves category bands using custom first then inherit', () => {
    const cats = {
      eng: { score: 60, maxScore: 100, label: 'Engagement' },
      sat: { score: 60, maxScore: 100, label: 'Satisfaction' },
    };
    const resolved = resolveCategoryBands(cats, baseConfig);
    expect(resolved.eng?.id).toBe('mid'); // inherit resultsScreen scoreRanges
    expect(resolved.sat?.id).toBe('high'); // custom bands hit 60 => high
  });
});
