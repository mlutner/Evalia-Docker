import { Input } from "@/components/ui/input";

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search surveys by title, description, trainer..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
          data-testid={`input-search-${testIdPrefix}`}
        />
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              data-testid={`button-filter-tag-${testIdPrefix}-${tag}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
