import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Badge } from "lucide-react";
import type { Template } from "@shared/schema";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const handleUseTemplate = (template: Template) => {
    const surveyData = {
      title: `${template.title} - Copy`,
      description: template.description,
      questions: template.questions,
      scoreConfig: template.scoreConfig,
    };
    sessionStorage.setItem("templateSurvey", JSON.stringify(surveyData));
    setLocation("/builder");
  };

  return (
    <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Survey Templates</h1>
            <p className="text-muted-foreground">Choose from pre-built templates or create a new one</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setLocation("/builder")} 
            data-testid="button-new-template"
            className="w-full sm:w-auto bg-evalia-lime hover:bg-evalia-lime/90 text-slate-900 border-0 font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Template
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-muted-foreground">Loading templates...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="flex flex-col hover:shadow-lg transition-shadow"
                data-testid={`template-card-${template.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{template.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pb-6">
                  <div className="flex-1 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${template.id}`}>
                        {template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {template.questions.length} questions
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A template with {template.questions.length} pre-configured questions ready to customize.
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleUseTemplate(template)}
                    className="w-full"
                    variant="default"
                    data-testid={`button-use-template-${template.id}`}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
