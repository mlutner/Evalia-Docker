/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import type { ScoringCategory } from '../INTEGRATION_GUIDE';

interface CategoriesListProps {
  categories: ScoringCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
  onAddCategory?: () => void;
  onAIGenerateFramework?: () => void;
  isAILoading?: boolean;
}

export function CategoriesList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onAIGenerateFramework,
  isAILoading = false
}: CategoriesListProps) {
  const catLabel = (cat: ScoringCategory) => (cat as any).label ?? (cat as any).name ?? cat.id;
  const catDescription = (cat: ScoringCategory) => (cat as any).description ?? '';
  const catColor = (cat: ScoringCategory) => (cat as any).color;

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'teal':
        return 'bg-teal-500';
      case 'indigo':
        return 'bg-indigo-500';
      case 'amber':
        return 'bg-amber-500';
      case 'green':
        return 'bg-green-500';
      case 'blue':
        return 'bg-blue-500';
      case 'purple':
        return 'bg-purple-500';
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-1/2 border-b border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Categories
        </h4>
        {onAddCategory && (
          <button
            onClick={onAddCategory}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-gray-400 mb-4">
              No categories defined yet.
            </p>
            {onAIGenerateFramework && (
              <button
                onClick={onAIGenerateFramework}
                disabled={isAILoading}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                <Sparkles size={14} className={isAILoading ? 'animate-pulse' : ''} />
                <span>
                  {isAILoading ? 'Generating...' : 'AI Generate Framework'}
                </span>
              </button>
            )}
          </div>
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                ${selectedCategoryId === cat.id 
                  ? 'border-purple-300 bg-purple-50 ring-1 ring-purple-300 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getColorClass(catColor(cat))}`} />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {catLabel(cat)}
                </div>
                {catDescription(cat) && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {catDescription(cat)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
