import type { LogicRule } from '@shared/schema';

const OPERATORS = ['==', '!=', '<', '<=', '>', '>='];

export function validateLogicRules(
  rules: LogicRule[] | undefined,
  questionId: string,
  validQuestionIds?: Set<string>
): LogicRule[] {
  if (!rules) return [];

  const sanitized: LogicRule[] = [];
  const seen = new Set<string>();
  const hasIds = validQuestionIds && validQuestionIds.size > 0;

  for (const rule of rules) {
    if (!rule?.id || seen.has(rule.id)) continue;
    seen.add(rule.id);

    const parsed = parseCondition(rule.condition);
    if (!parsed.questionId) continue;
    if (hasIds && !validQuestionIds!.has(parsed.questionId)) continue;
    if (rule.targetQuestionId) {
      if (hasIds && !validQuestionIds!.has(rule.targetQuestionId)) continue;
      if (rule.targetQuestionId === questionId) continue; // self skip
    }

    const operator = OPERATORS.includes(parsed.operator) ? parsed.operator : '==';
    const condition = buildCondition({ ...parsed, operator });

    sanitized.push({
      id: rule.id,
      condition,
      action: rule.action,
      targetQuestionId: rule.targetQuestionId ?? null,
    });
  }

  return sanitized;
}

type ParsedCondition = { questionId: string; operator: string; value: string };

function parseCondition(condition?: string): ParsedCondition {
  if (!condition) return { questionId: '', operator: '==', value: '' };
  const match = condition.match(/answer\("(.+)"\)\s*(==|!=|<=|>=|<|>)\s*(.+)/);
  if (!match) return { questionId: '', operator: '==', value: '' };
  return { questionId: match[1], operator: match[2], value: match[3] };
}

function buildCondition({ questionId, operator, value }: ParsedCondition) {
  if (!questionId) return '';
  return `answer("${questionId}") ${operator} ${value}`;
}
