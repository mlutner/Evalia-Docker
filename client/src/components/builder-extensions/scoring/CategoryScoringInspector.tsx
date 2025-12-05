/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { RightPanelLayout } from '../shared/RightPanelLayout';
import type { ScoringCategory, BuilderScoreBand } from '../INTEGRATION_GUIDE';
import { Trash2, TrendingUp } from 'lucide-react';

interface CategoryScoringInspectorProps {
  category?: ScoringCategory;
  bands: BuilderScoreBand[];
  questions?: Array<{ id: string; text: string }>;
  onUpdateCategory: (updates: Partial<ScoringCategory>) => void;
  onClose: () => void;
}

export function CategoryScoringInspector({
  category,
  bands,
  questions = [],
  onUpdateCategory,
  onClose
}: CategoryScoringInspectorProps) {
  if (!category) {
    return (
      <RightPanelLayout title="Category" onClose={onClose}>
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-sm text-gray-500">
            Select a category to configure its details and bands.
          </div>
        </div>
      </RightPanelLayout>
    );
  }

  const catLabel = (category as any).label ?? (category as any).name ?? category.id;
  const categoryBands = bands
    .filter(b => (b as any).categoryId === category.id)
    .sort((a, b) => b.min - a.min);

  // For now, simple category question filter
  const categoryQuestions = questions.filter(q => 
    q.id.startsWith(category.id)
  );

  // Calculate score preview
  const calculateScorePreview = (score: number) => {
    const band = categoryBands.find(b => score >= b.min && score <= b.max);
    return band || null;
  };

  const previewScores = [25, 50, 75, 90];

  const getBandColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-400';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <RightPanelLayout title="Category" badge={catLabel} onClose={onClose}>
      <div className="p-4 space-y-6">
        {/* Category Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Category Name
            </label>
            <input
              value={catLabel}
              onChange={e => onUpdateCategory({ label: e.target.value } as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              ID
            </label>
            <input
              value={category.id}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 bg-gray-50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-transparent h-24 resize-none"
              value={(category as any).description || ''}
              onChange={e => onUpdateCategory({ description: e.target.value } as any)}
              placeholder="Describe what this category measures..."
            />
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Questions in Category */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Questions in Category
          </h4>

          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-sm text-gray-700 font-medium mb-1">
              {categoryQuestions.length} questions
            </div>
            <div className="text-xs text-gray-500">
              Mapped to this category in Question Mapping tab
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Bands Summary */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Bands Summary
          </h4>

          {categoryBands.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-xs text-gray-500">
              No bands defined yet
            </div>
          ) : (
            <div className="space-y-2">
              {categoryBands.map(band => (
                <div
                  key={band.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getBandColor((band as any).color)}`} />
                    <span className="font-medium text-gray-700 text-sm">
                      {band.label}
                    </span>
                  </div>
                  <span className="font-mono text-gray-500 text-xs">
                    {band.min} - {band.max}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score Preview */}
        {categoryBands.length > 0 && (
          <>
            <div className="h-px bg-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Score Preview
                </h4>
              </div>

              <div className="space-y-2">
                {previewScores.map(score => {
                  const band = calculateScorePreview(score);
                  return (
                    <div
                      key={score}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                    >
                      <span className="font-mono text-gray-600">{score}%</span>
                      <span className="text-gray-500">→</span>
                      {band ? (
                        <span className="font-medium text-gray-700">
                          {band.label}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          No band
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors w-full justify-center">
            <Trash2 size={14} />
            Delete Category
          </button>
        </div>
      </div>
    </RightPanelLayout>
  );
}
