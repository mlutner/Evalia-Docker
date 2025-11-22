import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SurveyFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  testIdPrefix?: string;
}

export function SurveyFilters({
  searchTerm,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  testIdPrefix = "surveys",
}: SurveyFiltersProps) {
  const hasActiveFilters = searchTerm || selectedTags.length > 0;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-card border border-border dark:border-slate-700">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
            data-testid={`input-search-${testIdPrefix}`}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid={`button-clear-search-${testIdPrefix}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Categories</div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                data-testid={`button-filter-tag-${testIdPrefix}-${tag}`}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="w-3 h-3 ml-1 inline" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-border dark:border-slate-700">
          <div className="text-xs text-muted-foreground">
            {searchTerm && <span>Search: "{searchTerm}"</span>}
            {selectedTags.length > 0 && (
              <span className="ml-2">{selectedTags.length} filter{selectedTags.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <button
            onClick={() => {
              onSearchChange("");
              selectedTags.forEach(tag => onTagToggle(tag));
            }}
            className="text-xs text-primary hover:underline"
            data-testid={`button-clear-all-filters-${testIdPrefix}`}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
