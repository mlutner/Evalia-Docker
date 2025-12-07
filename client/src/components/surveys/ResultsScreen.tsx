import React from 'react';
import { scoreSurvey } from '@shared/scoringEngine';
import { resolveScoreBand, resolveCategoryBands } from '@shared/resultsEngine';
import { resolveResultsMode, getResultsModeLabels } from '@shared/resultsMode';
import type {
  Question as EvaliaQuestion,
  SurveyScoreConfig,
  ResultsScreenConfig,
  ScoreBandConfig,
} from '@shared/schema';
import type { ScoringResult } from '@core/scoring/strategies';

function percent(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function buildResultsView(params: {
  questions: EvaliaQuestion[];
  responses: Record<string, unknown>;
  scoreConfig?: SurveyScoreConfig | null;
  resultsConfig?: ResultsScreenConfig | null;
  scoring?: ScoringResult | null;
  band?: ScoreBandConfig | null;
}) {
  const {
    questions,
    responses,
    scoreConfig,
    resultsConfig,
    scoring: scoringOverride,
    band: bandOverride,
  } = params;

  const scoring =
    scoringOverride ||
    scoreSurvey({ questions, responses, scoreConfig: scoreConfig || undefined });

  const bands =
    resultsConfig?.scoreRanges ||
    scoreConfig?.resultsScreen?.scoreRanges ||
    scoreConfig?.scoreRanges ||
    [];

  const band =
    bandOverride !== undefined
      ? bandOverride
      : resolveScoreBand(scoring.percentage, bands);

  return { scoring, band };
}

export function ResultsScreen({
  questions,
  responses,
  scoreConfig,
  resultsConfig,
  scoring,
  band,
  scoringEngineId,
  tags,
}: {
  questions: EvaliaQuestion[];
  responses: Record<string, unknown>;
  scoreConfig?: SurveyScoreConfig | null;
  resultsConfig?: ResultsScreenConfig | null;
  scoring?: ScoringResult | null;
  band?: ScoreBandConfig | null;
  scoringEngineId?: string | null;
  tags?: string[];
}) {
  if (!resultsConfig?.enabled) return null;

  const { scoring: scored, band: resolvedBand } = buildResultsView({
    questions,
    responses,
    scoreConfig,
    resultsConfig,
    scoring,
    band,
  });
  const pct = percent(scored.totalScore, scored.maxScore);

  // RES-RESULTS-MODES-001: Determine results mode
  const mode = resolveResultsMode(scoreConfig || undefined, scoringEngineId, tags);
  const labels = getResultsModeLabels(mode);

  const categoryLabels = (id: string) =>
    scoreConfig?.categories?.find((c) => c.id === id)?.name || id;

  const categories = Object.entries(scored.byCategory).map(([id, data]) => ({
    id,
    label: categoryLabels(id),
    score: data.score,
    maxScore: data.maxScore,
    pct: percent(data.score, data.maxScore || 0),
  }));
  const categoryBands = resolveCategoryBands(
    Object.fromEntries(
      categories.map((c) => [
        c.id,
        { score: c.score, maxScore: c.maxScore, label: c.label },
      ])
    ),
    scoreConfig
  );
  const sorted = [...categories].sort((a, b) => b.pct - a.pct);
  const strengths = resultsConfig.showStrengthsAndRisks ? sorted.slice(0, 3) : [];
  const risks = resultsConfig.showStrengthsAndRisks ? sorted.slice(-3) : [];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">{resultsConfig.title || 'Results'}</p>
            <h2 className="text-2xl font-bold text-gray-900">{resultsConfig.subtitle || 'Summary'}</h2>
          </div>
          {resultsConfig.showOverallBand && resolvedBand && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ backgroundColor: resolvedBand.color || '#eef2ff', color: '#111827' }}
            >
              {resolvedBand.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">{labels.scoreLabel || 'Total Score'}</p>
            <p className="text-3xl font-bold text-gray-900">
              {resultsConfig.showTotalScore ? scored.totalScore.toFixed(1) : '—'}
            </p>
            {resultsConfig.showPercentage && (
              <p className="text-sm text-gray-600">{pct}%</p>
            )}
            {resolvedBand?.summary && (
              <p className="text-xs text-gray-500 mt-2">{resolvedBand.summary}</p>
            )}
            {resolvedBand?.managerTips && resolvedBand.managerTips.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-gray-600">Tips for managers</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {resolvedBand.managerTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {resolvedBand?.orgActions && resolvedBand.orgActions.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-gray-600">Actions for leadership</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {resolvedBand.orgActions.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-gray-50 space-y-2">
            <p className="text-xs text-gray-500">Categories</p>
            {resultsConfig.showCategoryBreakdown && categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-2">
                      {cat.label}
                      {resultsConfig.showCategoryBands && categoryBands[cat.id] && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: categoryBands[cat.id]?.color || '#eef2ff',
                            color: '#111827',
                          }}
                        >
                          {categoryBands[cat.id]?.label}
                        </span>
                      )}
                    </span>
                    <span>{cat.score.toFixed(1)} / {cat.maxScore.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${cat.maxScore ? percent(cat.score, cat.maxScore) : 0}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No categories configured.</p>
            )}
          </div>
        </div>

        {resultsConfig.showStrengthsAndRisks && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Strengths</p>
              {strengths.length === 0 && <p className="text-xs text-gray-500">None</p>}
              <div className="flex flex-wrap gap-2">
                {strengths.map((s) => (
                  <span key={s.id} className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                    {s.id} ({s.pct}%)
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Focus areas</p>
              {risks.length === 0 && <p className="text-xs text-gray-500">None</p>}
              <div className="flex flex-wrap gap-2">
                {risks.map((r) => (
                  <span key={r.id} className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                    {r.id} ({r.pct}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {resultsConfig.showCallToAction && resultsConfig.ctaLabel && resultsConfig.ctaUrl && (
        <div className="border-t border-gray-100 p-4 flex justify-end">
          <a
            href={resultsConfig.ctaUrl}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
          >
            {resultsConfig.ctaLabel}
          </a>
        </div>
      )}
      {!resultsConfig.showCallToAction && resultsConfig.footerNote && (
        <div className="border-t border-gray-100 p-4 text-xs text-gray-500">{resultsConfig.footerNote}</div>
      )}
    </div>
  );
}
