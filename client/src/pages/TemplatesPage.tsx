import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Clock, Users, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import type { Template } from "@shared/schema";
import { theme } from "@/theme";

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
    <main style={{ backgroundColor: theme.backgrounds.page }}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Survey Templates</h1>
            <p style={{ color: theme.text.secondary }}>Choose from pre-built templates or create a new one</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setLocation("/builder")} 
            data-testid="button-new-template"
            style={{ 
              backgroundColor: '#C3F33C',
              color: '#0A1A2F',
              fontWeight: '600'
            }}
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
                className="evalia-survey-card"
                data-testid={`template-card-${template.id}`}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Header: Title + Question Count Badge */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C2635', lineHeight: '1.3' }} className="line-clamp-2 flex-1">{template.title}</h3>
                    <div style={{ backgroundColor: 'rgba(163, 214, 92, 0.1)', color: '#1C2635', borderColor: 'rgba(163, 214, 92, 0.3)', fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(163, 214, 92, 0.3)', borderRadius: '6px' }} className="flex-shrink-0">
                      <FileText className="w-3 h-3" />
                      {template.questions.length}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-1">
                  <p style={{ fontSize: '13px', color: '#6A7789', lineHeight: '1.4' }} className="line-clamp-2">{template.description}</p>
                </div>

                {/* Category */}
                <div className="px-5 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#6A7789' }} />
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 500, letterSpacing: '0.4px' }}>
                    {template.category}
                  </span>
                </div>

                {/* Buttons */}
                <div className="px-5 py-4 gap-3 flex flex-col mt-auto">
                  <div className="flex w-full gap-3">
                    <Button
                      onClick={() => setPreviewTemplate(template)}
                      variant="outline"
                      className="flex-1 h-10 font-semibold text-sm"
                      data-testid={`button-preview-template-${template.id}`}
                    >
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 h-10 font-semibold text-sm"
                      style={{ 
                        backgroundColor: '#1F6F78',
                        color: '#FFFFFF',
                      }}
                      data-testid={`button-use-template-${template.id}`}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
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
