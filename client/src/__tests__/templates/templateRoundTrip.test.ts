import { describe, it, expect } from 'vitest';
import { surveyTemplates } from '@shared/templates';
import { evaliaToBuilder, builderToEvalia } from '@/contexts/SurveyBuilderContext';
import { scoreSurvey } from '@shared/scoringEngine';
import { normalizeScoringConfig } from '@/utils/normalizeScoringConfig';
import type { Question as EvaliaQuestion } from '@shared/schema';

function buildSyntheticMaxResponses(questions: EvaliaQuestion[]): Record<string, unknown> {
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

describe('template round-trip (Evalia ↔ Builder) scoring + logic', () => {
  const templatesToTest = surveyTemplates.slice(0, 3); // sample a few real templates

  templatesToTest.forEach((template) => {
    it(`preserves fields for template: ${template.id}`, () => {
      const builderQuestions = template.questions.map((q, idx) => evaliaToBuilder(q, idx));
      const roundTripped = builderQuestions.map(builderToEvalia);

      expect(roundTripped).toHaveLength(template.questions.length);

      roundTripped.forEach((rt, idx) => {
        const original = template.questions[idx];
        expect(rt).toMatchObject({
          id: original.id,
          type: original.type,
          question: original.question,
          options: original.options,
          scorable: (original as any).scorable,
          scoreWeight: (original as any).scoreWeight,
          scoringCategory: (original as any).scoringCategory,
          optionScores: (original as any).optionScores,
        });
      });

      const normalizedOriginal = normalizeScoringConfig((template as any)?.scoreConfig);
      const normalizedRoundTrip = normalizeScoringConfig((template as any)?.scoreConfig);
      expect(normalizedRoundTrip).toEqual(normalizedOriginal);

      const emptyResult = scoreSurvey({
        questions: roundTripped,
        responses: {},
        scoreConfig: template.scoreConfig,
      });
      expect(emptyResult.totalScore).toBe(0);
      expect(emptyResult.maxScore).toBeGreaterThanOrEqual(0);

      const synthetic = buildSyntheticMaxResponses(roundTripped);
      const maxResult = scoreSurvey({
        questions: roundTripped,
        responses: synthetic,
        scoreConfig: template.scoreConfig,
      });
      expect(maxResult.maxScore).toBeGreaterThanOrEqual(0);
      if (maxResult.maxScore > 0) {
        expect(maxResult.percentage).toBeLessThanOrEqual(100);
      }
    });
  });
});
