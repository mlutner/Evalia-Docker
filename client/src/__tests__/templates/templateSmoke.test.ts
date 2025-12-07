import { describe, it, expect } from 'vitest';
import { surveyTemplates } from '@shared/templates';
import { questionSchema, surveyScoreConfigSchema, type Question } from '@shared/schema';
import { scoreSurvey } from '@shared/scoringEngine';

function buildSyntheticMaxResponses(questions: Question[]): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  questions.forEach((q) => {
    if (q.scorable !== true) return;

    if (['multiple_choice', 'dropdown', 'yes_no'].includes(q.type)) {
      if (q.optionScores && Object.keys(q.optionScores).length > 0) {
        const best = Object.entries(q.optionScores).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (best !== undefined) responses[q.id] = best;
      }
    } else if (q.type === 'checkbox') {
      if (q.optionScores) {
        const positives = Object.entries(q.optionScores)
          .filter(([, v]) => v > 0)
          .map(([k]) => k);
        responses[q.id] = positives;
      }
    } else if (['rating', 'likert', 'opinion_scale', 'slider'].includes(q.type)) {
      const max =
        q.type === 'likert'
          ? q.likertPoints
          : q.type === 'rating' || q.type === 'opinion_scale'
            ? q.ratingScale
            : q.max;
      if (max !== undefined) responses[q.id] = max;
    }
  });

  return responses;
}

describe('template smoke test', () => {
  surveyTemplates.forEach((template) => {
    it(`template ${template.id} parses and scores`, () => {
      const questionsParse = questionSchema.array().safeParse(template.questions);
      expect(questionsParse.success).toBe(true);

      if (template.scoreConfig) {
        const scoreConfigParse = surveyScoreConfigSchema.safeParse(template.scoreConfig);
        expect(scoreConfigParse.success).toBe(true);
      }

      const responses = buildSyntheticMaxResponses(template.questions as Question[]);
      const result = scoreSurvey({
        questions: template.questions as Question[],
        responses,
        scoreConfig: template.scoreConfig,
      });

      expect(Number.isFinite(result.totalScore)).toBe(true);
      expect(Number.isFinite(result.maxScore)).toBe(true);
      if (result.maxScore > 0) {
        expect(result.percentage).toBeLessThanOrEqual(100);
        expect(result.percentage).toBeGreaterThanOrEqual(0);
      }

      Object.values(result.byCategory).forEach((cat) => {
        expect(Number.isFinite(cat.score)).toBe(true);
        expect(Number.isFinite(cat.maxScore)).toBe(true);
      });
    });
  });

  it('three_image_comparison template has exactly three image options', () => {
    const template = surveyTemplates.find((t) => t.id === 'three_image_comparison');
    expect(template).toBeDefined();
    const imgQuestion = template?.questions.find((q) => q.type === 'image_choice');
    expect(imgQuestion).toBeDefined();
    expect(imgQuestion?.imageOptions?.length).toBe(3);
    expect(imgQuestion?.columns).toBe(3);
    expect(imgQuestion?.selectionType).toBe('single');
    expect(imgQuestion?.showLabels).toBe(true);
  });
});
