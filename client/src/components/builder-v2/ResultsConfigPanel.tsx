import React, { useMemo } from 'react';
import { useSurveyBuilder, builderToEvalia } from '@/contexts/SurveyBuilderContext';
import { FEATURES } from '@/config/features';
import { scoreSurvey } from '@shared/scoringEngine';
import type { Question as EvaliaQuestion, ResultsScreenConfig, ScoreBandConfig } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const DEFAULT_RESULTS: ResultsScreenConfig = {
  enabled: false,
  layout: 'simple',
  showTotalScore: true,
  showPercentage: true,
  showOverallBand: true,
  showCategoryBreakdown: true,
  showCategoryBands: true,
  showStrengthsAndRisks: true,
  showCallToAction: false,
  title: 'Your results',
  subtitle: 'See how you did',
  scoreRanges: [],
  categories: [],
};

function ensureBands(config?: ResultsScreenConfig): ScoreBandConfig[] {
  return config?.scoreRanges && config.scoreRanges.length > 0
    ? config.scoreRanges
    : [
        { id: 'low', min: 0, max: 40, label: 'Low', color: '#f87171', summary: 'Needs improvement', tone: 'risk' },
        { id: 'mid', min: 40, max: 70, label: 'Medium', color: '#fbbf24', summary: 'On track', tone: 'neutral' },
        { id: 'high', min: 70, max: 100, label: 'High', color: '#34d399', summary: 'Great performance', tone: 'strength' },
      ];
}

function findBand(score: number, bands: ScoreBandConfig[]): ScoreBandConfig | undefined {
  return bands.find((b) => score >= b.min && score <= b.max);
}

export function ResultsConfigPanel() {
  const { survey, updateScoreConfig } = useSurveyBuilder();
  const results = survey.scoreConfig?.resultsScreen ?? DEFAULT_RESULTS;
  const evaliaQuestions = useMemo(() => survey.questions.map(builderToEvalia), [survey.questions]);

  const preview = useMemo(() => {
    const bands = ensureBands(results);
    const responses = buildSyntheticMaxResponses(evaliaQuestions);
    const scored = scoreSurvey({ questions: evaliaQuestions, responses, scoreConfig: survey.scoreConfig });
    const pct = scored.maxScore ? (scored.totalScore / scored.maxScore) * 100 : 0;
    const band = bands.find((b) => pct >= b.min && pct <= b.max);
    return { scored, bands, band };
  }, [evaliaQuestions, results, survey.scoreConfig]);

  const handleResultsChange = (updates: Partial<ResultsScreenConfig>) => {
    updateScoreConfig({ resultsScreen: { ...DEFAULT_RESULTS, ...results, ...updates } });
  };

  const handleBandChange = (idx: number, key: keyof ScoreBandConfig, value: string | number | string[]) => {
    const bands = [...ensureBands(results)];
    const numKeys: Array<keyof ScoreBandConfig> = ['min', 'max'];
    if (numKeys.includes(key)) {
      (bands[idx] as any)[key] = Number(value);
    } else {
      (bands[idx] as any)[key] = value;
    }
    handleResultsChange({ scoreRanges: bands });
  };

  const handleAddBand = () => {
    const bands = [...ensureBands(results)];
    bands.push({ id: `band-${bands.length + 1}`, min: 0, max: 100, label: 'New band' });
    handleResultsChange({ scoreRanges: bands });
  };

  const handleRemoveBand = (idx: number) => {
    const bands = [...ensureBands(results)];
    bands.splice(idx, 1);
    handleResultsChange({ scoreRanges: bands });
  };

  if (!FEATURES.resultsV1) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Results Screen</h3>
          <p className="text-sm text-gray-500">Configure what respondents see after submitting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="results-enabled"
            checked={!!results.enabled}
            onCheckedChange={(checked) => handleResultsChange({ enabled: !!checked })}
          />
          <Label htmlFor="results-enabled" className="text-sm text-gray-700">Enable</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Layout</Label>
        <Select value={results.layout} onValueChange={(val) => handleResultsChange({ layout: val as ResultsScreenConfig['layout'] })}>
          <SelectTrigger><SelectValue placeholder="Select layout" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple</SelectItem>
            <SelectItem value="bands">Bands</SelectItem>
            <SelectItem value="dashboard">Dashboard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ToggleRow label="Show total" checked={results.showTotalScore} onChange={(v) => handleResultsChange({ showTotalScore: v })} />
        <ToggleRow label="Show %" checked={results.showPercentage} onChange={(v) => handleResultsChange({ showPercentage: v })} />
        <ToggleRow label="Overall band" checked={results.showOverallBand} onChange={(v) => handleResultsChange({ showOverallBand: v })} />
        <ToggleRow label="Category breakdown" checked={results.showCategoryBreakdown} onChange={(v) => handleResultsChange({ showCategoryBreakdown: v })} />
        <ToggleRow label="Category bands" checked={results.showCategoryBands} onChange={(v) => handleResultsChange({ showCategoryBands: v })} />
        <ToggleRow label="Strengths & risks" checked={results.showStrengthsAndRisks} onChange={(v) => handleResultsChange({ showStrengthsAndRisks: v })} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Title</Label>
        <Input value={results.title || ''} onChange={(e) => handleResultsChange({ title: e.target.value })} placeholder="Results title" />
        <Input value={results.subtitle || ''} onChange={(e) => handleResultsChange({ subtitle: e.target.value })} placeholder="Subtitle" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-gray-700">Score bands</Label>
          <Button variant="ghost" size="sm" onClick={handleAddBand}>
            Add band
          </Button>
        </div>
        <div className="space-y-2">
          {ensureBands(results).map((band, idx) => (
            <div key={band.id} className="space-y-2 border p-2 rounded">
              <div className="grid grid-cols-6 gap-2 items-center">
                <Input value={band.label} onChange={(e) => handleBandChange(idx, 'label', e.target.value)} placeholder="Label" className="col-span-2" />
                <Input type="number" value={band.min} onChange={(e) => handleBandChange(idx, 'min', Number(e.target.value))} placeholder="Min" />
                <Input type="number" value={band.max} onChange={(e) => handleBandChange(idx, 'max', Number(e.target.value))} placeholder="Max" />
                <Input value={band.color || ''} onChange={(e) => handleBandChange(idx, 'color', e.target.value)} placeholder="#color" />
                <Select value={band.tone || undefined} onValueChange={(val) => handleBandChange(idx, 'tone', val as any)}>
                  <SelectTrigger><SelectValue placeholder="Tone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveBand(idx)}>Remove</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={band.headline || ''} onChange={(e) => handleBandChange(idx, 'headline', e.target.value)} placeholder="Headline" />
                <Input value={band.summary || ''} onChange={(e) => handleBandChange(idx, 'summary', e.target.value)} placeholder="Summary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <textarea
                  className="border rounded px-2 py-1 text-sm"
                  rows={2}
                  placeholder="Manager tips (one per line)"
                  value={(band.managerTips || []).join('\n')}
                  onChange={(e) =>
                    handleBandChange(
                      idx,
                      'managerTips',
                      e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
                <textarea
                  className="border rounded px-2 py-1 text-sm"
                  rows={2}
                  placeholder="Org actions (one per line)"
                  value={(band.orgActions || []).join('\n')}
                  onChange={(e) =>
                    handleBandChange(
                      idx,
                      'orgActions',
                      e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">CTA (optional)</Label>
        <Input value={results.ctaLabel || ''} onChange={(e) => handleResultsChange({ ctaLabel: e.target.value })} placeholder="CTA label" />
        <Input value={results.ctaUrl || ''} onChange={(e) => handleResultsChange({ ctaUrl: e.target.value })} placeholder="CTA URL" />
      </div>

      <Button variant="outline" className="w-full" disabled>
        Ask AI to suggest bands and descriptions (coming soon)
      </Button>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Preview</p>
            <p className="text-xs text-gray-500">Based on max-score responses</p>
          </div>
          <div className="text-sm font-semibold" style={{ color: preview.band?.color || '#111827' }}>
            {preview.band ? preview.band.label : 'No band'}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          Max score: {preview.scored.maxScore.toFixed(1)}
        </div>
        {preview.scored.maxScore > 0 && (
          <div className="space-y-2">
            {Object.entries(preview.scored.byCategory).map(([categoryId, data]) => {
              const pct = data.maxScore ? Math.round((data.maxScore / preview.scored.maxScore) * 100) : 0;
              return (
                <div key={categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{categoryId}</span>
                    <span>{data.maxScore.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <Checkbox checked={checked} onCheckedChange={(val) => onChange(!!val)} />
      {label}
    </label>
  );
}
