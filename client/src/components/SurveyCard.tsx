import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, BarChart3, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Survey {
  id: string;
  title: string;
  createdAt: string;
  responseCount: number;
  questionCount: number;
}

interface SurveyCardProps {
  survey: Survey;
  onView: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export default function SurveyCard({ survey, onView, onAnalyze, onExport, onDelete }: SurveyCardProps) {
  return (
    <Card className="hover-elevate transition-all" data-testid={`survey-card-${survey.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg line-clamp-2">{survey.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(survey.createdAt).toLocaleDateString()}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-menu">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView} data-testid="menu-view">
              <Eye className="w-4 h-4 mr-2" />
              View Survey
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAnalyze} data-testid="menu-analyze">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport} data-testid="menu-export">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="menu-delete">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Questions</p>
            <p className="font-semibold text-lg" data-testid="text-question-count">{survey.questionCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Responses</p>
            <p className="font-semibold text-lg" data-testid="text-response-count">{survey.responseCount}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" onClick={onView} data-testid="button-view">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button className="flex-1" onClick={onAnalyze} data-testid="button-analyze">
          <BarChart3 className="w-4 h-4 mr-2" />
          Analyze
        </Button>
      </CardFooter>
    </Card>
  );
}
