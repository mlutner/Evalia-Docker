/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { RightPanelLayout } from '../shared/RightPanelLayout';
import { QuestionHeader } from '../shared/QuestionHeader';
import { QuestionScoringSection } from '../shared/QuestionScoringSection';
import type { BuilderQuestion, QuestionScoringConfig, ScoringCategory } from '../INTEGRATION_GUIDE';
import { TrendingUp, Info, RotateCcw } from 'lucide-react';

interface QuestionScoringInspectorProps {
  question?: BuilderQuestion;
  scoring?: QuestionScoringConfig;
  categories: ScoringCategory[];
  isScoreable: boolean;
  onChange: (scoring: QuestionScoringConfig) => void;
  onClose: () => void;
  onSuggestScoring?: () => void;
  onResetScoring?: () => void;
}

export function QuestionScoringInspector({
  question,
  scoring,
  categories,
  isScoreable,
  onChange,
  onClose,
  onSuggestScoring,
  onResetScoring
}: QuestionScoringInspectorProps) {
  if (!question || !scoring) {
    return (
      <RightPanelLayout title="Scoring" onClose={onClose}>
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-sm text-gray-500">
            Select a question to configure its scoring rules.
          </div>
        </div>
      </RightPanelLayout>
    );
  }

  // Calculate score preview
  const calculateScorePreview = () => {
    if (!scoring.scorable || !scoring.scoreValues) return null;
    const total = scoring.scoreValues.reduce((sum, val) => sum + val, 0);
    const max = Math.max(...scoring.scoreValues);
    const min = Math.min(...scoring.scoreValues);
    const weighted = total * scoring.scoreWeight;
    return { min, max, total, weighted };
  };

  const scorePreview = calculateScorePreview();
  const selectedCategory = categories.find(c => c.id === scoring.scoringCategory);
  const catLabel = selectedCategory 
    ? (selectedCategory as any).label ?? (selectedCategory as any).name ?? selectedCategory.id 
    : null;

  return (
    <RightPanelLayout 
      title="Scoring" 
      badge={question.displayType || question.type} 
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Question Header */}
        <div className="p-4 border-b border-gray-200">
          <QuestionHeader question={question} questionNumber={question.order + 1} />
        </div>

        {/* Score Preview Panel */}
        {scorePreview && scoring.scorable && (
          <div className="mx-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-purple-600" />
              <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                Score Preview
              </h4>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-purple-600">Min Score:</span>
                <span className="font-mono text-purple-700 font-medium">
                  {scorePreview.min} pts
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-purple-600">Max Score:</span>
                <span className="font-mono text-purple-700 font-medium">
                  {scorePreview.max} pts
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-purple-600">Total Possible:</span>
                <span className="font-mono text-purple-700 font-medium">
                  {scorePreview.total} pts
                </span>
              </div>
              {scoring.scoreWeight !== 1 && (
                <div className="flex justify-between text-xs pt-2 border-t border-purple-200">
                  <span className="text-purple-600 font-medium">
                    Weighted Total:
                  </span>
                  <span className="font-mono text-purple-700 font-medium">
                    {scorePreview.weighted} pts
                  </span>
                </div>
              )}
            </div>

            {selectedCategory && (
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="text-xs text-purple-600">
                  <span className="font-medium">Category:</span> {catLabel}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Type Hint */}
        {question.options && question.options.length > 0 && (
          <div className="mx-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-start gap-2">
              <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">
                  This is a {question.displayType || question.type} question
                  with {question.options.length} options.
                </p>
                <p>
                  Points will apply in the same order as the options appear.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scoring Configuration */}
        <QuestionScoringSection
          question={question}
          scoring={scoring}
          isScoreable={isScoreable}
          onChange={onChange}
          onSuggestScoring={onSuggestScoring}
        />

        {/* Tooltips / Guidance */}
        <div className="mx-4 space-y-3 pb-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-start gap-2 mb-2">
              <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">Weight</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Weight multiplies the raw point value for this question. Use
              weights &gt;1 to emphasize critical questions.
            </p>
          </div>

          {scoring.reverse && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="flex items-start gap-2 mb-2">
                <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">
                  Reverse Scoring
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Reverse scoring subtracts the score from the maximum instead of
                adding it. Useful for negative sentiment items.
              </p>
            </div>
          )}

          {/* Reset Button */}
          {onResetScoring && scoring.scorable && (
            <button
              onClick={onResetScoring}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Reset to Default
            </button>
          )}
        </div>
      </div>
    </RightPanelLayout>
  );
}
