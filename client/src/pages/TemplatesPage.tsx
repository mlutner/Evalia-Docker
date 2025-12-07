import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, Clock, Users, FileText, Grid3X3, List, Star, 
  Building2, GraduationCap, Heart, ChevronRight, Search,
  ArrowLeft, Sparkles, UserPlus, MessageSquare, LogOut, Activity, Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import type { Template } from "@shared/schema";

// Extended Template type uses the Template type directly since schema now includes is_featured and tags
type ExtendedTemplate = Template;

type ViewMode = "grid" | "list";

// Tag-based helpers for category filters
const CATEGORY_TAGS: Record<string, string[]> = {
  "Employee Engagement": ["employee-engagement", "wellbeing", "psychological-safety"],
  "Pulse": ["pulse", "quick-5min"],
  "Feedback": ["feedback", "self-assessment", "training-evaluation", "manager-effectiveness", "leadership", "coaching"],
  "Onboarding": ["onboarding"],
  "Exit": ["exit", "attrition", "retention"],
};

// ============================================
// CATEGORY CONFIGURATION
// ============================================

// Category filter definitions
const CATEGORY_FILTERS = [
  { id: "all", label: "All Templates", icon: null },
  { id: "Onboarding", label: "Onboarding", icon: UserPlus },
  { id: "Employee Engagement", label: "Engagement", icon: Users },
  { id: "Feedback", label: "Feedback", icon: MessageSquare },
  { id: "Pulse", label: "Pulse", icon: Activity },
  { id: "Exit", label: "Exit", icon: LogOut },
];

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "Employee Engagement": <Users className="w-4 h-4" />,
    "Training & Development": <GraduationCap className="w-4 h-4" />,
    "Healthcare": <Heart className="w-4 h-4" />,
    "Assessment": <FileText className="w-4 h-4" />,
    "Satisfaction": <Star className="w-4 h-4" />,
    "Onboarding": <UserPlus className="w-4 h-4" />,
    "Feedback": <MessageSquare className="w-4 h-4" />,
    "Pulse": <Activity className="w-4 h-4" />,
    "Exit": <LogOut className="w-4 h-4" />,
  };
  return iconMap[category] || <Building2 className="w-4 h-4" />;
};

// Category color mapping
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    "Employee Engagement": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "Training & Development": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    "Healthcare": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    "Assessment": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "Satisfaction": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    "Onboarding": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    "Feedback": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    "Pulse": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    "Exit": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };
  return colorMap[category] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
};

// ============================================
// FEATURED TEMPLATE CARD COMPONENT
// ============================================

interface FeaturedTemplateCardProps {
  template: ExtendedTemplate;
  onPreview: () => void;
  onUse: () => void;
  getCategoryColor: (category: string) => { bg: string; text: string; border: string };
  getCategoryIcon: (category: string) => React.ReactNode;
}

function FeaturedTemplateCard({ template, onPreview, onUse, getCategoryColor, getCategoryIcon }: FeaturedTemplateCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 hover:shadow-lg hover:border-amber-300 transition-all duration-200">
      {/* Featured Badge */}
      <div className="absolute -top-2 -right-2">
        <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-white" />
          Featured
        </div>
      </div>
      
      {/* Category */}
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category || 'Other').bg} ${getCategoryColor(template.category || 'Other').text} mb-2`}>
        {getCategoryIcon(template.category || 'Other')}
        <span>{template.category}</span>
      </div>
      {template.scoreConfig?.enabled && (
        <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100">
          <span>Scored</span>
        </div>
      )}
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
        {template.title}
      </h3>
      
      {/* Meta */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <FileText className="w-3 h-3" />
        <span>{template.questions.length} questions</span>
        <span>•</span>
        <Clock className="w-3 h-3" />
        <span>~{Math.ceil(template.questions.length * 0.5)} min</span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onPreview}
          className="flex-1 h-8 text-xs"
        >
          Preview
        </Button>
        <Button 
          size="sm" 
          onClick={onUse}
          className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
        >
          Use
        </Button>
      </div>
    </div>
  );
}

// ============================================
// PULSE TEMPLATE CARD COMPONENT
// ============================================

interface PulseTemplateCardProps {
  template: ExtendedTemplate;
  onPreview: () => void;
  onUse: () => void;
}

function PulseTemplateCard({ template, onPreview, onUse }: PulseTemplateCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium text-indigo-600">Pulse</span>
            <span> • {template.questions.length}Q</span>
          </div>
        </div>
        {template.is_featured && (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        )}
        {template.scoreConfig?.enabled && (
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
            Scored
          </span>
        )}
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
        {template.title}
      </h3>
      
      {/* Description */}
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
        {template.description}
      </p>
      
      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onPreview}
          className="flex-1 h-8 text-xs"
        >
          Preview
        </Button>
        <Button 
          size="sm" 
          onClick={onUse}
          className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Use
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates = [], isLoading } = useQuery<ExtendedTemplate[]>({
    queryKey: ["/api/templates"],
    staleTime: 5 * 60 * 1000,
  });

  // Featured templates (for HR & L&D professionals)
  const featuredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.is_featured || 
      t.tags?.includes('pulse') || 
      t.tags?.includes('employee-engagement') ||
      t.category === 'Pulse'
    ).slice(0, 4);
  }, [templates]);

  // Pulse survey templates
  const pulseTemplates = useMemo(() => {
    return templates.filter(t => 
      t.category === 'Pulse' || 
      t.tags?.includes('pulse') ||
      t.title.toLowerCase().includes('pulse')
    );
  }, [templates]);

  const handleUseTemplate = (template: ExtendedTemplate) => {
    const surveyData = {
      title: `${template.title} - Copy`,
      description: template.description,
      questions: template.questions,
      scoreConfig: template.scoreConfig,
    };
    sessionStorage.setItem("templateSurvey", JSON.stringify(surveyData));
    setLocation("/builder-v2/new");
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Count templates per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_FILTERS.forEach((filter) => {
      const id = filter.id;
      counts[id] = templates.filter((t) => {
        if (id === "all") return true;
        const tags = CATEGORY_TAGS[id] || [];
        return t.category === id || tags.some((tag) => t.tags?.includes(tag));
      }).length;
    });
    return counts;
  }, [templates]);

  // Filter templates by search and category
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Apply category filter
    if (selectedCategory !== "all") {
      const tags = CATEGORY_TAGS[selectedCategory] || [];
      filtered = filtered.filter(
        (t) =>
          t.category === selectedCategory ||
          tags.some((tag) => t.tags?.includes(tag))
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  // Group templates by category (for list view)
  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      const category = template.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, Template[]>);
  }, [filteredTemplates]);

  return (
    <main style={{ backgroundColor: '#F7F9FC' }} className="min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back to Dashboard */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
          </div>
          <p className="text-gray-500">
            Start with expert-designed survey templates for common HR scenarios.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="search-templates"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {CATEGORY_FILTERS.map((filter) => {
            const count = categoryCounts[filter.id] || 0;
            const isActive = selectedCategory === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedCategory(filter.id)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 border
                  ${isActive 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                data-testid={`filter-${filter.id}`}
              >
                {filter.icon && <filter.icon className="w-4 h-4" />}
                <span>{filter.label}</span>
                <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured Templates Section - Only show on "All Templates" with no search */}
        {selectedCategory === 'all' && !searchQuery && featuredTemplates.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Featured for HR & Learning</h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                Popular
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTemplates.map((template) => (
                <FeaturedTemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => setPreviewTemplate(template)}
                  onUse={() => handleUseTemplate(template)}
                  getCategoryColor={getCategoryColor}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pulse Surveys Section - Only show on "All Templates" or "Pulse" filter with no search */}
        {(selectedCategory === 'all' || selectedCategory === 'Pulse') && !searchQuery && pulseTemplates.length > 0 && selectedCategory !== 'Pulse' && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-gray-900">Pulse Surveys</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                Quick Check-ins
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Short, frequent surveys to track engagement, morale, and team health over time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pulseTemplates.slice(0, 6).map((template) => (
                <PulseTemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => setPreviewTemplate(template)}
                  onUse={() => handleUseTemplate(template)}
                />
              ))}
            </div>
            {pulseTemplates.length > 6 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory('Pulse')}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  View All {pulseTemplates.length} Pulse Surveys
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View Toggle & Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} 
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-muted-foreground">Loading templates...</div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No templates match "${searchQuery}"` 
                : `No templates in ${selectedCategory} category`}
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            >
              Clear filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="card-professional group hover:shadow-lg transition-all duration-200"
                data-testid={`template-card-${template.id}`}
                style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF', borderColor: 'var(--color-border)' }}
              >
                {/* Header: Category Badge + Question Count */}
                <div className="px-6 pt-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category).bg} ${getCategoryColor(template.category).text} ${getCategoryColor(template.category).border} border`}>
                      {getCategoryIcon(template.category)}
                      <span>{template.category}</span>
                    </div>
                    <div className="badge-teal flex-shrink-0 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{template.questions.length}Q</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="px-6 py-2">
                  <h3 className="heading-4 line-clamp-2 group-hover:text-[#2F8FA5] transition-colors">
                    {template.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="px-6 py-2 flex-1">
                  <p className="body-small line-clamp-3 text-gray-600">{template.description}</p>
                </div>

                {/* Estimated Time */}
                <div className="px-6 py-3 flex items-center gap-2 border-t border-gray-100 mt-auto">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    ~{Math.ceil(template.questions.length * 0.5)} min to complete
                  </span>
                  {(template.scoreConfig?.scoreRanges?.length || template.scoreConfig?.resultsScreen?.scoreRanges?.length) && (
                    <span className="ml-auto text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Bands {template.scoreConfig?.resultsScreen?.scoreRanges?.length ?? template.scoreConfig?.scoreRanges?.length}
                    </span>
                  )}
                  {template.scoreConfig?.enabled && (
                    <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Scored
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="px-6 py-5 gap-3 flex flex-col">
                  <div className="flex w-full gap-3">
                    <Button
                      onClick={() => setPreviewTemplate(template)}
                      variant="outline"
                      className="flex-1 h-10 font-semibold text-sm"
                      data-testid={`button-preview-template-${template.id}`}
                    >
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 h-10 font-semibold text-sm"
                      style={{ 
                        backgroundColor: '#1F6F78',
                        color: '#FFFFFF',
                      }}
                      data-testid={`button-use-template-${template.id}`}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // List View - Grouped by Category
          <div className="space-y-8">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category).bg}`}>
                    <span className={getCategoryColor(category).text}>
                      {getCategoryIcon(category)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{category}</h2>
                  <span className="text-sm text-gray-500">({categoryTemplates.length})</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {categoryTemplates.map((template, idx) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        idx !== categoryTemplates.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                      data-testid={`template-row-${template.id}`}
                    >
                      {/* Question Count Badge */}
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{template.questions.length}</div>
                          <div className="text-[10px] text-gray-500 -mt-1">Qs</div>
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{template.title}</h3>
                          {template.scoreConfig?.enabled && (
                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex-shrink-0">
                              Scored
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{template.description}</p>
                      </div>

                      {/* Meta Info */}
                      <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>~{Math.ceil(template.questions.length * 0.5)} min</span>
                        </div>
                        {(template.scoreConfig?.scoreRanges?.length || template.scoreConfig?.resultsScreen?.scoreRanges?.length) && (
                          <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            Bands {template.scoreConfig?.resultsScreen?.scoreRanges?.length ?? template.scoreConfig?.scoreRanges?.length}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setPreviewTemplate(template)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Preview
                        </Button>
                        <Button
                          onClick={() => handleUseTemplate(template)}
                          size="sm"
                          style={{ 
                            backgroundColor: '#1F6F78',
                            color: '#FFFFFF',
                          }}
                        >
                          Use
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(previewTemplate.category).bg} ${getCategoryColor(previewTemplate.category).text}`}>
                    {getCategoryIcon(previewTemplate.category)}
                    <span>{previewTemplate.category}</span>
                  </div>
                  {previewTemplate.scoreConfig?.enabled && (
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Scored Assessment
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl">{previewTemplate.title}</DialogTitle>
                <DialogDescription className="mt-2">{previewTemplate.description}</DialogDescription>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{previewTemplate.questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>~{Math.ceil(previewTemplate.questions.length * 0.5)} min</span>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {previewTemplate.questions.map((question, idx) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full capitalize">
                            {question.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {question.options && question.options.length > 0 && (
                          <ul className="text-sm space-y-1 mt-3 text-gray-600">
                            {question.options.slice(0, 5).map((opt, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                {opt}
                              </li>
                            ))}
                            {question.options.length > 5 && (
                              <li className="text-gray-400 italic">
                                ... and {question.options.length - 5} more options
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  style={{ 
                    backgroundColor: '#1F6F78',
                    color: '#FFFFFF',
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
