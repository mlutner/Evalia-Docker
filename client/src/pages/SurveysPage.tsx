import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, FileText, Grid3X3, List, TrendingUp, TrendingDown,
  MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, Copy, 
  ExternalLink, Archive, Clock, BarChart3, Users, Search,
  Filter, Settings, UserPlus, ChevronRight, Calendar, MessageSquare,
  Activity, CheckCircle2, AlertCircle
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SurveyWithCounts } from "@shared/schema";
import { CreateSurveyModal } from "@/components/builder-v2/CreateSurveyModal";
import { formatDistanceToNow } from "date-fns";

// ============================================
// CONSTANTS & TYPES
// ============================================
const ITEMS_PER_PAGE = 6;

type ViewMode = "list" | "grid";
type StatusFilter = "all" | "active" | "draft" | "closed";

// Status configuration
const STATUS_CONFIG = {
  active: { label: "ACTIVE", className: "bg-emerald-100 text-emerald-700" },
  draft: { label: "DRAFT", className: "bg-gray-100 text-gray-600" },
  closed: { label: "CLOSED", className: "bg-gray-200 text-gray-500" },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getRelativeTime = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

const getSurveyStatus = (survey: SurveyWithCounts): keyof typeof STATUS_CONFIG => {
  if (!survey.publishedAt) return "draft";
  const status = survey.status?.toLowerCase() || "active";
  if (status === "closed") return "closed";
  return "active";
};

// ============================================
// COMPONENTS
// ============================================

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}

function OverviewCard({ 
  label, 
  value, 
  subtext, 
  trend, 
  trendValue,
  icon: Icon,
  iconBg
}: {
  label: string;
  value: string | number;
  subtext: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon: React.ElementType;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend && trendValue && (
          <span className={`flex items-center text-sm font-medium ${
            trend === "up" ? "text-emerald-600" : "text-red-500"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1">{subtext}</p>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      <Icon className="w-4 h-4 text-gray-500" />
      {label}
    </button>
  );
}

function SurveyCard({ 
  survey, 
  onEdit, 
  onView,
  onAnalytics,
  onCopyLink,
  onDelete,
  onClearResponses,
}: { 
  survey: SurveyWithCounts;
  onEdit: () => void;
  onView: () => void;
  onAnalytics: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  onClearResponses: () => void;
}) {
  const status = getSurveyStatus(survey);
  const tags = survey.tags || [];
  const questionCount = survey.questionCount || survey.questions?.length || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <button 
              onClick={onEdit}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left truncate block"
            >
              {survey.title}
            </button>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={status} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {status === "draft" ? "Created" : "Edited"} {getRelativeTime(survey.updatedAt || survey.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Survey
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAnalytics}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyLink}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Survey
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearResponses} className="text-amber-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Responses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Survey
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {survey.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{survey.description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1" title="Questions">
            <FileText className="w-4 h-4" />
            <span>{questionCount}</span>
          </div>
          <div className="flex items-center gap-1" title="Responses">
            <MessageSquare className="w-4 h-4" />
            <span>{survey.responseCount || 0}</span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onAnalytics}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="View Analytics"
          >
            <BarChart3 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
          </button>
          <button 
            onClick={onView}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Preview Survey"
          >
            <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function SurveysPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Confirmation dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);

  // Data fetching
  const { data: surveys = [], isLoading } = useQuery<SurveyWithCounts[]>({
    queryKey: ["/api/surveys"],
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/surveys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({ title: "Survey deleted", description: "The survey has been removed." });
      setDeleteConfirm(null);
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/surveys/${id}/clear-responses`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({ title: "Responses cleared", description: "All survey responses have been reset." });
      setResetConfirm(null);
    },
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const stats = useMemo(() => {
    const activeSurveys = surveys.filter(s => getSurveyStatus(s) === "active");
    const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);
    const avgResponseRate = activeSurveys.length > 0 
      ? Math.round((totalResponses / (activeSurveys.length * 100)) * 100) 
      : 0;
    
    return {
      responseRate: Math.min(avgResponseRate, 100),
      pendingReviews: surveys.filter(s => getSurveyStatus(s) === "draft").length,
      totalResponses,
      activeSurveys: activeSurveys.length,
    };
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    let filtered = surveys;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(s => getSurveyStatus(s) === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    // Sort by most recent
    return [...filtered].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [surveys, statusFilter, searchQuery]);

  const paginatedSurveys = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSurveys.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSurveys, currentPage]);

  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE);

  // Helpers for dialogs
  const surveyToDelete = surveys.find(s => s.id === deleteConfirm);
  const surveyToReset = surveys.find(s => s.id === resetConfirm);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCopyLink = (surveyId: string) => {
    const url = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Survey link copied to clipboard" });
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      {/* Dialogs */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{surveyToDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this survey and all responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!resetConfirm} onOpenChange={(open) => !open && setResetConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear responses for "{surveyToReset?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all collected responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => resetConfirm && resetMutation.mutate(resetConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Responses
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateSurveyModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Top Bar: Search + New Survey */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md pl-12 h-11 bg-white border-gray-200"
              />
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="h-11 px-5 gap-2"
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              <Plus className="w-4 h-4" />
              New Survey
            </Button>
          </div>

          {/* Overview Stats */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Overview</h2>
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                LAST 30 DAYS
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <OverviewCard
                label="ACTIVE PULSE"
                value={`${stats.responseRate}%`}
                subtext="Response Rate"
                trend="up"
                trendValue="+2.4%"
                icon={TrendingUp}
                iconBg="bg-purple-100 text-purple-600"
              />
              <OverviewCard
                label="PENDING REVIEWS"
                value={stats.pendingReviews}
                subtext="Needs Attention"
                trend={stats.pendingReviews > 5 ? "up" : undefined}
                trendValue={stats.pendingReviews > 5 ? `-${stats.pendingReviews - 5}` : undefined}
                icon={Clock}
                iconBg="bg-amber-100 text-amber-600"
              />
              <OverviewCard
                label="TOTAL RESPONSES"
                value={stats.totalResponses}
                subtext="Last 30 Days"
                trend="up"
                trendValue="+12%"
                icon={CheckCircle2}
                iconBg="bg-emerald-100 text-emerald-600"
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="flex gap-3">
              <QuickActionButton 
                icon={Copy} 
                label="Clone Last Survey" 
                onClick={() => toast({ title: "Coming soon", description: "Clone feature coming soon" })} 
              />
              <QuickActionButton 
                icon={BarChart3} 
                label="View All Analytics" 
                onClick={() => setLocation("/analytics")} 
              />
              <QuickActionButton 
                icon={UserPlus} 
                label="Invite Team" 
                onClick={() => toast({ title: "Coming soon", description: "Team invites coming soon" })} 
              />
              <QuickActionButton 
                icon={Settings} 
                label="Survey Settings" 
                onClick={() => setLocation("/settings")} 
              />
            </div>
          </section>

          {/* Recent Surveys Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Surveys</h2>
              <div className="flex items-center gap-2">
                {/* Filter Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Surveys
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Active Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                      Drafts Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("closed")}>
                      Closed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      viewMode === "list"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      viewMode === "grid"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Board
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="text-gray-500">Loading surveys...</div>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No surveys yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Create your first survey to start collecting feedback.
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Survey
                </Button>
              </div>
            ) : (
              <>
                {/* Grid View */}
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                  {paginatedSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onEdit={() => setLocation(`/builder-v2/${survey.id}`)}
                      onView={() => setLocation(`/survey/${survey.id}`)}
                      onAnalytics={() => setLocation(`/analytics/${survey.id}`)}
                      onCopyLink={() => handleCopyLink(survey.id)}
                      onDelete={() => setDeleteConfirm(survey.id)}
                      onClearResponses={() => setResetConfirm(survey.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Recent Activity */}
          {surveys.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {surveys.slice(0, 3).map((survey, idx) => (
                  <div key={survey.id} className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">You</span>
                        {getSurveyStatus(survey) === "draft" ? " created " : " updated "}
                        <span className="font-medium">{survey.title}</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(survey.updatedAt || survey.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
