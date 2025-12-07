import React, { useMemo } from 'react';
import { BarChart2, Info, PlusCircle } from 'lucide-react';
import { builderToEvalia, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { scoreSurvey } from '@shared/scoringEngine';
import type { Question as EvaliaQuestion } from '@shared/schema';
import { FEATURES } from '@/config/features';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function buildSyntheticMaxResponses(questions: EvaliaQuestion[]): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  questions.forEach((q) => {
    if (q.scorable !== true) return;

    if (['multiple_choice', 'dropdown', 'yes_no'].includes(q.type)) {
      if (q.optionScores && Object.keys(q.optionScores).length > 0) {
        const best = Object.entries(q.optionScores).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (best !== undefined) responses[q.id] = best;
      }
    } else if (q.type === 'checkbox') {
      if (q.optionScores) {
        const positives = Object.entries(q.optionScores)
          .filter(([, v]) => v > 0)
          .map(([k]) => k);
        responses[q.id] = positives;
      }
    } else if (['rating', 'likert', 'opinion_scale', 'slider'].includes(q.type)) {
      const max =
        q.type === 'likert'
          ? q.likertPoints
          : q.type === 'rating' || q.type === 'opinion_scale'
            ? q.ratingScale
            : q.max;
      if (max !== undefined) responses[q.id] = max;
    }
  });

  return responses;
}

function QuestionRow({
  question,
  index,
  onToggleScorable,
  onCategoryChange,
  onWeightChange,
  onOptionScoreChange,
}: {
  question: EvaliaQuestion;
  index: number;
  onToggleScorable: (val: boolean) => void;
  onCategoryChange: (val: string) => void;
  onWeightChange: (val: number) => void;
  onOptionScoreChange: (opt: string, val: number) => void;
}) {
  const options = question.options || [];
  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Q{index + 1}. {question.question}
          </p>
          <p className="text-xs text-gray-500 uppercase">{question.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`scorable-${question.id}`}
            checked={!!question.scorable}
            onCheckedChange={(checked) => onToggleScorable(!!checked)}
          />
          <Label htmlFor={`scorable-${question.id}`} className="text-xs text-gray-700">
            Scorable
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-700">Category</Label>
          <Input
            value={question.scoringCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="e.g., engagement"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-700">Weight</Label>
          <Input
            type="number"
            value={question.scoreWeight ?? 1}
            onChange={(e) => onWeightChange(Number(e.target.value || 0))}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {options.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-700">Option Scores</Label>
          <div className="space-y-1">
            {options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-28 truncate">{opt}</span>
                <Input
                  type="number"
                  value={question.optionScores?.[opt] ?? 0}
                  onChange={(e) => onOptionScoreChange(opt, Number(e.target.value || 0))}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScoringPanel() {
  const {
    survey,
    questions,
    updateQuestion,
    updateScoringSettings,
    updateScoreConfig,
  } = useSurveyBuilder();

  const evaliaQuestions = useMemo(() => questions.map(builderToEvalia), [questions]);

  const scorableQuestions = evaliaQuestions.filter((q) => q.scorable);

  const syntheticResponses = useMemo(
    () => buildSyntheticMaxResponses(evaliaQuestions),
    [evaliaQuestions]
  );

  const scoringPreview = useMemo(() => {
    return scoreSurvey({
      questions: evaliaQuestions,
      responses: syntheticResponses,
      scoreConfig: survey.scoreConfig,
    });
  }, [evaliaQuestions, syntheticResponses, survey.scoreConfig]);

  if (!FEATURES.scoringV1) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 size={18} className="text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">Scoring Overview</h3>
      </div>

      <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="scoring-enabled"
            checked={survey.scoringSettings.enabled}
            onCheckedChange={(checked) => updateScoringSettings({ enabled: !!checked })}
          />
          <Label htmlFor="scoring-enabled" className="text-sm text-gray-800 font-medium">
            Enable scoring
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-700">Mode</Label>
            <Input value="Points-based" disabled className="h-8 text-sm bg-gray-50" />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Passing Score (optional)</Label>
            <Input
              type="number"
              value={survey.scoreConfig?.passingScore ?? ''}
              onChange={(e) => updateScoreConfig({ passingScore: Number(e.target.value || 0) })}
              className="h-8 text-sm"
              placeholder="e.g. 70"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">Scorable questions</h4>
          <span className="text-xs text-gray-500">{scorableQuestions.length} of {questions.length}</span>
        </div>
        <div className="space-y-3">
          {evaliaQuestions.map((q, idx) => (
            <QuestionRow
              key={q.id}
              question={q}
              index={idx}
              onToggleScorable={(val) => updateQuestion(q.id, { scorable: val })}
              onCategoryChange={(val) => updateQuestion(q.id, { scoringCategory: val || undefined })}
              onWeightChange={(val) => updateQuestion(q.id, { scoreWeight: val })}
              onOptionScoreChange={(opt, val) =>
                updateQuestion(q.id, {
                  optionScores: { ...(q.optionScores || {}), [opt]: val },
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-900">Max score preview</span>
        </div>
        <p className="text-sm text-gray-700">
          Max total score: <span className="font-semibold">{Math.round(scoringPreview.maxScore)}</span>
        </p>
        <p className="text-xs text-gray-500">
          Synthetic responses assume the highest scoring options/values are chosen for each scorable question.
        </p>
        {Object.entries(scoringPreview.byCategory).length > 0 && (
          <div className="space-y-1 pt-2">
            {Object.entries(scoringPreview.byCategory).map(([catId, cat]) => (
              <p key={catId} className="text-sm text-gray-700">
                {cat.label}: max {Math.round(cat.maxScore)}
              </p>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" disabled className="w-full flex items-center justify-center gap-2">
        <PlusCircle size={16} />
        Ask AI to optimize scoring (coming soon)
      </Button>
    </div>
  );
}
