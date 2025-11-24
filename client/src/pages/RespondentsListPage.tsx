import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, ChevronRight } from "lucide-react";
import type { SurveyWithCounts } from "@shared/schema";

export default function RespondentsListPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: surveys = [], isLoading } = useQuery<SurveyWithCounts[]>({
    queryKey: ["/api/surveys"],
  });

  const filteredSurveys = useMemo(() => {
    if (!searchTerm) return surveys;
    return surveys.filter(s => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [surveys, searchTerm]);

  return (
    <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Respondents</h1>
          <p className="text-muted-foreground">
            Manage survey respondents and track response completion
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-muted-foreground">Loading surveys...</div>
          </div>
        ) : surveys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Create a survey first to start managing respondents and tracking responses.
              </p>
              <Button onClick={() => setLocation("/builder")}>Create Survey</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-9 w-full px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-md bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                data-testid="input-search-respondents"
              />
            </div>

            {filteredSurveys.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No surveys match your search</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSurveys.map((survey) => {
                  const respondentCount = 0; // TODO: fetch respondent counts if available
                  const completedCount = 0; // TODO: fetch completed counts if available
                  const completionRate = respondentCount > 0 ? Math.round((completedCount / respondentCount) * 100) : 0;

                  return (
                    <Card key={survey.id} className="hover-elevate cursor-pointer transition-all" onClick={() => setLocation(`/respondents/${survey.id}`)} data-testid={`card-survey-respondents-${survey.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{survey.title}</CardTitle>
                            {survey.description && (
                              <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/respondents/${survey.id}`);
                            }}
                            data-testid={`button-manage-${survey.id}`}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Questions</p>
                            <p className="text-2xl font-bold">{survey.questions.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Responses</p>
                            <p className="text-2xl font-bold">{survey.responseCount || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="text-sm font-semibold capitalize">
                              {survey.publishedAt ? "Live" : "Draft"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
