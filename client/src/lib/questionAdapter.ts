/**
 * Question Adapter Utilities
 * 
 * Provides conversion between BuilderQuestion (used in SurveyBuilderContext)
 * and Question (from @shared/schema) types.
 * 
 * BuilderQuestion uses 'text' for the question text field.
 * Question (schema) uses 'question' for the question text field.
 */

import type { BuilderQuestion } from '@/contexts/SurveyBuilderContext';
import type { Question } from '@shared/schema';
import { normalizeQuestion } from '@shared/questionNormalization';

/**
 * Converts a BuilderQuestion to the shared Question schema format.
 * 
 * Used by:
 * - BuilderCanvas (mode='builder')
 * - PreviewV2 (mode='preview')
 * - SurveyViewV2 (mode='live') - future
 * - DesignV2 (mode='readonly') - future
 */
export function toRuntimeQuestion(builderQuestion: BuilderQuestion): Question {
  return normalizeQuestion({
    ...builderQuestion,
    question: builderQuestion.text,
  });
}

/**
 * Converts a Question (schema) back to BuilderQuestion format.
 * Useful when loading survey data from the API into the builder.
 */
export function toBuilderQuestion(question: Question, index: number): Partial<BuilderQuestion> {
  const normalized = normalizeQuestion(question);
  return {
    ...normalized,
    text: normalized.question,
    order: index,
    hasLogic: !!normalized.skipCondition,
  };
}
