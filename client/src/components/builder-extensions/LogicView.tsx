/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React, { useMemo } from 'react';
import { LogicRuleList } from './logic/LogicRuleList';
import { LogicRuleEditorPanel } from './logic/LogicRuleEditorPanel';
import { LogicQuestionTimeline } from './logic/LogicQuestionTimeline';
import type { BuilderQuestion, BuilderLogicRule } from './INTEGRATION_GUIDE';

interface LogicViewProps {
  rules: BuilderLogicRule[];
  questions: BuilderQuestion[];
  selectedRuleId?: string;
  onSelectRule: (id: string) => void;
  onUpdateRule: (rule: BuilderLogicRule) => void;
  onDeleteRule: (id: string) => void;
  onCreateRule: () => void;
  onClosePanel: () => void;
  onAISuggestRules?: () => void;
  isAILoading?: boolean;
}

export function LogicView({
  rules,
  questions,
  selectedRuleId,
  onSelectRule,
  onUpdateRule,
  onDeleteRule,
  onCreateRule,
  onClosePanel,
  onAISuggestRules,
  isAILoading = false
}: LogicViewProps) {
  const selectedRule = rules.find(r => r.id === selectedRuleId);

  // Group rules by source question ID for the timeline
  const rulesByQuestion = useMemo(() => {
    const grouped: Record<string, BuilderLogicRule[]> = {};
    for (const rule of rules) {
      const qId = rule.questionId;
      if (!grouped[qId]) {
        grouped[qId] = [];
      }
      grouped[qId].push(rule);
    }
    return grouped;
  }, [rules]);

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Left Panel: Rule List */}
      <LogicRuleList
        rules={rules}
        questions={questions}
        selectedRuleId={selectedRuleId}
        onSelectRule={onSelectRule}
        onCreateRule={onCreateRule}
        onAISuggestRules={onAISuggestRules}
        isAILoading={isAILoading}
      />

      {/* Center Canvas: Question Timeline */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[15px] font-medium text-gray-900 tracking-tight">
                Logic
              </h2>
              {rules.length > 0 && (
                <span className="text-[13px] text-gray-400 tabular-nums">
                  {rules.length} rule{rules.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <LogicQuestionTimeline
            questions={questions}
            rulesByQuestion={rulesByQuestion}
            selectedRule={selectedRule}
            onSelectRule={onSelectRule}
          />
        </div>
      </div>

      {/* Right Panel: Editor */}
      <LogicRuleEditorPanel
        rule={selectedRule}
        questions={questions}
        onUpdate={onUpdateRule}
        onDelete={onDeleteRule}
        onClose={onClosePanel}
      />
    </div>
  );
}
