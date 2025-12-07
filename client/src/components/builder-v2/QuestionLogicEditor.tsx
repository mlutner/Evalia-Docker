import React from 'react';
import { Plus, Trash2, Brain } from 'lucide-react';
import { useSurveyBuilder, BuilderQuestion } from '@/contexts/SurveyBuilderContext';
import { FEATURES } from '@/config/features';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type ParsedCondition = {
  questionId: string;
  operator: string;
  value: string;
};

const OPERATORS = ['==', '!=', '<', '<=', '>', '>='];

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

export function QuestionLogicEditor({ question }: { question: BuilderQuestion }) {
  const { questions, updateQuestion } = useSurveyBuilder();

  if (!FEATURES.logicV2) return null;

  const logicRules = question.logicRules || [];

  const handleToggleLogic = (enabled: boolean) => {
    updateQuestion(question.id, {
      hasLogic: enabled,
      logicRules: enabled ? logicRules : [],
    });
  };

  const handleRuleChange = (idx: number, updater: (parsed: ParsedCondition, rule: any) => { condition: string; targetQuestionId?: string | null; action?: 'skip' | 'show' | 'end' }) => {
    const existing = logicRules[idx];
    const parsed = parseCondition(existing?.condition);
    const next = updater(parsed, existing);
    const newRules = [...logicRules];
    newRules[idx] = {
      id: existing?.id || `logic-${Date.now()}-${idx}`,
      condition: next.condition,
      action: next.action ?? existing?.action ?? 'skip',
      targetQuestionId: next.targetQuestionId ?? existing?.targetQuestionId,
    };
    updateQuestion(question.id, { logicRules: newRules, hasLogic: true });
  };

  const handleAddRule = () => {
    const newRule = {
      id: `logic-${Date.now()}`,
      condition: '',
      action: 'skip' as const,
      targetQuestionId: '',
    };
    updateQuestion(question.id, { logicRules: [...logicRules, newRule], hasLogic: true });
  };

  const handleRemoveRule = (idx: number) => {
    const newRules = logicRules.filter((_, i) => i !== idx);
    updateQuestion(question.id, { logicRules: newRules, hasLogic: newRules.length > 0 });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="logic-enabled"
          checked={question.hasLogic}
          onCheckedChange={(checked) => handleToggleLogic(!!checked)}
        />
        <Label htmlFor="logic-enabled" className="text-sm text-gray-800 font-medium">
          Enable logic for this question
        </Label>
      </div>

      {question.hasLogic && (
        <div className="space-y-3">
          {logicRules.map((rule, idx) => {
            const parsed = parseCondition(rule.condition);
            return (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Rule {idx + 1}</span>
                  <button
                    onClick={() => handleRemoveRule(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-700">If</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={parsed.questionId || ''}
                      onValueChange={(val) =>
                        handleRuleChange(idx, (p, r) => ({
                          condition: buildCondition({ ...p, questionId: val }),
                          targetQuestionId: r?.targetQuestionId,
                          action: r?.action,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select question" />
                      </SelectTrigger>
                      <SelectContent>
                        {questions
                          .filter((q) => q.id !== question.id)
                          .map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.order + 1}. {q.text.slice(0, 30)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={parsed.operator}
                      onValueChange={(val) =>
                        handleRuleChange(idx, (p, r) => ({
                          condition: buildCondition({ ...p, operator: val }),
                          targetQuestionId: r?.targetQuestionId,
                          action: r?.action,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      value={parsed.value}
                      onChange={(e) =>
                        handleRuleChange(idx, (p, r) => ({
                          condition: buildCondition({ ...p, value: e.target.value }),
                          targetQuestionId: r?.targetQuestionId,
                          action: r?.action,
                        }))
                      }
                      placeholder="Value"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-700">Then</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={rule.action}
                      onValueChange={(val) =>
                        handleRuleChange(idx, (p, r) => ({
                          condition: buildCondition(p),
                          action: val as any,
                          targetQuestionId: r?.targetQuestionId,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Skip to</SelectItem>
                        <SelectItem value="show">Show</SelectItem>
                        <SelectItem value="end">End survey</SelectItem>
                      </SelectContent>
                    </Select>

                    {rule.action !== 'end' && (
                      <Select
                        value={rule.targetQuestionId || ''}
                        onValueChange={(val) =>
                          handleRuleChange(idx, (p, r) => ({
                            condition: buildCondition(p),
                            action: r?.action,
                            targetQuestionId: val,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Target question" />
                        </SelectTrigger>
                        <SelectContent>
                          {questions
                            .filter((q) => q.id !== question.id)
                            .map((q) => (
                              <SelectItem key={q.id} value={q.id}>
                                {q.order + 1}. {q.text.slice(0, 30)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleAddRule}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add rule
          </button>

          <Button variant="outline" disabled className="w-full flex items-center justify-center gap-2">
            <Brain size={16} /> Ask AI to suggest branching (coming soon)
          </Button>
        </div>
      )}
    </div>
  );
}
