/**
 * Audit Logging for Scoring & Logic Events
 * 
 * Lightweight structured logging for analytics.
 * Logs only IDs and numeric values - NO PII or free-text answers.
 * 
 * Controlled by AUDIT_LOG_ENABLED env var (default: false in production)
 */

// Feature flag
const AUDIT_LOG_ENABLED = process.env.AUDIT_LOG_ENABLED === 'true' || process.env.NODE_ENV !== 'production';

// ============================================================================
// TYPES
// ============================================================================

interface BaseAuditEvent {
  timestamp: string;
  surveyId: string;
  responseId?: string;
}

interface LogicAuditEvent extends BaseAuditEvent {
  type: 'logic_evaluation';
  ruleId: string;
  questionId: string;
  action: 'skip' | 'show' | 'end';
  targetQuestionId?: string | null;
  evaluationResult: 'matched' | 'not_matched';
}

interface ScoringAuditEvent extends BaseAuditEvent {
  type: 'scoring_complete';
  scoringEngineId: string;
  scoreConfigVersion?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  bandId?: string | null;
  bandLabel?: string | null;
  categoryCount: number;
}

type AuditEvent = LogicAuditEvent | ScoringAuditEvent;

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

/**
 * Log when a logic rule matches and produces a non-default action
 */
export function logLogicEvaluation(params: {
  surveyId: string;
  responseId?: string;
  ruleId: string;
  questionId: string;
  action: 'skip' | 'show' | 'end';
  targetQuestionId?: string | null;
  matched: boolean;
}): void {
  if (!AUDIT_LOG_ENABLED) return;

  const event: LogicAuditEvent = {
    type: 'logic_evaluation',
    timestamp: new Date().toISOString(),
    surveyId: params.surveyId,
    responseId: params.responseId,
    ruleId: params.ruleId,
    questionId: params.questionId,
    action: params.action,
    targetQuestionId: params.targetQuestionId,
    evaluationResult: params.matched ? 'matched' : 'not_matched',
  };

  writeAuditLog(event);
}

/**
 * Log when scoring completes for a response
 */
export function logScoringComplete(params: {
  surveyId: string;
  responseId: string;
  scoringEngineId: string;
  scoreConfigVersion?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  bandId?: string | null;
  bandLabel?: string | null;
  categoryCount: number;
}): void {
  if (!AUDIT_LOG_ENABLED) return;

  const event: ScoringAuditEvent = {
    type: 'scoring_complete',
    timestamp: new Date().toISOString(),
    surveyId: params.surveyId,
    responseId: params.responseId,
    scoringEngineId: params.scoringEngineId,
    scoreConfigVersion: params.scoreConfigVersion,
    totalScore: params.totalScore,
    maxScore: params.maxScore,
    percentage: params.percentage,
    bandId: params.bandId,
    bandLabel: params.bandLabel,
    categoryCount: params.categoryCount,
  };

  writeAuditLog(event);
}

// ============================================================================
// OUTPUT
// ============================================================================

/**
 * Write audit event to structured log
 * Currently uses console.log with JSON formatting
 * Future: could write to file, send to analytics service, etc.
 */
function writeAuditLog(event: AuditEvent): void {
  // Prefix for easy filtering in log aggregators
  const prefix = '[AUDIT]';
  
  // Structured JSON output
  console.log(prefix, JSON.stringify(event));
}

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Check if audit logging is enabled
 */
export function isAuditLogEnabled(): boolean {
  return AUDIT_LOG_ENABLED;
}

