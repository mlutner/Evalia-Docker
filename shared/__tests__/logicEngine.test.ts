import { describe, it, expect } from 'vitest';
import { evaluateLogicRules } from '../logicEngine';
import type { LogicRule, Question } from '@shared/schema';

const questions: Question[] = [];

describe('logicEngine evaluateLogicRules', () => {
  it('matches numeric >= condition', () => {
    const rules: LogicRule[] = [
      { id: 'r1', condition: 'answer("q1") >= 3', action: 'skip', targetQuestionId: 'q2' },
    ];
    const result = evaluateLogicRules(rules, { questions, answers: { q1: 4 } });
    expect(result.matchedRule?.id).toBe('r1');
    expect(result.action).toBe('skip');
  });

  it('does not match when numeric condition fails', () => {
    const rules: LogicRule[] = [
      { id: 'r1', condition: 'answer("q1") >= 3', action: 'skip', targetQuestionId: 'q2' },
    ];
    const result = evaluateLogicRules(rules, { questions, answers: { q1: 2 } });
    expect(result.matchedRule).toBeUndefined();
  });

  it('matches string equality condition', () => {
    const rules: LogicRule[] = [
      { id: 'r1', condition: 'answer("q2") == Yes', action: 'show', targetQuestionId: 'q3' },
    ];
    const result = evaluateLogicRules(rules, { questions, answers: { q2: 'Yes' } });
    expect(result.matchedRule?.id).toBe('r1');
    expect(result.action).toBe('show');
  });

  it('returns only the first matching rule', () => {
    const rules: LogicRule[] = [
      { id: 'r1', condition: 'answer("q1") >= 3', action: 'skip', targetQuestionId: 'q2' },
      { id: 'r2', condition: 'answer("q1") >= 2', action: 'end' },
    ];
    const result = evaluateLogicRules(rules, { questions, answers: { q1: 4 } });
    expect(result.matchedRule?.id).toBe('r1');
    expect(result.action).toBe('skip');
  });
});
