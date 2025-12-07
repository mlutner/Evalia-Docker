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

import type { LogicRule, Question } from '@shared/schema';

/**
 * Placeholder logic evaluation engine. Intentionally minimal and deterministic.
 * Future AI-backed logic suggestions can plug in here without changing callers.
 */

export interface LogicEvaluationContext {
  questions: Question[];
  answers: Record<string, unknown>;
}

export interface LogicResult {
  nextQuestionId?: string | null;
  action?: 'skip' | 'show' | 'end';
  matchedRule?: LogicRule;
}

// Very small evaluator: walks rules in order and returns the first match.
export function evaluateLogicRules(
  rules: LogicRule[] | undefined,
  context: LogicEvaluationContext
): LogicResult {
  if (!rules || rules.length === 0) return {};

  for (const rule of rules) {
    if (evaluateCondition(rule.condition, context)) {
      return {
        nextQuestionId: rule.targetQuestionId ?? null,
        action: rule.action,
        matchedRule: rule,
      };
    }
  }

  return {};
}

// Naive condition evaluator that supports simple equality / inequality comparisons.
function evaluateCondition(condition: string | undefined, context: LogicEvaluationContext): boolean {
  if (!condition) return false;
  const match = condition.match(/answer\("(.+)"\)\s*(==|!=|<=|>=|<|>)\s*(.+)/);
  if (!match) return false;

  const [, questionId, op, rawValue] = match;
  const answer = context.answers[questionId];
  const normalizedAnswer = coerceValue(answer);
  const normalizedTarget = coerceValue(rawValue);

  switch (op) {
    case '==':
      return normalizedAnswer === normalizedTarget;
    case '!=':
      return normalizedAnswer !== normalizedTarget;
    case '<':
      return normalizedAnswer < normalizedTarget;
    case '<=':
      return normalizedAnswer <= normalizedTarget;
    case '>':
      return normalizedAnswer > normalizedTarget;
    case '>=':
      return normalizedAnswer >= normalizedTarget;
    default:
      return false;
  }
}

function coerceValue(val: unknown): string | number {
  if (val === undefined || val === null) return '';
  const num = Number(val);
  if (!Number.isNaN(num) && `${val}`.trim() !== '') return num;
  return String(val).trim();
}
