import { useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { SurveyBuilderProvider } from "@/contexts/SurveyBuilderContext";
import { ProgressFlowStepper } from "@/components/builder-v2/ProgressFlowStepper";
import { QuestionLibrary } from "@/components/builder-v2/QuestionLibrary";
import { BuilderCanvas } from "@/components/builder-v2/BuilderCanvas";
import { QuestionConfigPanel } from "@/components/builder-v2/QuestionConfigPanel";
import { BuilderActionBar } from "@/components/builder-v2/BuilderActionBar";
import { SurveyDebugPanel } from "@/components/builder-v2/SurveyDebugPanel";
import { BuilderModeToggle } from "@/components/builder-v2/BuilderModeToggle";
import { LogicView } from "@/components/builder-extensions/LogicView";
import { ScoringView } from "@/components/builder-extensions/ScoringView";
import type { BuilderMode } from "@/types/builderModes";
import { FEATURES } from "@/config/features";
import type { ScoreBandConfig } from "@shared/schema";
import { useSurveyBuilder } from "@/contexts/SurveyBuilderContext";
import type {
  QuestionScoringConfig,
  ScoringCategory,
  BuilderScoreBand,
  BuilderLogicRule,
} from "@/components/builder-extensions/INTEGRATION_GUIDE";
import { useRoute, useLocation } from 'wouter';
import { SurveyBuilderProvider } from '@/contexts/SurveyBuilderContext';
import { ProgressFlowStepper } from '@/components/builder-v2/ProgressFlowStepper';
import { QuestionLibrary } from '@/components/builder-v2/QuestionLibrary';
import { BuilderCanvas } from '@/components/builder-v2/BuilderCanvas';
import { QuestionConfigPanel } from '@/components/builder-v2/QuestionConfigPanel';
import { BuilderActionBar } from '@/components/builder-v2/BuilderActionBar';
import { SurveyDebugPanel } from '@/components/builder-v2/SurveyDebugPanel';

export default function SurveyBuilderV2() {
  // Support both /builder/:id and /builder-v2/:id routes
  const [, paramsV2] = useRoute("/builder-v2/:id");
  const [, paramsBuilder] = useRoute("/builder/:id");
  const surveyId = paramsV2?.id || paramsBuilder?.id;

  return (
    <SurveyBuilderProvider surveyId={surveyId}>
      <SurveyBuilderContent surveyId={surveyId} />
    </SurveyBuilderProvider>
  );
}

function SurveyBuilderContent({ surveyId }: { surveyId?: string }) {
  const [, setLocation] = useLocation();
  // Future: switch between build | logic | scoring modes without altering current layout.
  const [builderMode, setBuilderMode] = useState<BuilderMode>("build");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedBandId, setSelectedBandId] = useState<string | undefined>(undefined);
  const [selectedLogicRuleId, setSelectedLogicRuleId] = useState<string | undefined>(undefined);
  const modesEnabled = FEATURES.builderModesV2;
  // [SCORING-PIPELINE] Get scoring data from BuilderContext
  const {
    survey,
    questions,
    saveSurvey,
    addLogicRule,
    updateLogicRule,
    deleteLogicRule,
    scoreConfig,
    setQuestionScoring,
    updateScoringCategory,
    updateScoringBand,
    deleteScoringBand,
  } = useSurveyBuilder();
  
  // [SCORING-PIPELINE] Build question-to-scoring mapping
  const scoringByQuestionId = useMemo<Record<string, QuestionScoringConfig>>(
    () =>
      Object.fromEntries(
        questions.map((q) => [
          q.id,
          {
            scorable: !!q.scorable,
            scoreWeight: q.scoreWeight ?? 1,
            scoringCategory: q.scoringCategory,
            scoreValues: q.scoreValues,
          } satisfies QuestionScoringConfig,
        ])
      ),
    [questions]
  );
  
  // [SCORING-PIPELINE] Transform categories from scoreConfig for UI
  const categories: ScoringCategory[] = useMemo(
    () =>
      (scoreConfig?.categories || []).map((cat) => ({
        ...cat,
        label: (cat as any).name ?? (cat as any).label ?? cat.id,
        description: (cat as any).description ?? "",
      })),
    [scoreConfig?.categories]
  );
  
  // [SCORING-PIPELINE] Transform score bands from scoreConfig for UI
  const bands: BuilderScoreBand[] = useMemo(
    () =>
      (scoreConfig?.scoreRanges || []).map((band: ScoreBandConfig) => ({
        ...band,
        description:
          (band as any).longDescription ?? (band as any).shortDescription ?? (band as any).description ?? "",
        color: (band as any).color ?? "",
      })),
    [scoreConfig?.scoreRanges]
  );
  
  // [SCORING-PIPELINE] Dev-only logging and guards
  if (import.meta.env.DEV) {
    const rawCats = scoreConfig?.categories?.length ?? 0;
    const rawBands = scoreConfig?.scoreRanges?.length ?? 0;
    
    // Log scoring data transformation
    // eslint-disable-next-line no-console
    console.log("[SCORING-PIPELINE] SurveyBuilderV2 scoring data", {
      surveyId: survey.id,
      contextEnabled: scoreConfig?.enabled,
      contextCategoriesCount: rawCats,
      contextBandsCount: rawBands,
      mappedCategoriesCount: categories.length,
      mappedBandsCount: bands.length,
    });
    
    // GUARD: Detect data loss during transformation
    if (rawCats !== categories.length) {
      // eslint-disable-next-line no-console
      console.error("[SCORING-PIPELINE] Categories lost during mapping!", {
        surveyId: survey.id,
        rawCount: rawCats,
        mappedCount: categories.length,
      });
    }
    if (rawBands !== bands.length) {
      // eslint-disable-next-line no-console
      console.error("[SCORING-PIPELINE] Bands lost during mapping!", {
        surveyId: survey.id,
        rawCount: rawBands,
        mappedCount: bands.length,
      });
    }
    
    // GUARD: Warn if UI will display zeros for enabled scoring
    if (scoreConfig?.enabled && (categories.length === 0 || bands.length === 0)) {
      // eslint-disable-next-line no-console
      console.error("[SCORING-PIPELINE] UI will display zeros for enabled scoring!", {
        surveyId: survey.id,
        enabled: scoreConfig.enabled,
        categoriesCount: categories.length,
        bandsCount: bands.length,
      });
    }
  }

  const handlePreview = async () => {
    // [QUESTION-PIPELINE] Preview must save first, with skipValidation: true
    // This ensures questions are persisted before navigating to preview
    console.log("[QUESTION-PIPELINE] ====== handlePreview CALLED ======", {
      surveyId,
      questionsCount: questions.length,
      surveyTitle: survey?.title,
    });
    
    // Always save before preview, skip validation so draft state is saved
    const result = await saveSurvey({ skipValidation: true });
    
    console.log("[QUESTION-PIPELINE] saveSurvey returned:", {
      result,
      id: result?.id,
      idType: typeof result?.id,
      validation: result?.validation ? 'has validation' : 'no validation',
    });
    
    if (!result?.id) {
      console.error("[QUESTION-PIPELINE] Preview aborted: saveSurvey returned no id", {
        result,
      });
      return;
    }
    
    const targetUrl = `/preview-v2/${result.id}`;
    console.log("[QUESTION-PIPELINE] ====== NAVIGATING TO PREVIEW ======", { 
      targetUrl,
      savedId: result.id,
    });
    setLocation(targetUrl);
  };

  const centerPanel = useMemo(() => {
    if (!modesEnabled) return <BuilderCanvas />;
    if (builderMode === "logic") {
      // Flatten rules from questions and add questionId for MP-style components
      const allRules: BuilderLogicRule[] = questions.flatMap((q) =>
        (q.logicRules || []).map((rule) => ({
          ...rule,
          questionId: q.id,
          conditionLabel: rule.condition,
          actionLabel: rule.action,
        }))
      );
      const handleUpdateRule = (rule: BuilderLogicRule) => {
        // Map back to core LogicRule when updating
        updateLogicRule(rule.id, {
          id: rule.id,
          condition: rule.conditionLabel || rule.condition,
          action: rule.action as 'skip' | 'show' | 'end',
          targetQuestionId: rule.targetQuestionId,
        });
      };
      const handleDeleteRule = (id: string) => {
        deleteLogicRule(id);
        if (selectedLogicRuleId === id) setSelectedLogicRuleId(undefined);
      };
      const handleCreateRule = () => {
        const created = addLogicRule({
          questionId: questions[0]?.id,
          condition: "",
          action: "skip",
          targetQuestionId: null,
        });
        if (created) setSelectedLogicRuleId(created.id);
      };

      return (
        <LogicView
          rules={allRules}
          questions={questions}
          selectedRuleId={selectedLogicRuleId}
          onSelectRule={setSelectedLogicRuleId}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
          onCreateRule={handleCreateRule}
          onClosePanel={() => setBuilderMode("build")}
        />
      );
    }
    if (builderMode === "scoring") {
      // Adapter: ScoringView expects (id, update) but context setQuestionScoring expects (id, fullConfig)
      const handleChangeQuestionScoring = (id: string, update: Partial<QuestionScoringConfig>) => {
        const existing = scoringByQuestionId[id] ?? { scorable: false, scoreWeight: 1 };
        setQuestionScoring(id, { ...existing, ...update });
      };

      // Adapter: ScoringView passes full category, context expects full category
      const handleChangeCategory = (category: ScoringCategory) => {
        updateScoringCategory(category);
      };

      // Adapter: ScoringView passes BuilderScoreBand, context expects CoreScoreBand
      const handleChangeBand = (band: BuilderScoreBand) => {
        updateScoringBand(band);
      };

      return (
        <ScoringView
          questions={questions}
          scoringByQuestionId={scoringByQuestionId}
          categories={categories}
          bands={bands}
          selectedQuestionId={selectedQuestionId}
          selectedCategoryId={selectedCategoryId}
          selectedBandId={selectedBandId}
          onSelectQuestion={setSelectedQuestionId}
          onSelectCategory={setSelectedCategoryId}
          onSelectBand={setSelectedBandId}
          onChangeQuestionScoring={handleChangeQuestionScoring}
          onChangeCategory={handleChangeCategory}
          onChangeBand={handleChangeBand}
          onDeleteBand={deleteScoringBand}
          onClosePanel={() => setBuilderMode("build")}
        />
      );
    }
    return <BuilderCanvas />;
  }, [
    builderMode,
    modesEnabled,
    questions,
    scoringByQuestionId,
    categories,
    bands,
    selectedQuestionId,
    selectedCategoryId,
    selectedBandId,
    selectedLogicRuleId,
    addLogicRule,
    updateLogicRule,
    deleteLogicRule,
    setQuestionScoring,
    updateScoringCategory,
    updateScoringBand,
    deleteScoringBand,
  ]);

  const rightPanel = useMemo(() => {
    if (!modesEnabled) return <QuestionConfigPanel />;
    if (builderMode === 'build') return <QuestionConfigPanel />;
    return null;
  }, [builderMode, modesEnabled]);

  return (
    <div className="absolute inset-0 bg-gray-50 font-sans flex flex-col" data-builder-mode={builderMode}>
      {/* Top Bar: Progress Flow Stepper */}
      <ProgressFlowStepper surveyId={surveyId} />

      {modesEnabled && (
        <div className="border-b border-gray-200 bg-white shrink-0">
          <div className="px-4 py-2">
            <BuilderModeToggle mode={builderMode} onChange={setBuilderMode} />
          </div>
        </div>
      )}

      {/* 3-Panel Layout - Unified structure across all modes */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Mode-specific (QuestionLibrary for Build, embedded in centerPanel for Logic/Scoring) */}
        {builderMode === "build" && <QuestionLibrary />}

        {/* Center Panel - primary content area */}
        <main className="flex-1 min-h-0 overflow-hidden">{centerPanel}</main>

        {/* Right Panel: Mode-specific (QuestionConfigPanel for Build, embedded in centerPanel for Logic/Scoring) */}
        {rightPanel}
      </div>

      {/* Bottom Action Bar */}
      <BuilderActionBar onPreview={handlePreview} />

      {/* Dev-only debug surface */}
      <SurveyDebugPanel />
    </div>
  );
}
