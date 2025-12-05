/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { RightPanelLayout } from '../shared/RightPanelLayout';
import type { BuilderQuestion, BuilderLogicRule } from '../INTEGRATION_GUIDE';
import { Trash2, Info } from 'lucide-react';

interface LogicRuleEditorPanelProps {
  rule?: BuilderLogicRule;
  questions: BuilderQuestion[];
  onUpdate: (rule: BuilderLogicRule) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function LogicRuleEditorPanel({
  rule,
  questions,
  onUpdate,
  onDelete,
  onClose
}: LogicRuleEditorPanelProps) {
  if (!rule) {
    return (
      <RightPanelLayout title="Rule Editor" onClose={onClose}>
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-sm text-gray-500">
            Select a rule to configure logic conditions and actions.
          </div>
        </div>
      </RightPanelLayout>
    );
  }

  // Access MP-style fields with fallbacks
  const conditionLabel = (rule as any).conditionLabel || rule.condition || '';
  const actionLabel = (rule as any).actionLabel || rule.action || '';

  const selectedQuestion = questions.find(q => q.id === rule.questionId);

  const handleUpdate = (updates: Partial<BuilderLogicRule>) => {
    onUpdate({ ...rule, ...updates });
  };

  return (
    <RightPanelLayout title="Rule Editor" onClose={onClose}>
      <div className="p-4 space-y-6">
        {/* Trigger Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Trigger
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
              Question
            </label>
            <select
              value={rule.questionId}
              onChange={e => handleUpdate({ questionId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            >
              <option value="">Select a question...</option>
              {questions.map(q => (
                <option key={q.id} value={q.id}>
                  Q{typeof q.order === 'number' ? q.order + 1 : '?'}:{' '}
                  {q.text.substring(0, 50)}...
                </option>
              ))}
            </select>
            {selectedQuestion && (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                <span className="font-medium">Type:</span>{' '}
                {selectedQuestion.displayType || selectedQuestion.type}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
              Condition
            </label>
            <input
              type="text"
              value={conditionLabel}
              onChange={e => handleUpdate({ conditionLabel: e.target.value } as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder='e.g., = "Yes" or > 5'
            />
            <div className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
              <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                This rule will activate when the respondent's answer matches
                this condition.
              </p>
            </div>
          </div>

          {/* Future: Multi-condition UI placeholder */}
          <div className="p-3 border border-dashed border-gray-300 rounded bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                Advanced Conditions
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-mono">
                COMING SOON
              </span>
            </div>
            <p className="text-xs text-gray-400">
              AND/OR logic with multiple conditions will be available soon.
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Action Section */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Action
          </label>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
              Effect
            </label>
            <input
              type="text"
              value={actionLabel}
              onChange={e => handleUpdate({ actionLabel: e.target.value } as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="e.g., Skip to Section B"
            />
            <div className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
              <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                Describe what happens when this rule triggers (skip, show, hide
                questions or sections).
              </p>
            </div>
          </div>
        </div>

        {/* Natural Language Preview */}
        {rule.questionId && selectedQuestion && (
          <>
            <div className="h-px bg-gray-200" />

            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs text-purple-600 mt-0.5">💬</span>
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Human-Readable Preview
                </span>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed italic">
                When respondent{' '}
                {conditionLabel.replace(/^IF\s*/i, '').trim() || '[condition]'} for "
                {selectedQuestion.text}", they will{' '}
                {actionLabel.replace(/^THEN\s*/i, '').trim().toLowerCase() || '[action]'}
                .
              </p>
            </div>
          </>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={() => onDelete(rule.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors w-full justify-center"
          >
            <Trash2 size={14} />
            Delete Rule
          </button>
        </div>
      </div>
    </RightPanelLayout>
  );
}

