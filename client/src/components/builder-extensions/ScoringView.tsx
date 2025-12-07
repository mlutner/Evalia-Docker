/**
 * @design-locked Magic Patterns golden spec
 * ScoringView - 3-panel layout matching LogicView
 * Left: ScoringNavigator | Center: QuestionMappingTable or BandsTable | Right: Inspector
 */
import React, { useState, useEffect, useMemo } from 'react';
import { ScoringNavigator } from './scoring/ScoringNavigator';
import { QuestionScoringInspector } from './scoring/QuestionScoringInspector';
import { BandEditor } from './scoring/BandEditor';
import { CategoryScoringInspector } from './scoring/CategoryScoringInspector';
import { RightPanelLayout } from './shared/RightPanelLayout';
import type {
  BuilderQuestion,
  QuestionScoringConfig,
  ScoringCategory,
  BuilderScoreBand,
} from './INTEGRATION_GUIDE';

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
  onChangeQuestionScoring: (questionId: string, scoring: QuestionScoringConfig) => void;
  onChangeCategory: (category: ScoringCategory) => void;
  onChangeBand: (band: BuilderScoreBand) => void;
  onDeleteBand?: (id: string) => void;
  onClosePanel: () => void;
  onSuggestScoring?: (questionId: string) => void;
  onSuggestRecommendations?: (bandId: string) => void;
  isAILoading?: boolean;
}

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
  onChangeQuestionScoring,
  onChangeCategory,
  onChangeBand,
  onDeleteBand,
  onClosePanel,
  onSuggestScoring,
  onSuggestRecommendations,
  isAILoading = false
}: ScoringViewProps) {
  // Center panel ALWAYS shows question mapping
  // Left panel shows both Categories and Bands in sections
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  // Find selected items
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const selectedQuestionScoring = selectedQuestionId
    ? scoringByQuestionId[selectedQuestionId]
    : undefined;
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedBand = bands.find(b => b.id === selectedBandId);

  // Filter questions by selected category (only when a category is selected)
  const filteredQuestions = useMemo(() => {
    if (!selectedCategoryId) {
      return questions;
    }
    return questions.filter(q => {
      const scoring = scoringByQuestionId[q.id];
      return scoring?.scoringCategory === selectedCategoryId;
    });
  }, [questions, scoringByQuestionId, selectedCategoryId]);

  // Clear bulk selection when category changes
  useEffect(() => {
    setBulkSelectedIds([]);
  }, [selectedCategoryId]);

  // Handlers
  const handleSelectCategory = (id: string) => {
    onSelectCategory(id);
    onSelectBand(''); // Clear band selection
    onSelectQuestion(''); // Clear question selection
  };

  const handleSelectBand = (id: string) => {
    onSelectBand(id);
    // Don't clear category - bands and categories are in separate sections
    onSelectQuestion(''); // Clear question selection
  };

  // [SCORING-PIPELINE] Dev-only logging
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log("[SCORING-PIPELINE] ScoringView props", {
      categoriesCount: categories.length,
      bandsCount: bands.length,
    });
  }, [categories.length, bands.length]);

  // Determine what to show in right panel
  const rightPanelContent = useMemo(() => {
    // Band selected -> Band Editor
    if (selectedBandId && selectedBand) {
      return (
        <BandEditor
          band={selectedBand}
          onChange={onChangeBand}
          onDelete={onDeleteBand}
          onClose={onClosePanel}
          onSuggestRecommendations={() =>
            selectedBandId && onSuggestRecommendations?.(selectedBandId)
          }
          isAILoading={isAILoading}
        />
      );
    }

    // Question selected -> Question Scoring Inspector
    if (selectedQuestionId && selectedQuestion) {
      return (
        <QuestionScoringInspector
          question={selectedQuestion}
          scoring={selectedQuestionScoring}
          categories={categories}
          isScoreable={['multiple_choice', 'rating', 'likert', 'nps', 'opinion_scale'].includes(
            selectedQuestion?.type || ''
          )}
          onChange={scoring =>
            selectedQuestionId && onChangeQuestionScoring(selectedQuestionId, scoring)
          }
          onClose={onClosePanel}
          onSuggestScoring={() =>
            selectedQuestionId && onSuggestScoring?.(selectedQuestionId)
          }
        />
      );
    }

    // Category selected -> Category Inspector
    if (selectedCategoryId && selectedCategory) {
      return (
        <CategoryScoringInspector
          category={selectedCategory}
          bands={bands}
          questions={questions.map(q => ({ id: q.id, text: q.text }))}
          onUpdateCategory={(updates) => {
            onChangeCategory({ ...selectedCategory, ...updates } as ScoringCategory);
          }}
          onClose={onClosePanel}
        />
      );
    }

    // Empty state
    return (
      <RightPanelLayout title="Scoring Inspector" onClose={onClosePanel}>
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">
            Select an item to configure
          </p>
          <p className="text-xs text-gray-400">
            Choose a category, question, or band from the left to view details.
          </p>
        </div>
      </RightPanelLayout>
    );
  }, [
    selectedBandId, selectedBand, selectedQuestionId, selectedQuestion,
    selectedCategoryId, selectedCategory, selectedQuestionScoring,
    categories, bands, questions, isAILoading,
    onChangeBand, onDeleteBand, onClosePanel, onSuggestRecommendations,
    onChangeQuestionScoring, onSuggestScoring, onChangeCategory
  ]);

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Left Panel: Scoring Navigator */}
      <ScoringNavigator
        categories={categories}
        bands={bands}
        selectedCategoryId={selectedCategoryId}
        selectedBandId={selectedBandId}
        viewMode="categories"
        onSelectCategory={handleSelectCategory}
        onSelectBand={handleSelectBand}
        onViewModeChange={() => {}}
      />

      {/* Center Panel: Always shows Question Mapping */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[15px] font-medium text-gray-900 tracking-tight">
                Scoring
              </h2>
              {filteredQuestions.length > 0 && (
                <span className="text-[13px] text-gray-400 tabular-nums">
                  {filteredQuestions.filter(q => scoringByQuestionId[q.id]?.scorable).length} scored
                </span>
              )}
            </div>
            {selectedCategoryId && selectedCategory && (
              <p className="text-[13px] text-gray-400 mt-1">
                {selectedCategory.name}
              </p>
            )}
          </div>

          {/* Question Cards - Unified spacing with Logic view */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {selectedCategoryId
                    ? 'No questions in this category'
                    : 'No questions yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedCategoryId
                    ? 'Assign questions to this category to see them here'
                    : 'Add questions to your survey to configure scoring'}
                </p>
              </div>
            ) : (
              filteredQuestions.map((question, idx) => {
                const scoring = scoringByQuestionId[question.id];
                const isSelected = selectedQuestionId === question.id;
                const isScorable = ['multiple_choice', 'rating', 'likert', 'nps', 'opinion_scale'].includes(question.type);
                const categoryName = categories.find(c => c.id === scoring?.scoringCategory)?.name;

                return (
                  <div
                    key={question.id}
                    onClick={() => onSelectQuestion(question.id)}
                    className={`
                      group bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? 'border-purple-400 bg-purple-50/50 shadow-lg shadow-purple-100/50 ring-1 ring-purple-200'
                        : 'border-gray-200 hover:border-purple-200 hover:shadow-md hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      {/* Question Number - pill style */}
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                        ${isSelected
                          ? 'bg-purple-600 text-white'
                          : scoring?.scorable
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }
                      `}>
                        {idx + 1}
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        {/* Type & badges row */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {question.displayType || question.type}
                          </span>
                          {question.required && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-semibold border border-rose-100">
                              Required
                            </span>
                          )}
                        </div>

                        {/* Question text */}
                        <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                          {question.text}
                        </p>

                        {/* Scoring info row */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          {isScorable ? (
                            scoring?.scorable ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Scorable
                                </span>
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {scoring.scoreWeight || 1}× weight
                                </span>
                                {categoryName && (
                                  <span className="text-[11px] px-2 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                                    {categoryName}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[11px] px-2 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                                Not scored
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] px-2 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                              Not scorable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Inspector */}
      {rightPanelContent}
    </div>
  );
}
