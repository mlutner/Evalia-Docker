/**
 * @design-locked Magic Patterns golden spec
 * LogicRuleCard - Compact card for left panel rule list
 */
import React from 'react';
import { ArrowRight, Eye, EyeOff, XCircle, AlertCircle } from 'lucide-react';
import type { BuilderLogicRule } from '../INTEGRATION_GUIDE';

interface LogicRuleCardProps {
  rule: BuilderLogicRule;
  isSelected?: boolean;
  onClick?: () => void;
  questionText?: string;
  conflictingRules?: string[];
}

/**
 * Format a raw condition to be more readable
 */
function formatCondition(condition: string): string {
  if (!condition) return 'No condition';
  
  const match = condition.match(/answer\("([^"]+)"\)\s*(==|!=|<=|>=|<|>)\s*"?([^"]*)"?/);
  if (match) {
    const [, , operator, value] = match;
    const opText = operator === '==' ? 'is' 
      : operator === '!=' ? 'is not'
      : operator === '<' ? '<'
      : operator === '>' ? '>'
      : operator === '<=' ? '≤'
      : operator === '>=' ? '≥'
      : operator;
    return `${opText} "${value}"`;
  }
  
  return condition.replace(/answer\("([^"]+)"\)/g, '').replace(/==/g, '=').trim() || condition;
}

/**
 * Format question ID for display
 */
function formatQuestionId(id: string): string {
  if (!id) return '?';
  const match = id.match(/^q(\d+)/i);
  if (match) return match[1];
  if (id.includes('-') && id.length > 20) return id.split('-')[0];
  return id;
}

export function LogicRuleCard({
  rule,
  isSelected = false,
  onClick,
  questionText,
  conflictingRules = []
}: LogicRuleCardProps) {
  const rawCondition = (rule as any).conditionLabel || rule.condition || '';
  const conditionLabel = formatCondition(rawCondition);
  const actionLabel = (rule as any).actionLabel || rule.action || '';
  const hasConflict = conflictingRules.length > 0;

  const getActionIcon = () => {
    const action = actionLabel.toLowerCase();
    if (action.includes('skip')) return <ArrowRight size={12} className="text-blue-500" />;
    if (action.includes('show')) return <Eye size={12} className="text-emerald-500" />;
    if (action.includes('hide')) return <EyeOff size={12} className="text-orange-500" />;
    if (action.includes('end')) return <XCircle size={12} className="text-rose-500" />;
    return <ArrowRight size={12} className="text-gray-400" />;
  };

  const getActionColor = () => {
    const action = actionLabel.toLowerCase();
    if (action.includes('skip')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (action.includes('show')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (action.includes('hide')) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (action.includes('end')) return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  // Get target question number
  const targetQ = rule.targetQuestionId ? formatQuestionId(rule.targetQuestionId) : null;

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-2.5 rounded-lg border text-left transition-all duration-150
        ${isSelected
          ? 'border-purple-300 bg-purple-50/80 shadow-sm'
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-start gap-2.5">
        {/* Question number */}
        <div className={`
          w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors
          ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}
        `}>
          Q{formatQuestionId(rule.questionId)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Condition */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">When</span>
            <span className="text-[11px] text-gray-600 truncate font-medium">
              {conditionLabel}
            </span>
          </div>

          {/* Action badge */}
          <div className="flex items-center gap-1.5">
            <span className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border
              ${getActionColor()}
            `}>
              {getActionIcon()}
              <span className="uppercase">{actionLabel}</span>
              {targetQ && (
                <>
                  <ArrowRight size={8} className="opacity-50" />
                  <span>Q{targetQ}</span>
                </>
              )}
            </span>
            
            {hasConflict && (
              <AlertCircle size={12} className="text-amber-500" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
