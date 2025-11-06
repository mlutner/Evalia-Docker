import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import SurveyCard from "@/components/SurveyCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, FileText, BarChart3, Calendar } from "lucide-react";
import type { Survey } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "recent">("all");

  const { data: surveys = [], isLoading } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
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

  const handleDelete = (id: string) => {
    console.log("Delete survey:", id);
  };

  // Sort surveys by creation date for "Recent" tab
  const recentSurveys = [...surveys].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Your Surveys</h1>
            <p className="text-muted-foreground">
              {surveys.length === 0 
                ? "Create, manage, and analyze your training surveys"
                : `${surveys.length} ${surveys.length === 1 ? 'survey' : 'surveys'} created`
              }
            </p>
          </div>
          <Button size="lg" onClick={() => setLocation("/builder")} data-testid="button-new-survey">
            <Plus className="w-5 h-5 mr-2" />
            New Survey
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-muted-foreground">Loading your surveys...</div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No surveys yet</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              Create your first AI-powered survey in minutes. Choose from templates, generate with AI, or upload a document.
            </p>
            <Button size="lg" onClick={() => setLocation("/builder")} data-testid="button-create-first">
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing all {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.map((survey, index) => (
                  <SurveyCard
                    key={survey.id}
                    survey={{
                      id: survey.id,
                      title: survey.title,
                      createdAt: survey.createdAt.toString(),
                      responseCount: 0,
                      questionCount: survey.questions.length,
                    }}
                    onEdit={() => handleEdit(survey.id)}
                    onView={() => handleView(survey.id)}
                    onAnalyze={() => handleAnalyze(survey.id)}
                    onExport={() => handleExport(survey.id)}
                    onDelete={() => handleDelete(survey.id)}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Your {recentSurveys.length} most recent {recentSurveys.length === 1 ? 'survey' : 'surveys'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentSurveys.map((survey, index) => (
                  <SurveyCard
                    key={survey.id}
                    survey={{
                      id: survey.id,
                      title: survey.title,
                      createdAt: survey.createdAt.toString(),
                      responseCount: 0,
                      questionCount: survey.questions.length,
                    }}
                    onEdit={() => handleEdit(survey.id)}
                    onView={() => handleView(survey.id)}
                    onAnalyze={() => handleAnalyze(survey.id)}
                    onExport={() => handleExport(survey.id)}
                    onDelete={() => handleDelete(survey.id)}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
