import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  BarChart3, TrendingUp, Users, MessageSquare, 
  Calendar, Eye, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SurveyWithCounts } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function AnalyticsListPage() {
  const [, setLocation] = useLocation();
  
  const { data: surveys = [], isLoading } = useQuery<SurveyWithCounts[]>({
    queryKey: ["/api/surveys"],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate overall stats
  const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.publishedAt && s.status !== 'closed').length;
  const avgResponseRate = totalSurveys > 0 
    ? Math.round(totalResponses / totalSurveys) 
    : 0;

  // Get surveys with responses for analytics
  const surveysWithResponses = surveys
    .filter(s => (s.responseCount || 0) > 0)
    .sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0));

  return (
    <main className="flex-1 overflow-auto" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-500 mt-1">View insights and performance across all your surveys</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Surveys"
            value={totalSurveys}
            icon={BarChart3}
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="Active Surveys"
            value={activeSurveys}
            icon={Eye}
            iconBg="bg-green-100 text-green-600"
          />
          <StatCard
            label="Total Responses"
            value={totalResponses}
            icon={MessageSquare}
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatCard
            label="Avg. Responses/Survey"
            value={avgResponseRate}
            icon={TrendingUp}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>

        {/* Surveys List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Survey Analytics</h2>
            <Input
              type="text"
              placeholder="Search surveys..."
              className="w-64 h-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-gray-500">Loading surveys...</div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No surveys yet</h3>
              <p className="text-gray-500 mb-6">Create a survey to start collecting data</p>
              <Button 
                onClick={() => setLocation('/builder-v2/new')}
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                Create Survey
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {surveys.map((survey) => (
                <SurveyAnalyticsRow
                  key={survey.id}
                  survey={survey}
                  onClick={() => setLocation(`/analytics/${survey.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Surveys */}
        {surveysWithResponses.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Top Performing Surveys</h2>
              <p className="text-sm text-gray-500">Surveys with the most responses</p>
            </div>
            <div className="divide-y divide-gray-100">
              {surveysWithResponses.slice(0, 5).map((survey, idx) => (
                <div 
                  key={survey.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setLocation(`/analytics/${survey.id}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{survey.title}</p>
                    <p className="text-sm text-gray-500">{survey.questionCount || 0} questions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{survey.responseCount || 0}</p>
                    <p className="text-xs text-gray-500">responses</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon,
  iconBg
}: {
  label: string;
  value: number | string;
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
      <p className="text-3xl font-bold text-gray-900 mt-3">{value}</p>
    </div>
  );
}

function SurveyAnalyticsRow({ 
  survey, 
  onClick 
}: { 
  survey: SurveyWithCounts;
  onClick: () => void;
}) {
  const responseCount = survey.responseCount || 0;
  const questionCount = survey.questionCount || survey.questions?.length || 0;
  const isActive = survey.publishedAt && survey.status !== 'closed';

  return (
    <div 
      className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <BarChart3 className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{survey.title}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            isActive 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isActive ? 'Active' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {responseCount} responses
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {questionCount} questions
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(survey.updatedAt || survey.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      {/* Mini chart placeholder */}
      <div className="hidden md:flex items-center gap-1">
        {[40, 65, 45, 80, 55, 70].map((height, i) => (
          <div 
            key={i}
            className="w-1.5 bg-purple-400 rounded-full"
            style={{ height: `${height * 0.3}px` }}
          />
        ))}
      </div>
      
      <div className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium">
        View <ChevronRight className="w-5 h-5 ml-1" />
      </div>
    </div>
  );
}

