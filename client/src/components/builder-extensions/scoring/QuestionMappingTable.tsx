/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { QuestionMappingRow } from './QuestionMappingRow';
import { QuestionMappingBulkBar } from './QuestionMappingBulkBar';
import type { BuilderQuestion, QuestionScoringConfig, ScoringCategory } from '../INTEGRATION_GUIDE';
import { Search, Filter, ArrowUpDown, Sparkles } from 'lucide-react';

interface QuestionMappingTableProps {
  questions: BuilderQuestion[];
  scoringByQuestionId: Record<string, QuestionScoringConfig>;
  categories: ScoringCategory[];
  selectedQuestionId?: string;
  bulkSelectedIds: string[];
  onSelectQuestion: (id: string) => void;
  onToggleBulkSelect: (id: string) => void;
  onToggleAll: (selected: boolean) => void;
  onChangeScoring: (questionId: string, scoring: QuestionScoringConfig) => void;
  onBulkUpdate: (updates: Partial<QuestionScoringConfig>) => void;
  onAIAutoMap?: () => void;
  isAILoading?: boolean;
}

export function QuestionMappingTable({
  questions,
  scoringByQuestionId,
  categories,
  selectedQuestionId,
  bulkSelectedIds,
  onSelectQuestion,
  onToggleBulkSelect,
  onToggleAll,
  onChangeScoring,
  onBulkUpdate,
  onAIAutoMap,
  isAILoading = false
}: QuestionMappingTableProps) {
  const allSelected = questions.length > 0 && bulkSelectedIds.length === questions.length;
  const hasUnmappedQuestions = questions.some(q => {
    const scoring = scoringByQuestionId[q.id];
    return !scoring || !scoring.scoringCategory;
  });

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header with Search & Filter */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Question Mapping
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Map questions to scoring categories and assign weights
            </p>
          </div>
          <div className="flex gap-2">
            {/* AI Auto-Map Button */}
            {onAIAutoMap && hasUnmappedQuestions && (
              <button
                onClick={onAIAutoMap}
                disabled={isAILoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                <Sparkles size={12} className={isAILoading ? 'animate-pulse' : ''} />
                <span>{isAILoading ? 'Mapping...' : 'AI Auto-Map'}</span>
              </button>
            )}
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded border border-gray-200 bg-white">
              <Filter size={14} />
            </button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded border border-gray-200 bg-white">
              <ArrowUpDown size={14} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200 shadow-sm">
            <tr>
              <th className="p-3 w-10 sticky left-0 bg-gray-50 z-30 border-r border-gray-200">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => onToggleAll(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wide sticky left-10 bg-gray-50 z-30 border-r border-gray-200 min-w-[200px]">
                Question
              </th>
              <th className="p-3 w-24 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Scorable
              </th>
              <th className="p-3 w-48 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Category
              </th>
              <th className="p-3 w-24 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Weight
              </th>
              <th className="p-3 w-20 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Reverse
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map(q => (
              <QuestionMappingRow
                key={q.id}
                question={q}
                scoring={scoringByQuestionId[q.id] || {
                  scorable: false,
                  scoreWeight: 1
                }}
                categoryOptions={categories}
                isSelected={q.id === selectedQuestionId}
                isBulkSelected={bulkSelectedIds.includes(q.id)}
                onToggleBulkSelect={() => onToggleBulkSelect(q.id)}
                onClick={() => onSelectQuestion(q.id)}
                onChangeScoring={scoring => onChangeScoring(q.id, scoring)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <QuestionMappingBulkBar
        selectedCount={bulkSelectedIds.length}
        categories={categories}
        onSetCategory={cat => onBulkUpdate({ scoringCategory: cat })}
        onSetWeight={w => onBulkUpdate({ scoreWeight: w })}
        onToggleReverse={() => onBulkUpdate({ reverse: true })}
        onClearSelection={() => onToggleAll(false)}
      />
    </div>
  );
}
