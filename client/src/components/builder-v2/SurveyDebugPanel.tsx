/**
 * Survey Debug Panel
 * 
 * Dev-only tool for inspecting survey state and configuration.
 * Rendered as a floating panel in the bottom-right corner of the builder.
 * 
 * Includes:
 * - Survey state overview (title, status, questions count)
 * - Score config visualization
 * - Results/Thank You screen config
 * - Logic rules summary
 * - **Scoring Debug / Calculation Trace** (SCORING-DEBUG):
 *   - Per-question and per-category score contributions
 *   - Final band and the exact band rule that matched
 *   - Read-only: does not modify configs or responses
 * 
 * @see docs/DEV_TOOLS.md for navigation instructions
 */

import { useMemo, useState } from 'react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ScoringDebugSection } from './ScoringDebugSection';


function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

// Check if dev tools should be shown
// Either in dev mode OR when VITE_ENABLE_DEV_TOOLS env var is set
const shouldShowDevTools = () => {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
};

export function SurveyDebugPanel() {
  // Render in dev or when explicitly enabled via env var
  if (!shouldShowDevTools()) {
    return null;
  }

  const { survey } = useSurveyBuilder();
  const [isOpen, setIsOpen] = useState(false);
  const surveyId = survey?.id;

  const logicSummary = useMemo(() => {
    return survey.questions
      .filter((q) => q.logicRules?.length || q.skipCondition)
      .map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        skipCondition: q.skipCondition,
        logicRules: q.logicRules,
      }));
  }, [survey.questions]);

  const resultsScreen = survey.scoreConfig?.resultsScreen ?? survey.thankYouScreen;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-gray-800"
      >
        {isOpen ? 'Hide Survey Debug' : 'Show Survey Debug'}
      </button>

      {isOpen && (
        <div className="w-[520px] max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between pb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Survey Debug</p>
              <p className="text-sm font-medium text-gray-900">{survey.title || 'Untitled Survey'}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">{'draft'}</span>
          </div>

          <div className="space-y-3 text-xs text-gray-800">
            <section className="space-y-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Survey</h3>
              <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-[11px] leading-snug text-gray-900">{formatJson(survey)}</pre>
            </section>

            <section className="space-y-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Score Config</h3>
              <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-[11px] leading-snug text-gray-900">{formatJson(survey.scoreConfig)}</pre>
            </section>

            <section className="space-y-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Results / Thank You Screen</h3>
              <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-[11px] leading-snug text-gray-900">{formatJson(resultsScreen)}</pre>
            </section>

            <section className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Logic</h3>
                <span className="text-[11px] text-gray-500">{logicSummary.length} questions with logic</span>
              </div>
              <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-[11px] leading-snug text-gray-900">{formatJson(logicSummary)}</pre>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyDebugPanel;
