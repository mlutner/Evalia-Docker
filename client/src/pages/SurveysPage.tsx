import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import SurveyCard from "@/components/SurveyCard";
import { SurveyFilters } from "@/components/SurveyFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { theme } from "@/theme";
import type { SurveyWithCounts } from "@shared/schema";

export default function SurveysPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most-responses" | "alphabetical">("newest");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: surveys = [], isLoading } = useQuery<SurveyWithCounts[]>({
    queryKey: ["/api/surveys"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/surveys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({ title: "Survey deleted", description: "The survey has been removed." });
      setDeleteConfirm(null);
    },
  });

  const [saveTemplateData, setSaveTemplateData] = useState<{ surveyId: string; title: string; description: string; category: string } | null>(null);

  const saveTemplateMutation = useMutation({
    mutationFn: () => saveTemplateData
      ? apiRequest("POST", `/api/surveys/${saveTemplateData.surveyId}/save-as-template`, {
          title: saveTemplateData.title,
          description: saveTemplateData.description,
          category: saveTemplateData.category,
        })
      : Promise.reject("No template data"),
    onSuccess: () => {
      toast({ title: "Template saved", description: "Survey saved as a new template successfully." });
      setSaveTemplateData(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    },
  });

  const allTags = useMemo(
    () => Array.from(new Set(surveys.flatMap(s => s.tags || []))),
    [surveys]
  );

  const filteredSurveys = useMemo(() => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(s => 
        selectedTags.some(tag => s.tags?.includes(tag))
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-responses":
          return (b.responseCount || 0) - (a.responseCount || 0);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [surveys, searchTerm, selectedTags, sortBy]);

  const surveyToDelete = surveys.find(s => s.id === deleteConfirm);

  const handleDelete = (id: string) => setDeleteConfirm(id);
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm);
    }
  };

  return (
    <>
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{surveyToDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this survey and all its responses. You can't undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Keep It</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main style={{ backgroundColor: theme.backgrounds.page }} className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Your Surveys</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {surveys.length === 0 
                ? "Create, manage, and analyze your training surveys"
                : `${surveys.length} ${surveys.length === 1 ? 'survey' : 'surveys'} created • ${surveys.filter(s => s.publishedAt).length} live • ${surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0)} total responses`
              }
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-muted-foreground">Loading your surveys...</div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-center">No surveys yet</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-8 text-center max-w-md px-4">
                Use the "New Survey" button in the sidebar to create your first AI-powered survey. Choose from templates, generate with AI, or upload a document.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <SurveyFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  allTags={allTags}
                  selectedTags={selectedTags}
                  onTagToggle={(tag) => setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                  testIdPrefix="surveys"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredSurveys.length} of {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs px-2 py-1 border rounded-md bg-background"
                      data-testid="select-sort"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="most-responses">Most Responses</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max" style={{ gridAutoRows: 'max-content' }}>
                {filteredSurveys.map((survey, index) => (
                  <div key={survey.id} className="relative">
                    <SurveyCard
                      survey={survey as any}
                      onEdit={() => setLocation(`/builder/${survey.id}`)}
                      onView={() => setLocation(`/survey/${survey.id}`)}
                      onAnalyze={() => setLocation(`/analytics/${survey.id}`)}
                      onExport={() => {
                        toast({ title: "Export", description: "Export feature coming soon" });
                      }}
                      onDelete={() => handleDelete(survey.id)}
                      onDuplicate={() => {
                        toast({ title: "Duplicate", description: "Duplicate feature coming soon" });
                      }}
                      onManageRespondents={() => setLocation(`/respondents/${survey.id}`)}
                      onSaveAsTemplate={() => {
                        setSaveTemplateData({
                          surveyId: survey.id,
                          title: survey.title,
                          description: survey.description || "",
                          category: "General",
                        });
                        saveTemplateMutation.mutate();
                      }}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
