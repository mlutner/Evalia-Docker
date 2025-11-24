import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Eye, BarChart3, Download, Share2, Check, Copy, Edit3, Users, CheckCircle, Pause, Lock, Download as DownloadIcon, Gauge, FileText as FileIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, memo } from "react";
import { theme } from "@/theme";
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
  
  const badgeStyle = {
    backgroundColor: '#F7F9FC',
    color: '#1C2635',
    borderColor: '#E2E7EF',
    fontSize: '12px',
    fontWeight: 500,
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #E2E7EF'
  };

  const getStatusDisplay = () => {
    // If not published yet, show Draft status
    if (!survey.publishedAt) {
      return {
        badge: <Badge variant="outline" style={badgeStyle} className="gap-1" data-testid={`badge-status-${survey.id}`}>
          Edit Survey
        </Badge>,
        tooltip: "Survey is in draft. Complete and publish to start collecting responses."
      };
    }

    switch (survey.status) {
      case "Active":
        return {
          badge: <Badge variant="outline" style={badgeStyle} className="gap-1" data-testid={`badge-status-${survey.id}`}>
            <CheckCircle className="w-3 h-3" />
            Live
          </Badge>,
          tooltip: "Survey is live and accepting responses"
        };
      case "Paused":
        return {
          badge: <Badge variant="outline" style={badgeStyle} className="gap-1" data-testid={`badge-status-${survey.id}`}>
            <Pause className="w-3 h-3" />
            Paused
          </Badge>,
          tooltip: "Survey is paused. Respondents cannot submit new responses."
        };
      case "Closed":
        return {
          badge: <Badge variant="outline" style={badgeStyle} className="gap-1" data-testid={`badge-status-${survey.id}`}>
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
    <Card 
      className="card-hover hover-elevate shadow-sm transition-all flex flex-col" 
      style={{ height: '380px', display: 'flex', flexDirection: 'column' }}
      data-testid={`survey-card-${survey.id}`}
    >
      <CardHeader className="flex flex-col pb-0 mb-2">
        <div className="flex flex-row items-start justify-between gap-3 mb-3">
          <h3 style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3', color: '#1C2635', flex: 1 }} className="line-clamp-2">{survey.title}</h3>
          <div className="flex gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  data-testid="button-menu"
                  style={{ color: '#6A7789', width: '32px', height: '32px', minWidth: '32px' }}
                  className="hover:text-[#1C2635] transition-colors"
                >
                  <MoreVertical className="w-[18px] h-[18px]" />
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShareDialogOpen(true)}
              data-testid={`button-share-header-${survey.id}`}
              style={{ color: '#6A7789', width: '32px', height: '32px', minWidth: '32px' }}
              className="hover:text-[#1C2635] transition-colors"
            >
              <Share2 className="w-[18px] h-[18px]" />
            </Button>
          </div>
        </div>
        
        {survey.description && (
          <p style={{ fontSize: '13px', color: '#6A7789', marginBottom: '6px', lineHeight: '1.4' }} className="line-clamp-2">{survey.description}</p>
        )}
        {!survey.description && survey.questions && (
          <p style={{ fontSize: '13px', color: '#6A7789', marginBottom: '6px', lineHeight: '1.4' }}>{generateSurveySummary(survey.questions)}</p>
        )}

        <div style={{ marginBottom: '12px' }} className="flex flex-col gap-0.5">
          {survey.trainerName && (
            <p style={{ fontSize: '12px', color: '#6A7789', fontWeight: 500 }}>
              <span style={{ fontWeight: 600 }}>Trainer:</span> {survey.trainerName}
            </p>
          )}
          {survey.trainingDate && (
            <p style={{ fontSize: '12px', color: '#6A7789', fontWeight: 500 }}>
              <span style={{ fontWeight: 600 }}>Training Date:</span> {new Date(survey.trainingDate).toLocaleDateString()}
            </p>
          )}
          <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 500 }}>
            Created {new Date(survey.createdAt).toLocaleDateString()}
          </p>
        </div>

        {statusDisplay.badge && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 500 }}>Status:</span>
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

      <CardContent className="flex-1 space-y-3">
        {/* Stats Section */}
        <div className="flex gap-8">
          <div>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 600, letterSpacing: '0.5px' }}>Questions</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#1C2635', marginTop: '2px' }} data-testid="text-question-count">{survey.questionCount || 0}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 600, letterSpacing: '0.5px' }}>Responses</p>
            <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#1C2635' }} data-testid="text-response-count">{survey.responseCount ?? 0}</p>
              {survey.respondentCount !== undefined && survey.respondentCount > 0 && (
                <div style={{ fontSize: '11px', color: '#6A7789' }}>
                  <span>/ {survey.respondentCount}</span>
                  <span className="block font-semibold">{Math.round((survey.responseCount / Math.max(1, survey.respondentCount)) * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        
        {/* Feature Indicators */}
        <div className="flex flex-wrap gap-2 pt-1">
          {survey.scoreConfig?.enabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" style={{ backgroundColor: 'rgba(47, 143, 165, 0.08)', color: theme.colors.primary, borderColor: 'rgba(47, 143, 165, 0.3)' }} className="gap-1 text-xs cursor-help" data-testid={`badge-scoring-${survey.id}`}>
                  <Gauge className="w-3 h-3" />
                  Scoring
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                This survey has scoring enabled
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

      <CardFooter className="gap-3 mt-auto flex-col">
        <div className="flex w-full gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-11"
            onClick={onEdit} 
            data-testid={`button-edit-${index}`}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onAnalyze} 
                data-testid={`button-analyze-${index}`}
                disabled={survey.responseCount === 0}
                style={{
                  backgroundColor: '#5AB3AB',
                  color: '#FFFFFF',
                  borderRadius: '6px'
                }}
                className="flex-1 h-11 font-semibold"
              >
                <BarChart3 className="w-4 h-4 mr-2" strokeWidth={2} />
                Analyze
              </Button>
            </TooltipTrigger>
            {survey.responseCount === 0 && (
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                Collect responses first to analyze survey data
              </TooltipContent>
            )}
          </Tooltip>
        </div>
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
