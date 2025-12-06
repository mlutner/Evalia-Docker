/**
 * Scoring Debug Section
 * 
 * [SCORING-DEBUG] Dev-only component that shows detailed scoring calculation traces.
 * Displays how scores are calculated for a survey/response.
 * 
 * This component:
 * - Uses the SAME scoring logic as production (via /api/dev/scoring-trace)
 * - Is READ-ONLY - does not modify any data
 * - Only renders in development mode
 * 
 * Features:
 * - Category breakdown table
 * - Question contributions table
 * - Final band selection with matched rule
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Survey } from '@shared/schema';

// ============================================================================
// TYPES (matching server response)
// ============================================================================

interface QuestionContribution {
  questionId: string;
  questionText: string;
  questionType: string;
  category: string;
  categoryName: string;
  rawAnswer: string | string[];
  optionScoreUsed: number | null;
  maxPoints: number;
  weight: number;
  contributionToCategory: number;
  normalizedContribution: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  rawScore: number;
  maxPossibleScore: number;
  normalizedScore: number;
  bandId: string;
  bandLabel: string;
  bandColor: string;
  questionCount: number;
}

interface ScoringTraceResponse {
  meta: {
    surveyId: string;
    surveyTitle: string;
    responseId: string | null;
    scoringEngineId: string | null;
    scoringEnabled: boolean;
    timestamp: string;
  };
  config: {
    enabled: boolean;
    categories: Array<{ id: string; name: string }>;
    scoreRanges: Array<{ id: string; min: number; max: number; label: string }>;
  } | null;
  questions: QuestionContribution[];
  categories: CategoryBreakdown[];
  overall: {
    score: number;
    bandId: string;
    bandLabel: string;
    bandColor: string;
    matchedRule: { id: string; min: number; max: number; label: string } | null;
  } | null;
  errors: string[];
}

interface ScoringDebugSectionProps {
  surveyId: string | undefined;
  survey?: Survey;
}

// ============================================================================
// COMPONENT
// ============================================================================

// Check if dev tools should be shown
const shouldShowDevTools = () => {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
};

export function ScoringDebugSection({ surveyId, survey }: ScoringDebugSectionProps) {
  // Only render in dev or when explicitly enabled via env var
  if (!shouldShowDevTools()) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'questions'>('categories');

  // Fetch scoring trace from dev endpoint
  const { data: trace, isLoading, error, refetch } = useQuery<ScoringTraceResponse>({
    queryKey: ['/api/dev/scoring-trace', surveyId],
    queryFn: async () => {
      if (!surveyId) throw new Error('No survey ID');
      const response = await fetch('/api/dev/scoring-trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch scoring trace');
      }
      return response.json();
    },
    enabled: !!surveyId && isExpanded,
    staleTime: 30000, // 30s
  });

  // Handle missing or empty surveyId
  if (!surveyId || surveyId === '') {
    return (
      <section className="space-y-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Scoring Debug
        </h3>
        <p className="text-xs text-gray-400 italic">
          Save survey first to enable scoring debug
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Scoring Debug
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            DEV ONLY
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-blue-600 hover:underline"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {!isExpanded ? (
        <p className="text-xs text-gray-400 italic">
          Click "Expand" to load scoring calculation trace
        </p>
      ) : (
        <div className="rounded bg-gray-50 p-3 space-y-3">
          {/* Loading state */}
          {isLoading && (
            <div className="text-xs text-gray-500 animate-pulse">
              Loading scoring trace...
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          )}

          {/* Trace data */}
          {trace && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-gray-700">
                    {trace.meta.surveyTitle}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>Engine: {trace.meta.scoringEngineId || 'default'}</span>
                    <span>•</span>
                    <span>Response: {trace.meta.responseId || 'most recent'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-[10px] text-gray-500 hover:text-gray-700"
                >
                  ↻ Refresh
                </button>
              </div>

              {/* Errors */}
              {trace.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                  {trace.errors.map((err, i) => (
                    <div key={i} className="text-xs text-amber-800">
                      ⚠ {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Overall Score */}
              {trace.overall && (
                <div className="bg-white border rounded p-2">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">
                    Overall Score
                  </div>
                  <div className="flex items-center gap-3">
                    <span 
                      className="text-lg font-bold"
                      style={{ color: trace.overall.bandColor }}
                    >
                      {trace.overall.score}%
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: trace.overall.bandColor + '20',
                        color: trace.overall.bandColor
                      }}
                    >
                      {trace.overall.bandLabel}
                    </span>
                    {trace.overall.matchedRule && (
                      <span className="text-[10px] text-gray-500">
                        Rule: {trace.overall.matchedRule.min}-{trace.overall.matchedRule.max}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-t ${
                    activeTab === 'categories' 
                      ? 'bg-white border border-b-0 border-gray-200 text-gray-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Categories ({trace.categories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-t ${
                    activeTab === 'questions' 
                      ? 'bg-white border border-b-0 border-gray-200 text-gray-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Questions ({trace.questions.length})
                </button>
              </div>

              {/* Category Breakdown Table */}
              {activeTab === 'categories' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-2 py-1 font-semibold">Category</th>
                        <th className="px-2 py-1 font-semibold text-right">Raw</th>
                        <th className="px-2 py-1 font-semibold text-right">Max</th>
                        <th className="px-2 py-1 font-semibold text-right">Score</th>
                        <th className="px-2 py-1 font-semibold">Band</th>
                        <th className="px-2 py-1 font-semibold text-right">Qs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trace.categories.map((cat) => (
                        <tr key={cat.categoryId} className="border-b border-gray-100">
                          <td className="px-2 py-1.5 font-medium">{cat.categoryName}</td>
                          <td className="px-2 py-1.5 text-right text-gray-600">
                            {cat.rawScore}
                          </td>
                          <td className="px-2 py-1.5 text-right text-gray-600">
                            {cat.maxPossibleScore}
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium">
                            {cat.normalizedScore}%
                          </td>
                          <td className="px-2 py-1.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px]"
                              style={{ 
                                backgroundColor: cat.bandColor + '20',
                                color: cat.bandColor
                              }}
                            >
                              {cat.bandLabel}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-right text-gray-500">
                            {cat.questionCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Question Contributions Table */}
              {activeTab === 'questions' && (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr className="text-left">
                        <th className="px-2 py-1 font-semibold">Question</th>
                        <th className="px-2 py-1 font-semibold">Category</th>
                        <th className="px-2 py-1 font-semibold">Answer</th>
                        <th className="px-2 py-1 font-semibold text-right">Score</th>
                        <th className="px-2 py-1 font-semibold text-right">Max</th>
                        <th className="px-2 py-1 font-semibold text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trace.questions.map((q) => (
                        <tr key={q.questionId} className="border-b border-gray-100">
                          <td className="px-2 py-1.5">
                            <div className="max-w-[150px] truncate" title={q.questionText}>
                              {q.questionId}
                            </div>
                            <div className="text-gray-400 text-[9px]">{q.questionType}</div>
                          </td>
                          <td className="px-2 py-1.5 text-gray-600">
                            {q.categoryName}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="max-w-[80px] truncate text-gray-700" title={String(q.rawAnswer)}>
                              {Array.isArray(q.rawAnswer) ? q.rawAnswer.join(', ') : q.rawAnswer}
                            </div>
                            {q.optionScoreUsed !== null && (
                              <div className="text-[9px] text-blue-500">
                                mapped → {q.optionScoreUsed}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium">
                            {q.contributionToCategory}
                          </td>
                          <td className="px-2 py-1.5 text-right text-gray-500">
                            {q.maxPoints}
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <span className={
                              q.normalizedContribution >= 70 ? 'text-green-600' :
                              q.normalizedContribution >= 40 ? 'text-amber-600' :
                              'text-red-600'
                            }>
                              {q.normalizedContribution}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {trace.questions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-2 py-4 text-center text-gray-400 italic">
                            No scorable questions answered
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Config Info */}
              {trace.config && (
                <details className="text-[10px]">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Score Config ({trace.config.categories.length} categories, {trace.config.scoreRanges.length} bands)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="font-semibold text-gray-600">Categories:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trace.config.categories.map(c => (
                          <span key={c.id} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-600">Score Ranges:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trace.config.scoreRanges.map(r => (
                          <span key={r.id} className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                            {r.label} ({r.min}-{r.max})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default ScoringDebugSection;

