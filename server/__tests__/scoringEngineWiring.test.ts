import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeSurveyScore } from '../utils/scoring';
import * as scoringEngine from '@shared/scoringEngine';
import type { Question, SurveyScoreConfig } from '@shared/schema';

const sampleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'rating',
    question: 'How engaged are you?',
    ratingScale: 5,
    scorable: true,
    scoringCategory: 'engagement',
  },
];

const sampleScoreConfig: SurveyScoreConfig = {
  enabled: true,
  categories: [{ id: 'engagement', name: 'Engagement' }],
  scoreRanges: [],
};

describe('computeSurveyScore wiring', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses default engagement_v1 when survey.scoringEngineId is missing', () => {
    const spy = vi.spyOn(scoringEngine, 'scoreSurvey');
    computeSurveyScore({
      survey: { questions: sampleQuestions, scoreConfig: sampleScoreConfig },
      responses: { q1: 5 },
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const call = spy.mock.calls[0];
    expect(call[1]).toBe('engagement_v1');
  });

  it('passes explicit scoringEngineId through to scoreSurvey', () => {
    const spy = vi.spyOn(scoringEngine, 'scoreSurvey');
    computeSurveyScore({
      survey: { questions: sampleQuestions, scoreConfig: sampleScoreConfig, scoringEngineId: 'engagement_v1' },
      responses: { q1: 4 },
    });

    const call = spy.mock.calls[0];
    expect(call[1]).toBe('engagement_v1');
  });
});
