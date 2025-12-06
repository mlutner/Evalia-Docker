/**
 * Survey Validation - Combined Logic + Scoring validation
 * 
 * Use this before save/publish to catch all configuration issues.
 */

import type { Question, SurveyScoreConfig } from '@shared/schema';
import { 
  validateSurveyLogic, 
  summarizeValidation,
  type LogicValidationResult 
} from './logicValidator';
import { 
  validateScoreConfig, 
  summarizeScoringValidation,
  type ScoringValidationResult 
} from './scoringValidator';

// ============================================================================
// TYPES
// ============================================================================

export type ValidationIssueSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  domain: 'logic' | 'scoring' | 'general';
  code: string;
  severity: ValidationIssueSeverity;
  message: string;
  questionId?: string;
  ruleId?: string;
  categoryId?: string;
  bandId?: string;
  details?: Record<string, unknown>;
}

export interface SurveyValidationResult {
  isValid: boolean;
  canPublish: boolean;
  issues: ValidationIssue[];
  // Convenience arrays for quick access
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  logic: ValidationIssue[];
  scoring: ValidationIssue[];
  summary: {
    logic: { errorCount: number; warningCount: number; infoCount: number };
    scoring: { errorCount: number; warningCount: number; infoCount: number };
    total: { errorCount: number; warningCount: number; infoCount: number };
  };
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

/**
 * Validate survey before save/publish
 * Returns structured results that can be displayed in the UI
 */
export function validateSurveyBeforePublish(
  questions: Question[],
  scoreConfig?: SurveyScoreConfig | null
): SurveyValidationResult {
  const issues: ValidationIssue[] = [];

  // Run logic validation
  const logicResults = validateSurveyLogic(questions);
  const logicSummary = summarizeValidation(logicResults);
  
  // Convert logic results to unified format
  for (const result of logicResults) {
    issues.push({
      domain: 'logic',
      code: result.code,
      severity: result.severity,
      message: result.message,
      questionId: result.questionId,
      ruleId: result.ruleId,
      details: result.details,
    });
  }

  // Run scoring validation
  const scoringResults = validateScoreConfig(questions, scoreConfig);
  const scoringSummary = summarizeScoringValidation(scoringResults);
  
  // Convert scoring results to unified format
  for (const result of scoringResults) {
    issues.push({
      domain: 'scoring',
      code: result.code,
      severity: result.severity,
      message: result.message,
      questionId: result.questionId,
      categoryId: result.categoryId,
      bandId: result.bandId,
      details: result.details,
    });
  }

  // Add general validations
  issues.push(...validateGeneral(questions, scoreConfig));

  // Calculate totals and convenience arrays
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const logic = issues.filter(i => i.domain === 'logic');
  const scoring = issues.filter(i => i.domain === 'scoring');

  return {
    isValid: errors.length === 0,
    canPublish: errors.length === 0, // Could be more strict, e.g., require 0 warnings
    issues,
    errors,
    warnings,
    logic,
    scoring,
    summary: {
      logic: {
        errorCount: logicSummary.errorCount,
        warningCount: logicSummary.warningCount,
        infoCount: logicSummary.infoCount,
      },
      scoring: {
        errorCount: scoringSummary.errorCount,
        warningCount: scoringSummary.warningCount,
        infoCount: scoringSummary.infoCount,
      },
      total: {
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: issues.filter(i => i.severity === 'info').length,
      },
    },
  };
}

/**
 * General survey validations (not specific to logic or scoring)
 */
function validateGeneral(
  questions: Question[],
  scoreConfig?: SurveyScoreConfig | null
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check minimum question count
  if (questions.length === 0) {
    issues.push({
      domain: 'general',
      code: 'NO_QUESTIONS',
      severity: 'error',
      message: 'Survey has no questions',
    });
  }

  // Check maximum question count
  if (questions.length > 200) {
    issues.push({
      domain: 'general',
      code: 'TOO_MANY_QUESTIONS',
      severity: 'warning',
      message: `Survey has ${questions.length} questions (recommended max: 200)`,
      details: { count: questions.length, max: 200 },
    });
  }

  // Check for duplicate question IDs
  const ids = questions.map(q => q.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    issues.push({
      domain: 'general',
      code: 'DUPLICATE_QUESTION_IDS',
      severity: 'error',
      message: `Duplicate question IDs found: ${[...new Set(duplicates)].join(', ')}`,
      details: { duplicates: [...new Set(duplicates)] },
    });
  }

  // Check for questions without text
  // NOTE: BuilderQuestion uses 'text' field, EvaliaQuestion uses 'question' field
  for (const q of questions) {
    const questionText = (q as any).text || q.question;
    if (!questionText || questionText.trim() === '') {
      issues.push({
        domain: 'general',
        code: 'EMPTY_QUESTION_TEXT',
        severity: 'error',
        message: 'Question has no text',
        questionId: q.id,
      });
    }
  }

  return issues;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get issues affecting a specific question
 */
export function getIssuesForQuestion(
  result: SurveyValidationResult,
  questionId: string
): ValidationIssue[] {
  return result.issues.filter(i => i.questionId === questionId);
}

/**
 * Get all logic-related issues
 */
export function getLogicIssues(result: SurveyValidationResult): ValidationIssue[] {
  return result.issues.filter(i => i.domain === 'logic');
}

/**
 * Get all scoring-related issues
 */
export function getScoringIssues(result: SurveyValidationResult): ValidationIssue[] {
  return result.issues.filter(i => i.domain === 'scoring');
}

/**
 * Get issues by severity
 */
export function getIssuesBySeverity(
  result: SurveyValidationResult,
  severity: ValidationIssueSeverity
): ValidationIssue[] {
  return result.issues.filter(i => i.severity === severity);
}

/**
 * Format validation result for display
 */
export function formatValidationMessage(result: SurveyValidationResult): string {
  const { summary } = result;
  const parts: string[] = [];

  if (summary.total.errorCount > 0) {
    parts.push(`${summary.total.errorCount} error${summary.total.errorCount !== 1 ? 's' : ''}`);
  }
  if (summary.total.warningCount > 0) {
    parts.push(`${summary.total.warningCount} warning${summary.total.warningCount !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'No issues found';
  }

  return parts.join(', ');
}

