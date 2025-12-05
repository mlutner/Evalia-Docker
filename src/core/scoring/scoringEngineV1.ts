/**
 * EVALIA CORE MODULE
 *
 * DO NOT CHANGE existing function signatures, return types, or field names.
 * You may ONLY:
 * - Add new functions
 * - Add new types that do not break existing ones
 *
 * These modules are shared between frontend and backend and must remain deterministic.
 * To change behavior in a breaking way, create a new versioned module instead.
 */

import type { Question, SurveyScoreConfig } from '@shared/schema';
import type { ScoringEngineId } from './strategies';
import { scoringEngines } from './strategies';

type ScoreQuestionResult = {
  score: number;
  maxScore: number;
  category?: string | null;
};

export type ScoreInput = {
  questions: Question[];
  responses: Record<string, unknown>;
  scoreConfig?: SurveyScoreConfig | null;
};

export type ScoringResult = {
  totalScore: number;
  maxScore: number;
  percentage: number;
  byCategory: Record<string, { score: number; maxScore: number; label: string }>;
};

export function scoreQuestion(params: { question: Question; answer: unknown }): ScoreQuestionResult {
  const { question, answer } = params;

  if (question.scorable !== true) {
    return { score: 0, maxScore: 0, category: question.scoringCategory };
  }

  const weight = question.scoreWeight ?? 1;
  const optionScores = question.optionScores || {};

  const category = question.scoringCategory;

  const getMaxFromOptionScores = () => {
    const scores = Object.values(optionScores || {});
    if (!scores.length) return 0;
    return Math.max(...scores) * weight;
  };

  // Single select types
  if (['multiple_choice', 'dropdown', 'yes_no'].includes(question.type)) {
    const ans = typeof answer === 'string' ? answer : String(answer ?? '');
    const score = optionScores && ans in optionScores ? (optionScores as any)[ans] * weight : 0;
    const maxScore = getMaxFromOptionScores();
    return { score, maxScore, category };
  }

  // Checkbox (multi-select)
  if (question.type === 'checkbox') {
    const arr = Array.isArray(answer) ? (answer as string[]) : [];
    const score = arr.reduce((acc, opt) => {
      if (optionScores && opt in optionScores) {
        return acc + (optionScores as any)[opt] * weight;
      }
      return acc;
    }, 0);
    const maxScore = Object.entries(optionScores || {}).reduce((acc, [, val]) => {
      return val > 0 ? acc + val * weight : acc;
    }, 0);
    return { score, maxScore, category };
  }

  // Numeric / scale types
  if (['rating', 'likert', 'opinion_scale', 'slider'].includes(question.type)) {
    const numeric = parseFloat(String(answer ?? '0'));
    const score = isNaN(numeric) ? 0 : numeric * weight;
    let maxScale = 0;
    if (question.type === 'rating' || question.type === 'opinion_scale') {
      maxScale = question.ratingScale ?? 0;
    } else if (question.type === 'likert') {
      maxScale = question.likertPoints ?? 0;
    } else if (question.type === 'slider') {
      if (question.max !== undefined && question.min !== undefined) {
        maxScale = question.max;
      } else {
        maxScale = 0;
      }
    }
    const maxScore = maxScale * weight;
    return { score, maxScore, category };
  }

  return { score: 0, maxScore: 0, category };
}

// Exported for registry wiring; keep logic identical to prior implementation.
export function engagementScoringV1(params: ScoreInput): ScoringResult {
  const { questions, responses, scoreConfig } = params;

  let totalScore = 0;
  let maxScore = 0;
  const byCategory: Record<string, { score: number; maxScore: number; label: string }> = {};

  const categoryLabel = (id: string) => {
    const name = scoreConfig?.categories?.find((c: any) => c.id === id)?.name;
    if (name) return name;
    return id ? id.charAt(0).toUpperCase() + id.slice(1) : id;
  };

  questions.forEach((q) => {
    const answer = responses[q.id];
    const { score, maxScore: qMax, category } = scoreQuestion({ question: q, answer });
    totalScore += score;
    maxScore += qMax;

    if (category) {
      const existing = byCategory[category] || { score: 0, maxScore: 0, label: categoryLabel(category) };
      existing.score += score;
      existing.maxScore += qMax;
      byCategory[category] = existing;
    }
  });

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore,
    maxScore,
    percentage,
    byCategory,
  };
}

export function scoreSurvey(
  input: ScoreInput,
  engineId: ScoringEngineId = 'engagement_v1'
): ScoringResult {
  const engine = scoringEngines[engineId] ?? scoringEngines.engagement_v1;
  return engine(input);
}
