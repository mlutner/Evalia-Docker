import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import SurveyCard from "@/components/SurveyCard";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import type { Survey } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Your Surveys</h1>
            <p className="text-muted-foreground">
              Create, manage, and analyze your training surveys
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
            <FileText className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No surveys yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first survey to get started
            </p>
            <Button size="lg" onClick={() => setLocation("/builder")} data-testid="button-create-first">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Survey
            </Button>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
