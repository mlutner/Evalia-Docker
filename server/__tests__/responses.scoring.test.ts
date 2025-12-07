import express from 'express';
import request from 'supertest';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import type { Survey } from '@shared/schema';

let responseRoutes: any;
let storage: any;
let app: express.Express;

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://example.com/test';
  responseRoutes = (await import('../routes/responses')).default;
  storage = (await import('../storage')).storage;
  app = express().use(express.json()).use('/api/surveys', responseRoutes);
});

describe('responses route scoring payload', () => {

  const scoredSurvey: Survey = {
    id: 's-1',
    userId: 'u-1',
    title: 'Scored survey',
    description: '',
    status: 'Active',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Pick',
        options: ['A', 'B'],
        required: true,
        scorable: true,
        scoringCategory: 'eng',
        optionScores: { A: 1, B: 5 },
      },
    ] as any,
    scoreConfig: {
      enabled: true,
      categories: [{ id: 'eng', name: 'Engagement' }],
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
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const nonScoredSurvey: Survey = {
    ...scoredSurvey,
    id: 's-2',
    scoreConfig: undefined,
    scoringEngineId: undefined,
  };

  beforeEach(() => {
    vi.spyOn(storage, 'getSurvey').mockReset();
    vi.spyOn(storage, 'createResponse').mockReset();
  });

  it('returns scoring and band for scored survey', async () => {
    (storage.getSurvey as any).mockResolvedValue(scoredSurvey);
    (storage.createResponse as any).mockResolvedValue({
      id: 'r-1',
      surveyId: scoredSurvey.id,
      answers: { q1: 'B' },
      scoringEngineId: 'engagement_v1',
    });

    const res = await request(app)
      .post(`/api/surveys/${scoredSurvey.id}/responses`)
      .send({ answers: { q1: 'B' } })
      .expect(201);

    expect(res.body.scoring).toBeDefined();
    expect(res.body.band?.id).toBe('high');
    expect(res.body.scoring.scoringEngineId || res.body.scoring?.engineId).toBeUndefined();
    expect(storage.createResponse).toHaveBeenCalledWith(scoredSurvey.id, { q1: 'B' }, 'engagement_v1');
  });

  it('omits scoring for non-scored survey', async () => {
    (storage.getSurvey as any).mockResolvedValue(nonScoredSurvey);
    (storage.createResponse as any).mockResolvedValue({
      id: 'r-2',
      surveyId: nonScoredSurvey.id,
      answers: { q1: 'A' },
      scoringEngineId: 'engagement_v1',
    });

    const res = await request(app)
      .post(`/api/surveys/${nonScoredSurvey.id}/responses`)
      .send({ answers: { q1: 'A' } })
      .expect(201);

    expect(res.body.scoring).toBeUndefined();
    expect(res.body.band).toBeUndefined();
  });

  it('returns null band when no ranges defined', async () => {
    const surveyNoBands = {
      ...scoredSurvey,
      id: 's-3',
      scoreConfig: {
        ...scoredSurvey.scoreConfig,
        resultsScreen: {
          ...(scoredSurvey.scoreConfig!.resultsScreen as any),
          scoreRanges: [],
        },
      },
    };
    (storage.getSurvey as any).mockResolvedValue(surveyNoBands);
    (storage.createResponse as any).mockResolvedValue({
      id: 'r-3',
      surveyId: surveyNoBands.id,
      answers: { q1: 'B' },
      scoringEngineId: 'engagement_v1',
    });

    const res = await request(app)
      .post(`/api/surveys/${surveyNoBands.id}/responses`)
      .send({ answers: { q1: 'B' } })
      .expect(201);

    expect(res.body.band).toBeNull();
  });
});
