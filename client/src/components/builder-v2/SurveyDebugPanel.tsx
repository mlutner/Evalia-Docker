import { useMemo, useState } from 'react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function SurveyDebugPanel() {
  // Only render in dev to avoid exposing internals in production builds
  if (!import.meta.env.DEV) {
    return null;
  }

  const { survey } = useSurveyBuilder();
  const [isOpen, setIsOpen] = useState(false);

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

  const resultsScreen = (survey as any).resultsScreen ?? survey.thankYouScreen;

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
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">{survey.status || 'draft'}</span>
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
