/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { Trash2 } from 'lucide-react';

export interface BandRecommendation {
  id: string;
  title: string;
  body: string;
}

interface BandRecommendationItemProps {
  recommendation: BandRecommendation;
  onChange: (rec: BandRecommendation) => void;
  onDelete: () => void;
}

export function BandRecommendationItem({
  recommendation,
  onChange,
  onDelete
}: BandRecommendationItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <input
          type="text"
          value={recommendation.title}
          onChange={e => onChange({
            ...recommendation,
            title: e.target.value
          })}
          placeholder="Recommendation title..."
          className="flex-1 text-sm font-medium border-0 border-b border-gray-200 px-0 py-1 focus:ring-0 focus:border-gray-400 bg-transparent"
        />
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          aria-label="Delete recommendation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <textarea
        value={recommendation.body}
        onChange={e => onChange({
          ...recommendation,
          body: e.target.value
        })}
        placeholder="Describe the recommended action..."
        rows={3}
        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
      />
    </div>
  );
}
