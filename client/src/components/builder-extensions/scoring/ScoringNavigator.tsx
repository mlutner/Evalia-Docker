/**
 * @design-locked Magic Patterns golden spec
 * ScoringNavigator - Left panel for Scoring mode
 * Matches LogicRuleList structure and styling
 */
import React from 'react';
import { Plus, Layers, BarChart3 } from 'lucide-react';
import type { ScoringCategory, BuilderScoreBand } from '../INTEGRATION_GUIDE';

interface ScoringNavigatorProps {
  categories: ScoringCategory[];
  bands: BuilderScoreBand[];
  selectedCategoryId?: string;
  selectedBandId?: string;
  viewMode: 'categories' | 'bands';
  onSelectCategory: (id: string) => void;
  onSelectBand: (id: string) => void;
  onViewModeChange: (mode: 'categories' | 'bands') => void;
  onAddCategory?: () => void;
  onAddBand?: () => void;
}

export function ScoringNavigator({
  categories,
  bands,
  selectedCategoryId,
  selectedBandId,
  onSelectCategory,
  onSelectBand,
  onAddCategory,
  onAddBand,
}: ScoringNavigatorProps) {
  return (
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-[13px] font-medium text-gray-700">Setup</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Categories Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Categories
            </h3>
            <span className="text-xs text-gray-400">{categories.length}</span>
          </div>

        {/* Add Category Button */}
        {onAddCategory && (
          <button
            onClick={onAddCategory}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3"
          >
            <Plus size={16} className="text-gray-500" />
            Add Category
          </button>
        )}

        {/* Categories List */}
        <div className="space-y-1.5">
          {/* "All Questions" option */}
          <button
            onClick={() => onSelectCategory('')}
            className={`
              w-full p-2.5 rounded-lg border text-left transition-all duration-150
              ${!selectedCategoryId
                ? 'border-purple-300 bg-purple-50/80 shadow-sm'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-2.5">
              <div className={`
                w-7 h-7 rounded-md flex items-center justify-center transition-colors
                ${!selectedCategoryId ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'}
              `}>
                <Layers size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800">All Questions</p>
              </div>
            </div>
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`
                  w-full p-2.5 rounded-lg border text-left transition-all duration-150
                  ${isSelected
                    ? 'border-purple-300 bg-purple-50/80 shadow-sm'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`
                    w-7 h-7 rounded-md flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'}
                  `}>
                    <Layers size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800 truncate">
                      {category.name || category.id}
                    </p>
                    {category.description && (
                      <p className="text-[11px] text-gray-400 truncate">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-2" />

      {/* Bands Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Score Bands
          </h3>
          <span className="text-xs text-gray-500">{bands.length}</span>
        </div>

        {/* Add Band Button */}
        {onAddBand && (
          <button
            onClick={onAddBand}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3"
          >
            <Plus size={16} className="text-gray-500" />
            Add Band
          </button>
        )}

        {/* Bands List */}
        <div className="space-y-1.5">
          {bands.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <BarChart3 size={16} className="text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-400">No bands defined</p>
            </div>
          ) : (
            bands.map((band) => {
              const isSelected = selectedBandId === band.id;
              return (
                <button
                  key={band.id}
                  onClick={() => onSelectBand(band.id)}
                  className={`
                    w-full p-2.5 rounded-lg border text-left transition-all duration-150
                    ${isSelected
                      ? 'border-purple-300 bg-purple-50/80 shadow-sm'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Color indicator */}
                    <div
                      className="w-1.5 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: band.color || '#6b7280' }}
                    />
                    <div className={`
                      w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors
                      ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'}
                    `}>
                      <BarChart3 size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium text-gray-800 truncate">
                          {band.label || band.id}
                        </p>
                        <span className="text-[11px] text-gray-400 shrink-0 font-mono">
                          {band.min}–{band.max}
                        </span>
                      </div>
                      {band.shortDescription && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {band.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        </div>
      </div>
    </aside>
  );
}
