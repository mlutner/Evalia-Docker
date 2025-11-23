import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Plus, Trash2, FileText, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { Question, SurveyScoreConfig } from "@shared/schema";
import { ScoringQuestionCard } from "./ScoringQuestionCard";

interface ScoringConfigurationProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  categories: Array<{ id: string; name: string }>;
  questions?: Question[];
  scoreConfig?: SurveyScoreConfig;
  newCategoryName: string;
  onNewCategoryNameChange: (name: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (catId: string) => void;
  onQuestionsChange?: (questions: Question[]) => void;
  onAutoGenerateScoring: () => void;
  isAutoGenerating: boolean;
  expandedCategories: string[];
  onToggleExpandCategory: (catId: string) => void;
  expandedRanges: string[];
  onToggleExpandRange: (rangeId: string) => void;
  getCategoryRanges: (catId: string) => any[];
  onAddScoreRange: (catId: string) => void;
  onUpdateScoreRange: (index: number, field: string, value: any) => void;
  onRemoveScoreRange: (index: number) => void;
  onSaveScoring: () => void;
  getQuestionTypeLabel: (type: string) => string;
  getMaxPointsForQuestion: (q: Question) => number;
  scorableQuestions: Question[];
  isQuestionScorable: (q: Question) => boolean;
  isScorableQuestion: (q: Question) => boolean;
}

export function ScoringConfiguration({
  isEnabled,
  onToggle,
  categories,
  questions = [],
  scoreConfig,
  newCategoryName,
  onNewCategoryNameChange,
  onAddCategory,
  onRemoveCategory,
  onQuestionsChange,
  onAutoGenerateScoring,
  isAutoGenerating,
  expandedCategories,
  onToggleExpandCategory,
  expandedRanges,
  onToggleExpandRange,
  getCategoryRanges,
  onAddScoreRange,
  onUpdateScoreRange,
  onRemoveScoreRange,
  onSaveScoring,
  getQuestionTypeLabel,
  getMaxPointsForQuestion,
  scorableQuestions,
  isQuestionScorable,
  isScorableQuestion,
}: ScoringConfigurationProps) {
  const nonScorableQuestions = questions?.filter(q => !isQuestionScorable(q)) || [];
  const scoreRanges = scoreConfig?.scoreRanges || [];

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const questionId = active.id as string;
    const categoryId = over.id as string;

    if (categoryId === "unassigned") {
      const updated = questions.map(q =>
        q.id === questionId ? { ...q, scoringCategory: undefined } : q
      );
      onQuestionsChange?.(updated);
    } else {
      const updated = questions.map(q =>
        q.id === questionId ? { ...q, scoringCategory: categoryId } : q
      );
      onQuestionsChange?.(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable Scoring Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Enable Scoring</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Respondents will see their assessment results
            {questions?.some(q => q.sectionId) && categories.length === 0 && (
              <span className="block mt-1 text-primary font-medium">
                💡 Survey sections will auto-populate as scoring categories
              </span>
            )}
            {nonScorableQuestions.length > 0 && isEnabled && (
              <span className="block mt-1 text-amber-600 dark:text-amber-500 font-medium">
                ℹ️ {nonScorableQuestions.length} question(s) won't be scored (text, email, date fields aren't scorable)
              </span>
            )}
          </p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} data-testid="switch-enable-scoring" />
      </div>

      {isEnabled && (
        <div className="space-y-4 pt-2">
          {/* AI Auto-Generate */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs font-medium text-primary mb-2">Quick Setup</p>
            <Button
              onClick={onAutoGenerateScoring}
              disabled={isAutoGenerating || questions.length === 0}
              className="w-full"
              variant="outline"
              size="sm"
              data-testid="button-auto-generate-scoring"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isAutoGenerating ? "Generating..." : "AI Auto-Generate Scoring"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Let AI analyze your questions and create scoring automatically
            </p>
          </div>

          {/* Add Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Add Scoring Category</label>
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => onNewCategoryNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddCategory();
                  }
                }}
                placeholder="e.g., Leadership, Engagement, Technical Skills..."
                className="text-sm"
                data-testid="input-category-name"
              />
              <Button
                type="button"
                onClick={onAddCategory}
                size="sm"
                className="flex-shrink-0"
                data-testid="button-add-category"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <DndContext onDragEnd={handleQuestionDragEnd}>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const ranges = getCategoryRanges(cat.id);
                  const assignedQuestions = scorableQuestions.filter(q => q.scoringCategory === cat.id);
                  const maxPossiblePoints = assignedQuestions.reduce((sum, q) => sum + getMaxPointsForQuestion(q), 0);
                  const isExpanded = expandedCategories.includes(cat.id);
                  const otherCategories = categories.filter(c => c.id !== cat.id);

                  return (
                    <div key={cat.id} className="border rounded-lg bg-card overflow-hidden" data-testid={`category-${cat.id}`}>
                      {/* Category Header */}
                      <button
                        onClick={() => onToggleExpandCategory(cat.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ChevronRight
                            className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                          <div className="text-left min-w-0">
                            <h4 className="font-semibold text-sm">{cat.name}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                              <span>{assignedQuestions.length} question{assignedQuestions.length !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{ranges.length} score range{ranges.length !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span className="text-primary font-medium">{maxPossiblePoints} max pts</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCategory(cat.id);
                          }}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          data-testid={`button-remove-category-${cat.id}`}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </button>

                      {isExpanded && (
                        <div className="border-t bg-muted/10 p-4 space-y-3">
                          {/* Assigned Questions */}
                          {assignedQuestions.length > 0 && (
                            <div className="bg-background rounded border p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-semibold text-foreground">Assigned Questions</h5>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {assignedQuestions.length}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Hover to move between categories</p>
                              <div className="space-y-1.5">
                                {assignedQuestions.map((q) => (
                                  <ScoringQuestionCard
                                    key={q.id}
                                    question={q}
                                    currentCategoryId={cat.id}
                                    isAssigned={true}
                                    otherCategories={otherCategories}
                                    onMoveToCategory={(targetCatId) => {
                                      const updated = questions.map(quest =>
                                        quest.id === q.id ? { ...quest, scoringCategory: targetCatId } : quest
                                      );
                                      onQuestionsChange?.(updated);
                                    }}
                                    onMoveToUnassigned={() => {
                                      const updated = questions.map(quest =>
                                        quest.id === q.id ? { ...quest, scoringCategory: undefined } : quest
                                      );
                                      onQuestionsChange?.(updated);
                                    }}
                                    getQuestionTypeLabel={getQuestionTypeLabel}
                                    getMaxPointsForQuestion={getMaxPointsForQuestion}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Score Ranges */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold">Score Ranges</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAddScoreRange(cat.id)}
                                className="h-6 text-xs"
                                data-testid={`button-add-range-${cat.id}`}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Range
                              </Button>
                            </div>

                            {ranges.length > 0 ? (
                              <div className="space-y-2">
                                {ranges.map((range, idx) => {
                                  const actualIdx = scoreRanges.indexOf(range);
                                  const rangeId = `${cat.id}-${actualIdx}`;
                                  const isRangeExpanded = expandedRanges.includes(rangeId);
                                  const categoryMaxScore = getCategoryRanges(cat.id).reduce(
                                    (max, r) => Math.max(max, r.maxScore),
                                    100
                                  );

                                  return (
                                    <div key={actualIdx} className="bg-background rounded border overflow-hidden">
                                      <button
                                        onClick={() => onToggleExpandRange(rangeId)}
                                        className="w-full flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors text-left"
                                        data-testid={`button-toggle-range-${actualIdx}`}
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <ChevronRight
                                            className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                                              isRangeExpanded ? 'rotate-90' : ''
                                            }`}
                                          />
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-medium text-sm">{range.label}</span>
                                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                {range.minScore}-{range.maxScore}
                                              </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                              {range.interpretation || "No interpretation yet"}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                          of {categoryMaxScore}
                                        </span>
                                      </button>

                                      {isRangeExpanded && (
                                        <div className="border-t bg-muted/20 p-3 space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">
                                              Interpretation (shown to respondents)
                                            </label>
                                            <Textarea
                                              placeholder="What does this score range mean?"
                                              value={range.interpretation}
                                              onChange={(e) =>
                                                onUpdateScoreRange(actualIdx, 'interpretation', e.target.value)
                                              }
                                              className="text-xs resize-none"
                                              rows={2}
                                              data-testid={`textarea-range-interpretation-${actualIdx}`}
                                            />
                                          </div>

                                          <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">
                                              Score Range (Best practice: 0-100 scale)
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                              <Input
                                                placeholder="Label"
                                                value={range.label}
                                                onChange={(e) =>
                                                  onUpdateScoreRange(actualIdx, 'label', e.target.value)
                                                }
                                                className="text-xs"
                                                data-testid={`input-range-label-${actualIdx}`}
                                              />
                                              <Input
                                                placeholder="Min (e.g. 0)"
                                                type="number"
                                                value={range.minScore}
                                                onChange={(e) =>
                                                  onUpdateScoreRange(
                                                    actualIdx,
                                                    'minScore',
                                                    parseInt(e.target.value) || 0
                                                  )
                                                }
                                                className="text-xs"
                                                data-testid={`input-range-min-${actualIdx}`}
                                              />
                                              <Input
                                                placeholder="Max (e.g. 100)"
                                                type="number"
                                                value={range.maxScore}
                                                onChange={(e) =>
                                                  onUpdateScoreRange(
                                                    actualIdx,
                                                    'maxScore',
                                                    parseInt(e.target.value) || 0
                                                  )
                                                }
                                                className="text-xs"
                                                data-testid={`input-range-max-${actualIdx}`}
                                              />
                                            </div>
                                          </div>

                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveScoreRange(actualIdx)}
                                            className="h-6 text-xs text-destructive w-full"
                                            data-testid={`button-remove-range-${actualIdx}`}
                                          >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Remove Score Range
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic py-2">
                                No score ranges yet. Add one to define scoring levels.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Unassigned Questions Pool */}
              {scorableQuestions.filter(q => !q.scoringCategory).length > 0 && (
                <div className="border-2 border-dashed rounded-lg p-4 bg-muted/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Unassigned Questions
                    </h5>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {scorableQuestions.filter(q => !q.scoringCategory).length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Assign to a category to include in scoring</p>
                  <div className="space-y-1.5">
                    {scorableQuestions.filter(q => !q.scoringCategory).map((q) => (
                      <div
                        key={q.id}
                        className="flex items-start justify-between p-2 bg-background rounded border hover:bg-muted/40 transition-colors text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{q.question}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getQuestionTypeLabel(q.type)} • {getMaxPointsForQuestion(q)}pt
                          </p>
                        </div>
                        <Select
                          onValueChange={(catId) => {
                            const updated = questions.map(quest =>
                              quest.id === q.id ? { ...quest, scoringCategory: catId } : quest
                            );
                            onQuestionsChange?.(updated);
                          }}
                        >
                          <SelectTrigger
                            className="h-6 w-28 text-xs px-2 ml-2 flex-shrink-0"
                            data-testid={`button-assign-unassigned-${q.id}`}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            <span>Assign to</span>
                          </SelectTrigger>
                          <SelectContent align="end">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              Choose Category
                            </div>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DndContext>
          )}

          {/* Save Button */}
          <Button onClick={onSaveScoring} className="w-full" size="sm" data-testid="button-save-scoring">
            <Plus className="w-4 h-4 mr-2" />
            Save Scoring Configuration
          </Button>
        </div>
      )}
    </div>
  );
}
