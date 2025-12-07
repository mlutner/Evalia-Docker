/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import type { BuilderScoreBand } from '../INTEGRATION_GUIDE';
import { AlertTriangle, GripVertical, Plus, MessageSquare } from 'lucide-react';

interface BandsTableProps {
  bands: BuilderScoreBand[];
  selectedCategoryId?: string;
  selectedBandId?: string;
  onSelectBand?: (id: string) => void;
  onUpdateBand?: (band: BuilderScoreBand) => void;
  onDeleteBand?: (id: string) => void;
  onAddBand?: () => void;
  onReorderBands?: (bandIds: string[]) => void;
}

export function BandsTable({
  bands,
  selectedCategoryId,
  selectedBandId,
  onSelectBand,
  onUpdateBand,
  onDeleteBand,
  onAddBand,
  onReorderBands
}: BandsTableProps) {
  // Filter bands by category if categoryId specified
  const filteredBands = selectedCategoryId
    ? bands.filter(b => (b as any).categoryId === selectedCategoryId)
    : bands;
  const sortedBands = [...filteredBands].sort((a, b) => a.min - b.min);

  // Validation logic
  const validateBand = (band: BuilderScoreBand) => {
    const errors: string[] = [];
    if (band.min > band.max) {
      errors.push('Min cannot be greater than Max');
    }
    if (band.min < 0 || band.max > 100) {
      errors.push('Values must be between 0-100');
    }
    // Check for overlaps with other bands
    const overlaps = sortedBands.filter(b => {
      if (b.id === band.id) return false;
      return (
        (band.min >= b.min && band.min <= b.max) ||
        (band.max >= b.min && band.max <= b.max) ||
        (band.min <= b.min && band.max >= b.max)
      );
    });
    if (overlaps.length > 0) {
      errors.push(`Overlaps with: ${overlaps.map(b => b.label).join(', ')}`);
    }
    return errors;
  };

  // Check coverage
  const checkCoverage = () => {
    if (sortedBands.length === 0) return null;
    const ranges = sortedBands
      .map(b => ({ min: b.min, max: b.max }))
      .sort((a, b) => a.min - b.min);
    const gaps: string[] = [];
    if (ranges[0].min > 0) {
      gaps.push(`0-${ranges[0].min - 1}`);
    }
    for (let i = 0; i < ranges.length - 1; i++) {
      if (ranges[i].max + 1 < ranges[i + 1].min) {
        gaps.push(`${ranges[i].max + 1}-${ranges[i + 1].min - 1}`);
      }
    }
    if (ranges[ranges.length - 1].max < 100) {
      gaps.push(`${ranges[ranges.length - 1].max + 1}-100`);
    }
    return gaps.length > 0 ? gaps : null;
  };

  const gaps = checkCoverage();

  const getBandColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-400';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (!selectedCategoryId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 text-sm">
        Select a category to view and configure bands
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Score Bands
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Define score ranges and interpretations
          </p>
        </div>
        {onAddBand && (
          <button
            onClick={onAddBand}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
          >
            <Plus size={12} />
            Add Band
          </button>
        )}
      </div>

      {/* Distribution Bar */}
      <div className="px-4 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-100 border border-gray-200">
          {sortedBands.map(band => {
            const width = Math.max(0, Math.min(100, band.max - band.min + 1));
            return (
              <div
                key={band.id}
                style={{ width: `${width}%` }}
                className={`${getBandColor((band as any).color)} border-r border-white last:border-0`}
                title={`${band.label}: ${band.min}-${band.max}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono px-0.5">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>

        {gaps && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-start gap-2">
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Coverage gaps detected:</span>{' '}
              {gaps.join(', ')}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
            <tr>
              <th className="w-8 p-3"></th>
              <th className="w-4 p-3"></th>
              <th className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Label
              </th>
              <th className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wide w-24">
                Min
              </th>
              <th className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wide w-24">
                Max
              </th>
              <th className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wide w-32 text-center">
                Recommendations
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedBands.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                  No bands defined yet. Click "Add Band" to create one.
                </td>
              </tr>
            ) : (
              sortedBands.map(band => {
                const errors = validateBand(band);
                const hasErrors = errors.length > 0;
                const isSelected = band.id === selectedBandId;
                const recCount = band.recommendations?.length || 0;

                return (
                  <tr
                    key={band.id}
                    onClick={() => onSelectBand?.(band.id)}
                    className={`group cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-3">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                        <GripVertical size={14} />
                      </button>
                    </td>
                    <td className="p-3 align-middle">
                      <div className={`w-1.5 h-1.5 rounded-full ${getBandColor((band as any).color)}`} />
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-gray-900">
                        {band.label}
                      </div>
                      {band.description && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                          {band.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-sm font-mono ${hasErrors ? 'text-red-600' : 'text-gray-700'}`}>
                        {band.min}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-sm font-mono ${hasErrors ? 'text-red-600' : 'text-gray-700'}`}>
                        {band.max}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {recCount > 0 ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600">
                          <MessageSquare size={10} />
                          <span>{recCount}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Validation Summary */}
      {sortedBands.some(b => validateBand(b).length > 0) && (
        <div className="p-4 border-t border-gray-200 bg-red-50">
          <div className="flex items-start gap-2 text-xs text-red-700">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Band validation errors:</p>
              <ul className="space-y-1 list-disc list-inside">
                {sortedBands.map(band => {
                  const errors = validateBand(band);
                  if (errors.length === 0) return null;
                  return (
                    <li key={band.id}>
                      <span className="font-medium">{band.label}:</span>{' '}
                      {errors.join(', ')}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
