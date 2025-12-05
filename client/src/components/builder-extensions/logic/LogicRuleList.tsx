/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { LogicRuleCard } from './LogicRuleCard';
import type { BuilderLogicRule, BuilderQuestion } from '../INTEGRATION_GUIDE';

interface LogicRuleListProps {
  rules: BuilderLogicRule[];
  questions?: BuilderQuestion[];
  selectedRuleId?: string;
  onSelectRule: (id: string) => void;
  onCreateRule: () => void;
  onAISuggestRules?: () => void;
  isAILoading?: boolean;
}

export function LogicRuleList({
  rules,
  questions = [],
  selectedRuleId,
  onSelectRule,
  onCreateRule,
  onAISuggestRules,
  isAILoading = false
}: LogicRuleListProps) {
  const getQuestionText = (questionId: string) => {
    const q = questions.find(q => q.id === questionId);
    return q?.text;
  };

  return (
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-gray-700">Rules</h2>
          <span className="text-[11px] text-gray-400 tabular-nums">{rules.length}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Add Rule Button */}
        <button
          onClick={onCreateRule}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors mb-4"
        >
          <Plus size={14} className="text-gray-400" />
          Add Rule
        </button>

        {/* AI Suggest Button */}
        {onAISuggestRules && rules.length === 0 && (
          <button
            onClick={onAISuggestRules}
            disabled={isAILoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all disabled:opacity-50 disabled:cursor-wait mb-4"
          >
            <Sparkles size={14} className={isAILoading ? 'animate-pulse' : ''} />
            <span>{isAILoading ? 'Thinking...' : 'AI Suggest Rules'}</span>
          </button>
        )}

        {/* Rules List */}
        <div className="space-y-1.5 flex-1">
        {rules.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <Plus size={16} className="text-gray-400" />
            </div>
            <p className="text-[11px] text-gray-400">
              {onAISuggestRules ? 'No rules yet' : 'No rules yet'}
            </p>
          </div>
        ) : (
          rules.map(rule => (
            <LogicRuleCard
              key={rule.id}
              rule={rule}
              isSelected={rule.id === selectedRuleId}
              onClick={() => onSelectRule(rule.id)}
              questionText={getQuestionText(rule.questionId)}
            />
          ))
        )}
        </div>
      </div>
    </aside>
  );
}

