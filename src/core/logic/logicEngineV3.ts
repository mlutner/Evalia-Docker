/**
 * EVALIA CORE MODULE (VERSIONED)
 *
 * DO NOT CHANGE existing function signatures, return types, or field names.
 * Additive changes only; V2 remains the default wiring.
 *
 * LogicEngineV3 is an additive, non-breaking extension of V2.
 *
 * Supports:
 *  - OR groups:  a || b || c
 *  - AND groups: a && b && c
 *  - contains("qId","Value") for multi-select/string answers
 *
 * Precedence:
 *  - Split on OR (||), then split each group on AND (&&)
 *  - No parentheses: evaluation is left-to-right deterministic.
 *
 * Versioning:
 *  - V2 remains the default engine for runtime.
 *  - V3 may be selected in builder-v2 as an optional upgrade.
 *
 * Frozen Guarantee:
 *  - V2 never changes; V3 may only receive additive improvements.
 *
 * Adds support for basic AND/OR grouping and contains() for multi-select answers.
 */

import type { LogicRule, Question } from '@shared/schema';

export interface LogicEvaluationContext {
  questions: Question[];
  answers: Record<string, unknown>;
}

export interface LogicResult {
  nextQuestionId?: string | null;
  action?: 'skip' | 'show' | 'end';
  matchedRule?: LogicRule;
}

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

function evaluateCondition(condition: string | undefined, context: LogicEvaluationContext): boolean {
  if (!condition) return false;

  // OR groups (||) – any group passing returns true
  const orGroups = condition.split('||').map((part) => part.trim()).filter(Boolean);
  if (orGroups.length === 0) return false;

  return orGroups.some((group) => {
    const andParts = group.split('&&').map((part) => part.trim()).filter(Boolean);
    if (andParts.length === 0) return false;
    return andParts.every((expr) => evaluateExpression(expr, context));
  });
}

function evaluateExpression(expr: string, context: LogicEvaluationContext): boolean {
  // contains("qId","Value")
  const containsMatch = expr.match(/contains\("(.+?)"\s*,\s*"(.+?)"\)/);
  if (containsMatch) {
    const [, questionId, target] = containsMatch;
    const answer = context.answers[questionId];
    if (Array.isArray(answer)) {
      return answer.map(String).includes(target);
    }
    if (typeof answer === 'string') {
      return answer.split(',').map((v) => v.trim()).includes(target) || answer === target;
    }
    return false;
  }

  // Equality/inequality comparisons on answer("id")
  const match = expr.match(/answer\("(.+?)"\)\s*(==|!=|<=|>=|<|>)\s*(.+)/);
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
  const str = String(val).trim();
  const num = Number(str);
  if (!Number.isNaN(num) && str !== '') return num;
  // Strip surrounding quotes in literals
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
}
