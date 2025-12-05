import React, { useEffect, useState } from "react";
import { ScoringSummaryPanel } from "./scoring/ScoringSummaryPanel";
import { QuestionMappingTable } from "./scoring/QuestionMappingTable";
import { QuestionScoringInspector } from "./scoring/QuestionScoringInspector";
import { CategoriesList } from "./scoring/CategoriesList";
import { BandsTable } from "./scoring/BandsTable";
import { BandEditor, type BuilderScoreBand } from "./scoring/BandEditor";
import type {
  BuilderQuestion,
  ScoringCategory,
  QuestionScoringConfig,
} from "./INTEGRATION_GUIDE";

type ScoringTab = "mapping" | "categories";

interface ScoringViewProps {
  questions: BuilderQuestion[];
  scoringByQuestionId: Record<string, QuestionScoringConfig>;
  categories: ScoringCategory[];
  bands: BuilderScoreBand[];

  selectedQuestionId?: string;
  selectedCategoryId?: string;
  selectedBandId?: string;

  onSelectQuestion: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onSelectBand: (id: string) => void;

  // keep for future editing; DO NOT use them yet
  onChangeQuestionScoring?: (id: string, update: Partial<QuestionScoringConfig>) => void;
  onChangeCategory?: (id: string, update: Partial<ScoringCategory>) => void;
  onChangeBand?: (id: string, update: Partial<BuilderScoreBand>) => void;

  onClosePanel?: () => void;
}

// [SCORING-PIPELINE] ScoringView - displays scoring configuration in Builder
export function ScoringView({
  questions,
  scoringByQuestionId,
  categories,
  bands,
  selectedQuestionId,
  selectedCategoryId,
  selectedBandId,
  onSelectQuestion,
  onSelectCategory,
  onSelectBand,
  onClosePanel,
}: ScoringViewProps) {
  // [SCORING-PIPELINE] Log received props
  // eslint-disable-next-line no-console
  console.log("[SCORING-PIPELINE] ScoringView received props", {
    categoriesCount: categories.length,
    bandsCount: bands.length,
    categoryIds: categories.map((c) => c.id),
    bandIds: bands.map((b) => b.id),
  });
  
  // [SCORING-PIPELINE] GUARD: Alert if receiving zero data
  if (categories.length === 0 && bands.length === 0) {
    console.warn("[SCORING-PIPELINE] ScoringView received empty categories AND bands!", {
      questionsCount: questions.length,
      categoriesCount: categories.length,
      bandsCount: bands.length,
    });
  }
  
  const [activeTab, setActiveTab] = useState<ScoringTab>("mapping");

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);
  const selectedQuestionScoring =
    (selectedQuestion && scoringByQuestionId[selectedQuestion.id]) || undefined;
  const selectedBand = bands.find((b) => b.id === selectedBandId);
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);
  void currentCategory; // reserved for future category-specific UI
  
  // [SCORING-PIPELINE] Track changes to scoring data
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[SCORING-PIPELINE] ScoringView data updated", {
      categoriesCount: categories.length,
      bandsCount: bands.length,
    });
  }, [categories, bands]);

  return (
    <div className="flex-1 min-h-0 bg-white border-l border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-gray-900">Scoring</p>
          <div className="flex gap-1 text-xs font-semibold border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1.5 ${
                activeTab === "mapping" ? "bg-purple-50 text-purple-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("mapping")}
            >
              Question Mapping
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 ${
                activeTab === "categories" ? "bg-purple-50 text-purple-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              Categories &amp; Bands
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span data-testid="scoring-debug-counts">
            cats={categories.length} • bands={bands.length}
          </span>
          {onClosePanel && (
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50"
              onClick={onClosePanel}
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {activeTab === "mapping" ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-4">
              <ScoringSummaryPanel
                questions={questions}
                scoringByQuestionId={scoringByQuestionId}
                categories={categories}
                bands={bands}
              />
              <QuestionMappingTable
                questions={questions}
                scoringByQuestionId={scoringByQuestionId}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={onSelectQuestion}
              />
            </div>
          </div>
          <QuestionScoringInspector
            question={selectedQuestion}
            scoring={selectedQuestionScoring}
          />
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 h-full">
            <div className="col-span-1">
              <CategoriesList
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <BandsTable
                bands={bands}
                selectedBandId={selectedBandId}
                onSelectBand={onSelectBand}
              />
              <BandEditor band={selectedBand} readOnly onClose={onClosePanel} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
