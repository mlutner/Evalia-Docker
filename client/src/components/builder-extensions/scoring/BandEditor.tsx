/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { RightPanelLayout } from '../shared/RightPanelLayout';
import { BandRecommendationItem, BandRecommendation } from './BandRecommendationItem';
import type { BuilderScoreBand } from '../INTEGRATION_GUIDE';
import { Trash2, Plus, Sparkles, Info } from 'lucide-react';

interface BandEditorProps {
  band?: BuilderScoreBand;
  onChange: (band: BuilderScoreBand) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onSuggestRecommendations?: () => void;
  isAILoading?: boolean;
}

export function BandEditor({
  band,
  onChange,
  onDelete,
  onClose,
  onSuggestRecommendations,
  isAILoading = false
}: BandEditorProps) {
  if (!band) {
    return (
      <RightPanelLayout title="Score Band" onClose={onClose}>
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-sm text-gray-500">
            Select a band to edit its details and configuration.
          </div>
        </div>
      </RightPanelLayout>
    );
  }

  const handleAddRecommendation = () => {
    const newRec: BandRecommendation = {
      id: `rec-${Date.now()}`,
      title: '',
      body: ''
    };
    onChange({
      ...band,
      recommendations: [...(band.recommendations || []), newRec as any]
    });
  };

  const handleUpdateRecommendation = (index: number, updated: BandRecommendation) => {
    const recs = [...(band.recommendations || [])];
    recs[index] = updated as any;
    onChange({
      ...band,
      recommendations: recs
    });
  };

  const handleDeleteRecommendation = (index: number) => {
    const recs = [...(band.recommendations || [])];
    recs.splice(index, 1);
    onChange({
      ...band,
      recommendations: recs
    });
  };

  const colorOptions = [
    { value: 'green', label: 'Green (Positive)', class: 'bg-green-500' },
    { value: 'yellow', label: 'Yellow (Caution)', class: 'bg-yellow-400' },
    { value: 'red', label: 'Red (Critical)', class: 'bg-red-500' },
    { value: 'blue', label: 'Blue (Info)', class: 'bg-blue-500' },
    { value: 'purple', label: 'Purple (Special)', class: 'bg-purple-500' },
    { value: 'gray', label: 'Gray (Neutral)', class: 'bg-gray-400' }
  ];

  const bandColor = (band as any).color || 'gray';

  return (
    <RightPanelLayout title="Score Band" badge={band.label} onClose={onClose}>
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Basic Details
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Band Label
            </label>
            <input
              type="text"
              value={band.label}
              onChange={e => onChange({ ...band, label: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="e.g., Excellent, Good, Needs Improvement"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Score Range (0-100)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={band.min}
                onChange={e => onChange({ ...band, min: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Min"
                min={0}
                max={100}
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="number"
                value={band.max}
                onChange={e => onChange({ ...band, max: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Max"
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Display Color
            </label>
            <select
              value={bandColor}
              onChange={e => onChange({ ...band, color: e.target.value } as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            >
              {colorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-4 h-4 rounded ${colorOptions.find(o => o.value === bandColor)?.class}`} />
              <span className="text-xs text-gray-500">Preview</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Icon / Emoji (Optional)
            </label>
            <input
              type="text"
              value={(band as any).icon || ''}
              onChange={e => onChange({ ...band, icon: e.target.value } as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="e.g., ⭐, 🎯, ⚠️, ✅"
              maxLength={2}
            />
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Display & Presentation */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Display & Presentation
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={band.displayOnResults !== false}
                onChange={e => onChange({ ...band, displayOnResults: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Show on results screen</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Display this band to respondents in their results
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Custom Display Label (Optional)
            </label>
            <input
              type="text"
              value={(band as any).customLabel || ''}
              onChange={e => onChange({ ...band, customLabel: e.target.value } as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Alternative label for results display"
            />
            <p className="text-xs text-gray-500">
              Use a different label when showing results to respondents
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Classification & Severity */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Classification
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Severity Level
            </label>
            <select
              value={band.severity || 'medium'}
              onChange={e => onChange({ ...band, severity: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            >
              <option value="low">Low - Minimal concern</option>
              <option value="medium">Medium - Moderate attention</option>
              <option value="high">High - Significant concern</option>
              <option value="critical">Critical - Immediate action</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={band.actionRequired || false}
                onChange={e => onChange({ ...band, actionRequired: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Action required</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Flag this band as requiring immediate follow-up
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Benchmark Comparison
            </label>
            <select
              value={(band as any).benchmarkComparison || 'at'}
              onChange={e => onChange({ ...band, benchmarkComparison: e.target.value } as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            >
              <option value="below">Below industry benchmark</option>
              <option value="at">At industry benchmark</option>
              <option value="above">Above industry benchmark</option>
            </select>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Statistical Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Statistical Parameters
            </h3>
            <div className="group relative">
              <Info size={12} className="text-gray-400" />
              <div className="hidden group-hover:block absolute left-0 top-5 z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                These parameters help ensure statistical reliability and meaningful insights
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Confidence Threshold
            </label>
            <input
              type="number"
              value={band.confidenceThreshold || 30}
              onChange={e => onChange({ ...band, confidenceThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="30"
              min={1}
            />
            <p className="text-xs text-gray-500">
              Minimum responses needed for reliable results (recommended: 30+)
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider">
              Trend Indicator
            </label>
            <select
              value={(band as any).trendIndicator || 'stable'}
              onChange={e => onChange({ ...band, trendIndicator: e.target.value } as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            >
              <option value="improving">📈 Improving over time</option>
              <option value="stable">➡️ Stable / No change</option>
              <option value="declining">📉 Declining over time</option>
            </select>
            <p className="text-xs text-gray-500">
              Historical trend for this score band (if tracking over time)
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Band Summary */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Band Summary
          </label>
          <textarea
            value={band.description || ''}
            onChange={e => onChange({ ...band, description: e.target.value })}
            placeholder="Describe what this score range means and its implications..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500">
            A narrative summary explaining this score band's meaning
          </p>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Recommendations
            </label>
            {onSuggestRecommendations && (
              <button
                onClick={onSuggestRecommendations}
                disabled={isAILoading}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                <Sparkles size={12} className={isAILoading ? 'animate-pulse' : ''} />
                <span>{isAILoading ? 'Suggesting...' : 'AI Suggest'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {band.recommendations && band.recommendations.length > 0 ? (
              band.recommendations.map((rec: any, index: number) => (
                <BandRecommendationItem
                  key={rec.id}
                  recommendation={rec}
                  onChange={updated => handleUpdateRecommendation(index, updated)}
                  onDelete={() => handleDeleteRecommendation(index)}
                />
              ))
            ) : (
              <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400">
                No recommendations yet. Add actions for this score band.
              </div>
            )}
          </div>

          <button
            onClick={handleAddRecommendation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-dashed border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
            Add Recommendation
          </button>
        </div>

        {/* Delete Band */}
        {onDelete && (
          <>
            <div className="h-px bg-gray-200" />
            <button
              onClick={() => onDelete(band.id)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Delete Band
            </button>
          </>
        )}
      </div>
    </RightPanelLayout>
  );
}
