import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Clock, Users, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import type { Template } from "@shared/schema";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

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
                className="flex flex-col hover-elevate"
                data-testid={`template-card-${template.id}`}
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold flex-1 leading-tight">{template.title}</h3>
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-md px-2 py-0.5 flex items-center gap-1.5 flex-shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5" />
                      {template.questions.length}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                  <div className="space-y-2 mb-6 flex-1">
                    {template.timing && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{template.timing}</span>
                      </div>
                    )}
                    {template.audience && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{template.audience}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 bg-evalia-primary hover:bg-evalia-primary/90 text-white"
                      variant="default"
                      data-testid={`button-preview-template-${template.id}`}
                    >
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 bg-evalia-primary hover:bg-evalia-primary/90 text-evalia-lime font-semibold"
                      data-testid={`button-use-template-${template.id}`}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{previewTemplate.title}</DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {previewTemplate.questions.map((question, idx) => (
                  <div key={question.id} className="border-b pb-4 last:border-b-0">
                    <p className="font-semibold text-sm mb-2">
                      {idx + 1}. {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">Type: {question.type}</p>
                    {question.options && question.options.length > 0 && (
                      <ul className="text-sm space-y-1 ml-4 list-disc">
                        {question.options.slice(0, 5).map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                        {question.options.length > 5 && (
                          <li>... and {question.options.length - 5} more options</li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
