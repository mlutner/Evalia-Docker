/**
 * @non-mp-design Custom summary panel (NOT from Magic Patterns golden spec)
 * This is a supplemental component for debugging/summary purposes.
 * Consider removing if not actively used.
 */
import React, { useMemo, useState } from "react";
import type { BuilderQuestion, ScoringCategory, QuestionScoringConfig, BuilderScoreBand } from "../INTEGRATION_GUIDE";

interface ScoringSummaryPanelProps {
  questions: BuilderQuestion[];
  scoringByQuestionId: Record<string, QuestionScoringConfig>;
  categories: ScoringCategory[];
  bands: BuilderScoreBand[];
  onClosePanel?: () => void;
}

export function ScoringSummaryPanel({
  questions,
  scoringByQuestionId,
  categories,
  bands,
  onClosePanel,
}: ScoringSummaryPanelProps) {
  const scorableQuestions = useMemo(
    () => questions.filter((q) => scoringByQuestionId[q.id]?.scorable),
    [questions, scoringByQuestionId]
  );

  const categoriesWithCounts = useMemo(
    () =>
      categories.map((cat) => {
        const questionCount = scorableQuestions.filter(
          (q) => scoringByQuestionId[q.id]?.scoringCategory === cat.id
        ).length;
        return { ...cat, questionCount };
      }),
    [categories, scorableQuestions, scoringByQuestionId]
  );

  const [selectedBandId, setSelectedBandId] = useState<string | undefined>(bands[0]?.id);
  const selectedBand = bands.find((b) => b.id === selectedBandId) ?? bands[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Scoring summary</p>
        {onClosePanel && (
          <button
            type="button"
            className="text-xs text-gray-500 underline"
            onClick={onClosePanel}
          >
            Close
          </button>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">Scorable questions</p>
        {scorableQuestions.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">No scorable questions yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {scorableQuestions.map((q) => {
              const scoring = scoringByQuestionId[q.id];
              return (
                <li key={q.id} className="p-2 border border-gray-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{q.text}</p>
                  <p className="text-xs text-gray-500">
                    Weight: {scoring?.scoreWeight ?? 1} • Category: {scoring?.scoringCategory || "Unassigned"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">Categories</p>
        {categoriesWithCounts.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">No categories configured.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs text-gray-600">
            {categoriesWithCounts.map((cat) => {
              const catLabel = (cat as any).label ?? (cat as any).name ?? cat.id;
              const catDescription = (cat as any).description;
              return (
                <li
                  key={cat.id}
                  className="flex items-center justify-between border border-gray-200 rounded px-2 py-1"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{catLabel}</span>
                    {catDescription && <span className="text-gray-500">{catDescription}</span>}
                  </div>
                  <span className="text-gray-500">{cat.questionCount} question(s)</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">Bands</p>
        {bands.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">No score ranges configured.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {bands.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm ${selectedBandId === band.id ? "bg-purple-50" : ""}`}
                  onClick={() => setSelectedBandId(band.id)}
                >
                  <p className="font-semibold text-gray-900">{band.label}</p>
                  <p className="text-xs text-gray-500">
                    {band.min} – {band.max}
                  </p>
                  {band.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{band.description}</p>
                  )}
                </button>
              ))}
            </div>
            <div className="border border-gray-200 rounded-lg p-3 space-y-2">
              {selectedBand ? (
                <>
                  <p className="text-sm font-semibold text-gray-900">{selectedBand.label}</p>
                  <p className="text-xs text-gray-500">
                    Range: {selectedBand.min} – {selectedBand.max}
                  </p>
                  {selectedBand.color && (
                    <p className="text-xs text-gray-500">Color: {selectedBand.color}</p>
                  )}
                  {selectedBand.description && (
                    <p className="text-xs text-gray-500">{selectedBand.description}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Select a band to preview.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
