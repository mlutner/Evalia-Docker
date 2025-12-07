/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import type { BuilderQuestion, QuestionScoringConfig, ScoringCategory } from '../INTEGRATION_GUIDE';

interface QuestionMappingRowProps {
  question: BuilderQuestion;
  scoring: QuestionScoringConfig;
  categoryOptions: ScoringCategory[];
  isSelected: boolean;
  isBulkSelected: boolean;
  onToggleBulkSelect: () => void;
  onClick: () => void;
  onChangeScoring: (scoring: QuestionScoringConfig) => void;
}

export function QuestionMappingRow({
  question,
  scoring,
  categoryOptions,
  isSelected,
  isBulkSelected,
  onToggleBulkSelect,
  onClick,
  onChangeScoring
}: QuestionMappingRowProps) {
  const catLabel = (cat: ScoringCategory) => (cat as any).label ?? (cat as any).name ?? cat.id;

  return (
    <tr
      onClick={onClick}
      className={`
        border-b border-gray-100 transition-colors cursor-pointer group
        ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}
      `}
    >
      {/* Frozen Checkbox Column */}
      <td
        className={`p-3 w-10 sticky left-0 z-10 border-r border-gray-200 group-hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isBulkSelected}
          onChange={onToggleBulkSelect}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      </td>

      {/* Frozen Question Name Column */}
      <td
        className={`p-3 text-sm text-gray-700 font-medium max-w-xs sticky left-10 z-10 border-r border-gray-200 group-hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : 'bg-white'}`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500">
              Q{typeof question.order === 'number' ? question.order + 1 : '?'}
            </span>
            <span className="truncate font-medium text-gray-900" title={question.text}>
              {question.text}
            </span>
          </div>
          <div className="flex gap-2">
            {question.required && (
              <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-medium bg-red-50 px-1 rounded border border-red-200">
                Required
              </span>
            )}
            {scoring.reverse && (
              <span className="flex items-center gap-0.5 text-[10px] text-purple-600 font-medium bg-purple-50 px-1 rounded border border-purple-200">
                Reverse
              </span>
            )}
            {!scoring.scorable && (
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1 rounded border border-gray-200">
                Excluded
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="p-3 w-24 text-center" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={scoring.scorable}
          onChange={e => onChangeScoring({
            ...scoring,
            scorable: e.target.checked
          })}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      </td>

      <td className="p-3 w-48" onClick={e => e.stopPropagation()}>
        <select
          value={scoring.scoringCategory || ''}
          onChange={e => onChangeScoring({
            ...scoring,
            scoringCategory: e.target.value
          })}
          className="w-full h-8 text-xs border border-gray-200 rounded bg-white text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          disabled={!scoring.scorable}
        >
          <option value="">Select Category...</option>
          {categoryOptions.map(cat => (
            <option key={cat.id} value={cat.id}>
              {catLabel(cat)}
            </option>
          ))}
        </select>
      </td>

      <td className="p-3 w-24" onClick={e => e.stopPropagation()}>
        <input
          type="number"
          value={scoring.scoreWeight}
          onChange={e => onChangeScoring({
            ...scoring,
            scoreWeight: Number(e.target.value)
          })}
          className="w-full h-8 text-xs border border-gray-200 rounded px-2 text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          disabled={!scoring.scorable}
        />
      </td>

      <td className="p-3 w-20 text-center" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={scoring.reverse || false}
          onChange={e => onChangeScoring({
            ...scoring,
            reverse: e.target.checked
          })}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
          disabled={!scoring.scorable}
        />
      </td>
    </tr>
  );
}
