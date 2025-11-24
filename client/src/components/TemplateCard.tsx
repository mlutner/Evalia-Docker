import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import type { SurveyTemplate } from "@shared/templates";

interface TemplateCardProps {
  template: SurveyTemplate;
  onPreview: () => void;
  onUse: () => void;
}

export default function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <Card 
      className="evalia-survey-card"
      data-testid={`template-card-${template.id}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Header: Title + Question Count Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C2635', lineHeight: '1.3' }} className="line-clamp-2 flex-1">{template.title}</h3>
          <Badge variant="outline" style={{ backgroundColor: 'rgba(163, 214, 92, 0.1)', color: '#1C2635', borderColor: 'rgba(163, 214, 92, 0.3)', fontSize: '11px', padding: '4px 8px' }} className="gap-1 flex-shrink-0" data-testid={`badge-question-count-${template.id}`}>
            <FileText className="w-3 h-3" />
            {template.questionCount}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-1">
        <p style={{ fontSize: '13px', color: '#6A7789', lineHeight: '1.4' }} className="line-clamp-2">{template.description}</p>
      </div>

      {/* Timing */}
      <div className="px-5 py-2 flex items-center gap-2">
        <Clock className="w-4 h-4" style={{ color: '#6A7789' }} />
        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 500, letterSpacing: '0.4px' }}>
          {template.timing}
        </span>
      </div>

      {/* Buttons */}
      <div className="px-5 py-4 gap-3 flex flex-col mt-auto">
        <div className="flex w-full gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-10 font-semibold text-sm"
            onClick={onPreview} 
            data-testid="button-preview-template"
          >
            Preview
          </Button>
          <Button 
            onClick={onUse}
            className="flex-1 h-10 font-semibold text-sm"
            style={{
              backgroundColor: '#1F6F78',
              color: '#FFFFFF',
            }}
            data-testid="button-use-template"
          >
            Use Template
          </Button>
        </div>
      </div>
    </Card>
  );
}
