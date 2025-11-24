import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import SurveyCard from "@/components/SurveyCard";
import { SurveyFilters } from "@/components/SurveyFilters";
import { DashboardOverview } from "@/components/DashboardOverview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, FileText, BarChart3, Calendar, Clock, Users, Settings, Zap, BookOpen, LayoutDashboard, Menu, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (3)_1763943596811.png";
import type { SurveyWithCounts } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<"overview" | "surveys">("overview");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most-responses" | "alphabetical">("newest");
  const { toast } = useToast();

  // Keyboard shortcut: Cmd+N or Ctrl+N for new survey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setLocation("/builder");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: surveys = [], isLoading } = useQuery<SurveyWithCounts[]>({
    queryKey: ["/api/surveys"],
  });

  // Get all available tags across surveys (memoized)
  const allTags = useMemo(
    () => Array.from(new Set(surveys.flatMap(s => s.tags || []))),
    [surveys]
  );

  // Filter and sort surveys (memoized)
  const filteredSurveys = useMemo(() => {
    let filtered = surveys.filter(survey => {
      const matchesSearch = searchTerm === "" || 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.trainerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => survey.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-responses":
          return b.responseCount - a.responseCount;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [surveys, searchTerm, selectedTags, sortBy]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/surveys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({
        title: "Survey removed",
        description: "Your survey has been permanently deleted.",
      });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      const errorMsg = error?.message || error?.error?.message || "We couldn't remove that survey. Please try again.";
      toast({
        title: "Couldn't remove survey",
        description: errorMsg,
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
    const surveyTitle = surveys.find(s => s.id === id)?.title || "survey";
    const link = document.createElement('a');
    link.href = `/api/surveys/${id}/responses/export?format=csv`;
    link.download = `${surveyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`;
    link.click();
    toast({
      title: "Download started",
      description: "Your responses are on their way as CSV",
    });
  };

  const handleDuplicate = (id: string) => {
    const surveyToDuplicate = surveys.find(s => s.id === id);
    if (!surveyToDuplicate) return;
    
    const duplicateMutation = useMutation({
      mutationFn: async () => {
        return apiRequest("POST", `/api/surveys/${id}/duplicate`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
        toast({
          title: "Survey duplicated",
          description: `"${surveyToDuplicate.title} (Copy)" has been created`,
        });
      },
      onError: (error: any) => {
        const errorMsg = error?.message || error?.error?.message || "Couldn't create a copy. Give it another shot.";
        toast({
          title: "Couldn't duplicate that",
          description: errorMsg,
          variant: "destructive",
        });
      },
    });
    
    duplicateMutation.mutate();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm);
    }
  };

  const surveyToDelete = surveys.find(s => s.id === deleteConfirm);

  // Sidebar items
  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "surveys", label: "Surveys", icon: BarChart3 },
    { id: "respondents", label: "Respondents", icon: Users },
    { id: "scoring", label: "Scoring Models", icon: BookOpen },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "ai", label: "AI Assist", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col">
      <Header />
      {/* Delete Confirmation Dialog */}
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
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`bg-evalia-navy border-r border-slate-700 flex flex-col transition-all duration-300 ${
          sidebarExpanded ? "w-56" : "w-20"
        }`}>
          <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-[#032643]">
            {sidebarExpanded && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-evalia-lime/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-evalia-lime font-bold text-sm">E</span>
                </div>
                <span className="text-white font-semibold text-sm">Evalia</span>
              </div>
            )}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="text-evalia-lime hover:bg-white/10 p-1 rounded transition-colors"
              data-testid="button-toggle-sidebar"
            >
              {sidebarExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-2 bg-[#022643] text-[#fafafa]">
            {sidebarItems.map((item) => {
              const isActive = activeView === item.id || (item.id === "surveys" && activeView === "surveys");
              const Icon = item.icon;
              
              if (item.id === "respondents" || item.id === "scoring" || item.id === "templates" || item.id === "ai" || item.id === "settings") {
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2 text-slate-600 text-sm cursor-not-allowed rounded opacity-40 transition-all ${
                      sidebarExpanded ? "" : "justify-center"
                    }`}
                    title="Coming soon"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarExpanded && <span className="text-xs">{item.label}</span>}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                    isActive
                      ? "bg-evalia-lime/20 text-evalia-lime"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  } ${sidebarExpanded ? "" : "justify-center"}`}
                  data-testid={`nav-${item.id}`}
                  title={!sidebarExpanded ? item.label : ""}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-evalia-lime" : ""}`} />
                  {sidebarExpanded && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 md:py-8">
            {activeView === "overview" ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-semibold">Dashboard</h1>
                  <Button 
                    size="lg" 
                    onClick={() => setLocation("/builder")} 
                    data-testid="button-new-survey"
                    className="bg-evalia-lime hover:bg-evalia-lime/90 text-slate-900 border-0 font-semibold shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    New Survey
                  </Button>
                </div>
                <DashboardOverview />
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Your Surveys</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {surveys.length === 0 
                        ? "Create, manage, and analyze your training surveys"
                        : `${surveys.length} ${surveys.length === 1 ? 'survey' : 'surveys'} created • ${surveys.filter(s => s.publishedAt).length} live • ${surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0)} total responses`
                      }
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => setLocation("/builder")} 
                    data-testid="button-new-survey"
                    className="w-full sm:w-auto bg-evalia-lime hover:bg-evalia-lime/90 text-slate-900 border-0 font-semibold shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSurveys.map((survey, index) => (
                        <div key={survey.id} className="relative">
                          <SurveyCard
                            survey={{
                              id: survey.id,
                              title: survey.title,
                              description: survey.description || undefined,
                              createdAt: survey.createdAt.toString(),
                              questionCount: survey.questions.length,
                              responseCount: survey.responseCount,
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
                            onDuplicate={() => handleDuplicate(survey.id)}
                            onManageRespondents={() => setLocation(`/respondents/${survey.id}`)}
                            index={index}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
