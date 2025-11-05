import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, FileText } from "lucide-react";
import type { SurveyTemplate } from "@shared/templates";

interface TemplateCardProps {
  template: SurveyTemplate;
  onPreview: () => void;
  onUse: () => void;
}

export default function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <Card className="hover-elevate transition-all h-full flex flex-col" data-testid={`template-card-${template.id}`}>
      <CardHeader className="space-y-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{template.title}</h3>
          <Badge variant="secondary" className="shrink-0">
            <FileText className="w-3 h-3 mr-1" />
            {template.questionCount}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{template.timing}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{template.audience}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2 mt-auto">
        <Button variant="outline" className="flex-1" onClick={onPreview} data-testid="button-preview-template">
          Preview
        </Button>
        <Button className="flex-1" onClick={onUse} data-testid="button-use-template">
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
