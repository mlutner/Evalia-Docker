/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { Sparkles } from 'lucide-react';
import type { BuilderQuestion, QuestionScoringConfig, ScoringCategory } from '../INTEGRATION_GUIDE';

export interface QuestionScoringSectionProps {
  question: BuilderQuestion;
  scoring: QuestionScoringConfig;
  isScoreable: boolean;
  onChange: (scoring: QuestionScoringConfig) => void;
  onSuggestScoring?: () => void;
  categories?: ScoringCategory[];
}

export function QuestionScoringSection({
  question,
  scoring,
  isScoreable,
  onChange,
  onSuggestScoring,
  categories = []
}: QuestionScoringSectionProps) {
  const catLabel = (cat: ScoringCategory) => (cat as any).label ?? (cat as any).name ?? cat.id;

  return (
    <div className="p-4 space-y-4">
      {!isScoreable ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-700">
            {question.displayType || question.type} questions are not scoreable.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Only rating, selection, and scale questions can be scored.
          </p>
        </div>
      ) : (
        <>
          {onSuggestScoring && (
            <button
              onClick={onSuggestScoring}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Sparkles size={16} className="text-gray-400" />
              <span>AI Suggest Scoring</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <input
              id={`scorable-${question.id}`}
              type="checkbox"
              checked={scoring.scorable}
              onChange={e => onChange({
                ...scoring,
                scorable: e.target.checked
              })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label
              htmlFor={`scorable-${question.id}`}
              className="text-sm text-gray-700 cursor-pointer font-medium"
            >
              Enable Scoring for this Question
            </label>
          </div>

          {scoring.scorable ? (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
                  Score Weight
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={scoring.scoreWeight}
                  onChange={e => onChange({
                    ...scoring,
                    scoreWeight: Number(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Multiplier for this question's score
                </p>
              </div>

              {/* Category selector if categories provided */}
              {categories.length > 0 ? (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Scoring Category
                  </label>
                  <select
                    value={scoring.scoringCategory || ''}
                    onChange={e => onChange({
                      ...scoring,
                      scoringCategory: e.target.value || undefined
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {catLabel(cat)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Group questions into scoring categories
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Scoring Category
                  </label>
                  <input
                    value={scoring.scoringCategory || ''}
                    onChange={e => onChange({
                      ...scoring,
                      scoringCategory: e.target.value
                    })}
                    placeholder="e.g., Knowledge, Skills"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Group questions into scoring categories
                  </p>
                </div>
              )}

              {/* Reverse scoring toggle */}
              <div className="flex items-center gap-2">
                <input
                  id={`reverse-${question.id}`}
                  type="checkbox"
                  checked={scoring.reverse || false}
                  onChange={e => onChange({
                    ...scoring,
                    reverse: e.target.checked
                  })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor={`reverse-${question.id}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Reverse Scoring
                </label>
              </div>

              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Point Distribution
                  </label>
                  <div className="space-y-2">
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate flex-1 mr-3">
                          {option}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={scoring.scoreValues?.[idx] ?? 0}
                          onChange={e => {
                            const next = [...(scoring.scoreValues || [])];
                            next[idx] = Number(e.target.value) || 0;
                            onChange({
                              ...scoring,
                              scoreValues: next
                            });
                          }}
                          className="w-16 px-2 py-1 text-sm text-center border border-gray-200 rounded font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">
                Enable scoring to add point values and track correct answers.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
