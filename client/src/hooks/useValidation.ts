/**
 * useValidation - Hook for running survey validation
 * Provides memoized validation results and helper functions
 */
import { useMemo } from 'react';
import type { Question, SurveyScoreConfig } from '@shared/schema';
import {
  validateSurveyBeforePublish,
  getLogicIssues,
  getScoringIssues,
  getIssuesForQuestion,
  type SurveyValidationResult,
  type ValidationIssue,
} from '@/utils/surveyValidator';

interface UseValidationOptions {
  questions: Question[];
  scoreConfig?: SurveyScoreConfig | null;
  enabled?: boolean;
}

interface UseValidationReturn {
  validation: SurveyValidationResult | null;
  logicIssues: ValidationIssue[];
  scoringIssues: ValidationIssue[];
  issueCounts: {
    logic: { errorCount: number; warningCount: number };
    scoring: { errorCount: number; warningCount: number };
  };
  getQuestionIssues: (questionId: string) => ValidationIssue[];
  getRuleIssues: (ruleId: string) => ValidationIssue[];
  getCategoryIssues: (categoryId: string) => ValidationIssue[];
  getBandIssues: (bandId: string) => ValidationIssue[];
  canPublish: boolean;
  hasIssues: boolean;
}

export function useValidation({
  questions,
  scoreConfig,
  enabled = true,
}: UseValidationOptions): UseValidationReturn {
  // Run validation (memoized)
  const validation = useMemo(() => {
    if (!enabled || questions.length === 0) return null;
    return validateSurveyBeforePublish(questions, scoreConfig);
  }, [questions, scoreConfig, enabled]);

  // Extract logic issues
  const logicIssues = useMemo(
    () => (validation ? getLogicIssues(validation) : []),
    [validation]
  );

  // Extract scoring issues
  const scoringIssues = useMemo(
    () => (validation ? getScoringIssues(validation) : []),
    [validation]
  );

  // Compute issue counts by domain
  const issueCounts = useMemo(() => {
    const logicErrors = logicIssues.filter(i => i.severity === 'error').length;
    const logicWarnings = logicIssues.filter(i => i.severity === 'warning').length;
    const scoringErrors = scoringIssues.filter(i => i.severity === 'error').length;
    const scoringWarnings = scoringIssues.filter(i => i.severity === 'warning').length;

    return {
      logic: { errorCount: logicErrors, warningCount: logicWarnings },
      scoring: { errorCount: scoringErrors, warningCount: scoringWarnings },
    };
  }, [logicIssues, scoringIssues]);

  // Helper: get issues for a specific question
  const getQuestionIssues = useMemo(
    () => (questionId: string) =>
      validation ? getIssuesForQuestion(validation, questionId) : [],
    [validation]
  );

  // Helper: get issues for a specific rule
  const getRuleIssues = useMemo(
    () => (ruleId: string) =>
      validation?.issues.filter(i => i.ruleId === ruleId) || [],
    [validation]
  );

  // Helper: get issues for a specific category
  const getCategoryIssues = useMemo(
    () => (categoryId: string) =>
      validation?.issues.filter(i => i.categoryId === categoryId) || [],
    [validation]
  );

  // Helper: get issues for a specific band
  const getBandIssues = useMemo(
    () => (bandId: string) =>
      validation?.issues.filter(i => i.bandId === bandId) || [],
    [validation]
  );

  return {
    validation,
    logicIssues,
    scoringIssues,
    issueCounts,
    getQuestionIssues,
    getRuleIssues,
    getCategoryIssues,
    getBandIssues,
    canPublish: validation?.canPublish ?? true,
    hasIssues: (validation?.issues.length ?? 0) > 0,
  };
}

