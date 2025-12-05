/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import type { ScoringCategory } from '../INTEGRATION_GUIDE';

interface QuestionMappingBulkBarProps {
  selectedCount: number;
  categories: ScoringCategory[];
  onSetCategory: (categoryId: string) => void;
  onSetWeight: (weight: number) => void;
  onToggleReverse: () => void;
  onClearSelection: () => void;
}

export function QuestionMappingBulkBar({
  selectedCount,
  categories,
  onSetCategory,
  onSetWeight,
  onToggleReverse,
  onClearSelection
}: QuestionMappingBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm font-medium whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="h-4 w-px bg-gray-700" />

      <div className="flex items-center gap-2">
        <div className="w-40">
          <select
            onChange={e => onSetCategory(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white h-8 text-xs rounded px-2 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            defaultValue=""
          >
            <option value="" disabled>
              Set Category
            </option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {(cat as any).label ?? (cat as any).name ?? cat.id}
              </option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <input
            type="number"
            placeholder="Weight"
            onChange={e => onSetWeight(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 text-white h-8 text-xs rounded px-2 placeholder:text-gray-500 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        <button
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 h-8 text-xs rounded transition-colors"
          onClick={onToggleReverse}
        >
          Toggle Reverse
        </button>
      </div>

      <div className="h-4 w-px bg-gray-700" />

      <button
        onClick={onClearSelection}
        className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
