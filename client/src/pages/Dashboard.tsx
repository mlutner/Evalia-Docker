import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import SurveyCard from "@/components/SurveyCard";
import { SurveyFilters } from "@/components/SurveyFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, FileText, BarChart3, Calendar, Clock, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SurveyWithCounts } from "@shared/schema";
import type { ReactNode } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "recent">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: surveys = [], isLoading } = useQuery<SurveyWithCounts[]>({
    queryKey: ["/api/surveys"],
  });

  // Get all available tags across surveys (memoized)
  const allTags = useMemo(
    () => Array.from(new Set(surveys.flatMap(s => s.tags || []))),
    [surveys]
  );

  // Filter surveys based on search and tags (memoized)
  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      const matchesSearch = searchTerm === "" || 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.trainerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => survey.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [surveys, searchTerm, selectedTags]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/surveys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({
        title: "Survey deleted",
        description: "The survey has been permanently removed.",
      });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete survey",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: string) => {
    setLocation(`/builder/${id}`);
  };

  const handleView = (id: string) => {
    setLocation(`/survey/${id}`);
  };

  const handleAnalyze = (id: string) => {
    setLocation(`/analytics/${id}`);
  };

  const handleExport = (id: string) => {
    console.log("Export survey:", id);
  };

  const isExpired = (survey: Survey) => false; // Placeholder - expiresAt not in schema

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm);
    }
  };

  // Sort surveys by creation date for "Recent" tab (memoized)
  const recentSurveys = useMemo(
    () => [...filteredSurveys].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 6),
    [filteredSurveys]
  );

  const surveyToDelete = surveys.find(s => s.id === deleteConfirm);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <Header />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{surveyToDelete?.title}"? This action cannot be undone. All responses will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Your Surveys</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {surveys.length === 0 
                ? "Create, manage, and analyze your training surveys"
                : `${surveys.length} ${surveys.length === 1 ? 'survey' : 'surveys'} created`
              }
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setLocation("/builder")} 
            data-testid="button-new-survey"
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Survey
          </Button>
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
              Create your first AI-powered survey in minutes. Choose from templates, generate with AI, or upload a document.
            </p>
            <Button 
              size="lg" 
              onClick={() => setLocation("/builder")} 
              data-testid="button-create-first"
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Survey
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "recent")} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="all" data-testid="tab-all-surveys">
                <BarChart3 className="w-4 h-4 mr-2" />
                All Surveys
              </TabsTrigger>
              <TabsTrigger value="recent" data-testid="tab-recent-surveys">
                <Calendar className="w-4 h-4 mr-2" />
                Recent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredSurveys.length} of {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurveys.map((survey, index) => (
                  <div key={survey.id} className="relative">
                    {isExpired(survey) && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge variant="destructive" data-testid={`badge-expired-${survey.id}`}>Expired</Badge>
                      </div>
                    )}
                    <SurveyCard
                      survey={{
                        id: survey.id,
                        title: survey.title,
                        description: survey.description || undefined,
                        createdAt: survey.createdAt.toString(),
                        questionCount: survey.questions.length,
                        status: survey.status || undefined,
                        publishedAt: survey.publishedAt?.toString(),
                        trainerName: survey.trainerName || undefined,
                        trainingDate: survey.trainingDate?.toString(),
                        tags: survey.tags || undefined,
                        questions: survey.questions,
                        scoreConfig: survey.scoreConfig,
                      }}
                      onEdit={() => handleEdit(survey.id)}
                      onView={() => handleView(survey.id)}
                      onAnalyze={() => handleAnalyze(survey.id)}
                      onExport={() => handleExport(survey.id)}
                      onDelete={() => handleDelete(survey.id)}
                      onManageRespondents={() => setLocation(`/respondents/${survey.id}`)}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
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
                testIdPrefix="surveys-recent"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Your {recentSurveys.length} most recent {recentSurveys.length === 1 ? 'survey' : 'surveys'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentSurveys.map((survey, index) => (
                  <div key={survey.id} className="relative">
                    {isExpired(survey) && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge variant="destructive" data-testid={`badge-expired-${survey.id}`}>Expired</Badge>
                      </div>
                    )}
                    <SurveyCard
                      survey={{
                        id: survey.id,
                        title: survey.title,
                        description: survey.description || undefined,
                        createdAt: survey.createdAt.toString(),
                        questionCount: survey.questions.length,
                        status: survey.status || undefined,
                        publishedAt: survey.publishedAt?.toString(),
                        trainerName: survey.trainerName || undefined,
                        trainingDate: survey.trainingDate?.toString(),
                        tags: survey.tags || undefined,
                        questions: survey.questions,
                        scoreConfig: survey.scoreConfig,
                      }}
                      onEdit={() => handleEdit(survey.id)}
                      onView={() => handleView(survey.id)}
                      onAnalyze={() => handleAnalyze(survey.id)}
                      onExport={() => handleExport(survey.id)}
                      onDelete={() => handleDelete(survey.id)}
                      onManageRespondents={() => setLocation(`/respondents/${survey.id}`)}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
