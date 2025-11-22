import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Eye, BarChart3, Download, Share2, Check, Copy, Edit3, Users, CheckCircle, Pause, Lock, Download as DownloadIcon, Gauge, FileText as FileIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, memo } from "react";
import type { Question, SurveyWithCounts } from "@shared/schema";

// Generate a brief summary from survey questions
function generateSurveySummary(questions?: Question[]): string {
  if (!questions || questions.length === 0) return "";
  
  // Extract key themes from questions
  const questionTexts = questions.map(q => q.question.toLowerCase());
  const themes: string[] = [];
  
  if (questionTexts.some(q => q.includes("confident") || q.includes("familiar"))) {
    themes.push("Confidence");
  }
  if (questionTexts.some(q => q.includes("satisf") || q.includes("meet"))) {
    themes.push("Satisfaction");
  }
  if (questionTexts.some(q => q.includes("apply") || q.includes("use") || q.includes("change"))) {
    themes.push("Application");
  }
  if (questionTexts.some(q => q.includes("knowledge") || q.includes("understand") || q.includes("explain"))) {
    themes.push("Knowledge");
  }
  if (questionTexts.some(q => q.includes("quality") || q.includes("impact") || q.includes("improvement"))) {
    themes.push("Impact");
  }
  if (questionTexts.some(q => q.includes("motiv") || q.includes("barrier") || q.includes("challenge"))) {
    themes.push("Motivation");
  }
  if (questionTexts.some(q => q.includes("feedback") || q.includes("improve") || q.includes("change"))) {
    themes.push("Feedback");
  }
  
  if (themes.length === 0) return "";
  
  // Take first 2-3 themes for conciseness
  return `Covers: ${themes.slice(0, 3).join(", ")}`;
}

interface SurveyCardProps {
  survey: SurveyWithCounts;
  onEdit: () => void;
  onView: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onManageRespondents?: () => void;
  onShare?: () => void;
  index?: number;
}

const SurveyCardComponent = function SurveyCard({ survey, onEdit, onView, onAnalyze, onExport, onDelete, onDuplicate, onManageRespondents, index = 0 }: SurveyCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const shareUrl = `${window.location.origin}/survey/${survey.id}`;
  
  const getStatusDisplay = () => {
    // If not published yet, show Draft status
    if (!survey.publishedAt) {
      return {
        badge: <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 gap-1" data-testid={`badge-status-${survey.id}`}>
          Edit Survey
        </Badge>,
        tooltip: "Survey is in draft. Complete and publish to start collecting responses."
      };
    }

    switch (survey.status) {
      case "Active":
        return {
          badge: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1" data-testid={`badge-status-${survey.id}`}>
            <CheckCircle className="w-3 h-3" />
            Live
          </Badge>,
          tooltip: "Survey is live and accepting responses"
        };
      case "Paused":
        return {
          badge: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1" data-testid={`badge-status-${survey.id}`}>
            <Pause className="w-3 h-3" />
            Paused
          </Badge>,
          tooltip: "Survey is paused. Respondents cannot submit new responses."
        };
      case "Closed":
        return {
          badge: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1" data-testid={`badge-status-${survey.id}`}>
            <Lock className="w-3 h-3" />
            Closed
          </Badge>,
          tooltip: "Survey is closed. No new responses are accepted. View analytics anytime."
        };
      default:
        return { badge: null, tooltip: "" };
    }
  };

  const statusDisplay = getStatusDisplay();
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };


  return (
    <Card className="hover-elevate transition-all flex flex-col" data-testid={`survey-card-${survey.id}`}>
      <CardHeader className="flex flex-col space-y-3 pb-4">
        <div className="flex flex-row items-start justify-between space-y-0">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2">{survey.title}</h3>
            {survey.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{survey.description}</p>
            )}
            {!survey.description && survey.questions && (
              <p className="text-sm text-muted-foreground mt-2">{generateSurveySummary(survey.questions)}</p>
            )}
            <div className="flex flex-col gap-1 mt-2">
              {survey.trainerName && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Trainer:</span> {survey.trainerName}
                </p>
              )}
              {survey.trainingDate && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Training Date:</span> {new Date(survey.trainingDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Created {new Date(survey.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-menu">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShareDialogOpen(true)} data-testid="menu-share">
              <Share2 className="w-4 h-4 mr-2" />
              Share Survey
            </DropdownMenuItem>
            {onManageRespondents && (
              <DropdownMenuItem onClick={onManageRespondents} data-testid="menu-respondents">
                <Users className="w-4 h-4 mr-2" />
                Manage Respondents
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onView} data-testid="menu-view">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport} data-testid="menu-export">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={onDuplicate} data-testid="menu-duplicate">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Survey
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="menu-delete">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        {statusDisplay.badge && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <Tooltip>
              <TooltipTrigger asChild>
                {statusDisplay.badge}
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {statusDisplay.tooltip}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Questions</p>
            <p className="font-semibold text-lg" data-testid="text-question-count">{survey.questionCount || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Responses</p>
            <p className="font-semibold text-lg" data-testid="text-response-count">{survey.responseCount ?? 0}</p>
          </div>
        </div>
        {survey.respondentCount !== undefined && survey.respondentCount > 0 && (
          <div className="text-xs text-muted-foreground pt-1">
            Response rate: <span className="font-medium">{survey.respondentCount > 0 ? Math.round((survey.responseCount / Math.max(1, survey.respondentCount)) * 100) : 0}%</span>
          </div>
        )}
        
        {/* Feature Indicators */}
        <div className="flex flex-wrap gap-2 pt-2">
          {survey.scoreConfig?.enabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs cursor-help" data-testid={`badge-scoring-${survey.id}`}>
                  <Gauge className="w-3 h-3" />
                  Scoring
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                This survey has scoring enabled
              </TooltipContent>
            </Tooltip>
          )}
          
          {survey.responseCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs cursor-help" data-testid={`badge-results-${survey.id}`}>
                  <FileIcon className="w-3 h-3" />
                  {survey.responseCount} Results
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                {survey.responseCount} response{survey.responseCount === 1 ? '' : 's'} collected
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {survey.tags && survey.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {survey.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit} data-testid={`button-edit-${index}`}>
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button className="flex-1" onClick={onAnalyze} data-testid={`button-analyze-${index}`}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Analyze
        </Button>
      </CardFooter>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent data-testid="dialog-share">
          <DialogHeader>
            <DialogTitle>Share Survey</DialogTitle>
            <DialogDescription>
              Share with respondents to collect responses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* QR Code Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-lg border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                  alt="Survey QR Code"
                  className="w-[200px] h-[200px]"
                  data-testid="qr-code-image"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code to take the survey
              </p>
              <Button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`;
                  link.download = `survey-${survey.id}-qr.png`;
                  link.click();
                }} 
                size="sm" 
                variant="outline" 
                className="w-full" 
                data-testid="button-download-qr"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-muted-foreground">or share link</span>
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                  data-testid="input-share-url"
                />
                <Button onClick={handleCopyLink} variant="outline" data-testid="button-copy-link">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can submit a response to your survey.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default memo(SurveyCardComponent);
