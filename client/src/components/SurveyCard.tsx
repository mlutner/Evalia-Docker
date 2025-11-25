import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Eye, BarChart3, Download, Share2, Check, Copy, Edit3, Users, CheckCircle, Pause, Lock, Download as DownloadIcon, Gauge, FileText as FileIcon, Save, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, memo } from "react";
import { theme } from "@/theme";
import { useToast } from "@/hooks/use-toast";
import type { Question, SurveyWithCounts } from "@shared/schema";
import { generateSurveyPDF, downloadPDF } from "@/lib/pdfGenerator";

// Constants
const BADGE_STYLE = { backgroundColor: '#F7F9FC', color: '#1C2635', borderColor: '#E2E7EF', fontSize: '12px', fontWeight: 500, padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E7EF' };
const THEME_KEYWORDS = [
  { keywords: ["confident", "familiar"], label: "Confidence" },
  { keywords: ["satisf", "meet"], label: "Satisfaction" },
  { keywords: ["apply", "use", "change"], label: "Application" },
  { keywords: ["knowledge", "understand", "explain"], label: "Knowledge" },
  { keywords: ["quality", "impact", "improvement"], label: "Impact" },
  { keywords: ["motiv", "barrier", "challenge"], label: "Motivation" },
  { keywords: ["feedback", "improve", "change"], label: "Feedback" },
];

// Helpers
const generateSurveySummary = (questions?: Question[]): string => {
  if (!questions?.length) return "";
  const texts = questions.map(q => q.question.toLowerCase());
  const themes = THEME_KEYWORDS.filter(t => t.keywords.some(k => texts.some(q => q.includes(k)))).map(t => t.label);
  return themes.length > 0 ? `Covers: ${themes.slice(0, 3).join(", ")}` : "";
};

const StatusBadge = ({ status, published }: { status?: string; published?: string }) => {
  const icons = { Active: CheckCircle, Paused: Pause, Closed: Lock };
  const labels = { Active: "Live", Paused: "Paused", Closed: "Closed" };
  if (!published) return <Badge variant="outline" style={BADGE_STYLE}>Edit Survey</Badge>;
  const Icon = icons[status as keyof typeof icons];
  return Icon ? <Badge variant="outline" style={BADGE_STYLE} className="gap-1"><Icon className="w-3 h-3" />{labels[status as keyof typeof labels]}</Badge> : null;
};

interface SurveyCardProps {
  survey: SurveyWithCounts;
  onEdit: () => void;
  onView: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  onDelete: () => void;
  onReset?: () => void;
  onDuplicate?: () => void;
  onManageRespondents?: () => void;
  onShare?: () => void;
  onSaveAsTemplate?: () => void;
  index?: number;
}

const SurveyCardComponent = function SurveyCard({ survey, onEdit, onView, onAnalyze, onExport, onDelete, onReset, onDuplicate, onManageRespondents, onSaveAsTemplate, index = 0 }: SurveyCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateData, setTemplateData] = useState({ title: survey.title, description: survey.description || "", category: "General" });
  const [exporting, setExporting] = useState(false);

  const shareUrl = `${window.location.origin}/survey/${survey.id}`;
  const brandUrl = `https://evaliasurvey.ca/survey/${survey.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const handleExportPdf = async () => {
    if (!survey.questions?.length) {
      toast({ title: "No questions", description: "Survey has no questions to export", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      const pdf = await generateSurveyPDF(survey.title, survey.description || "", survey.questions, survey.welcomeMessage || "", survey.thankYouMessage || "", undefined, undefined);
      downloadPDF(pdf, survey.title);
      toast({ title: "Success", description: "Survey exported as PDF" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="evalia-survey-card" data-testid={`survey-card-${survey.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="heading-3 flex-1 text-lg" style={{ fontSize: '20px', fontWeight: 700 }}>{survey.title}</h3>
          <div className="flex gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-menu" className="evalia-button-icon h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShareOpen(true)} data-testid="menu-share"><Share2 className="w-4 h-4 mr-2" />Share</DropdownMenuItem>
                {onManageRespondents && <DropdownMenuItem onClick={onManageRespondents} data-testid="menu-respondents"><Users className="w-4 h-4 mr-2" />Respondents</DropdownMenuItem>}
                <DropdownMenuItem onClick={onView} data-testid="menu-view"><Eye className="w-4 h-4 mr-2" />Preview</DropdownMenuItem>
                <DropdownMenuItem onClick={onExport} data-testid="menu-export"><Download className="w-4 h-4 mr-2" />Export Data</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPdf} disabled={exporting} data-testid="menu-export-pdf">{exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileIcon className="w-4 h-4 mr-2" />}PDF</DropdownMenuItem>
                {onDuplicate && <DropdownMenuItem onClick={onDuplicate} data-testid="menu-duplicate"><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>}
                {onSaveAsTemplate && <DropdownMenuItem onClick={() => setTemplateOpen(true)} data-testid="menu-save-template"><Save className="w-4 h-4 mr-2" />Template</DropdownMenuItem>}
                {onReset && survey.responseCount > 0 && <DropdownMenuItem onClick={onReset} className="text-destructive" data-testid="menu-reset-responses">Clear</DropdownMenuItem>}
                <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="menu-delete">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setShareOpen(true)} data-testid={`button-share-header-${survey.id}`} className="evalia-button-icon h-8 w-8">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-2">
        <p className="body-small line-clamp-1">{survey.description || generateSurveySummary(survey.questions)}</p>
      </div>

      {/* Metadata */}
      <div className="px-6 py-3 flex items-center justify-between">
        <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6A7789', fontWeight: 500, letterSpacing: '0.4px' }}>
          Created {new Date(survey.createdAt).toLocaleDateString()}
        </p>
        {survey.scoreConfig?.enabled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" style={{ backgroundColor: 'rgba(47, 143, 165, 0.08)', color: '#2F8FA5', borderColor: 'rgba(47, 143, 165, 0.3)', fontSize: '11px', padding: '4px 8px' }} className="gap-1 cursor-help" data-testid={`badge-scoring-${survey.id}`}>
                <Gauge className="w-2.5 h-2.5" />Scoring
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs">Scoring enabled</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Status */}
      {survey.publishedAt && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2">
            <span className="text-tertiary uppercase tracking-wider text-xs">Status:</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <StatusBadge status={survey.status} published={survey.publishedAt} />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">{survey.status === "Active" ? "Live and accepting" : survey.status === "Paused" ? "Paused" : "Closed"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 py-4 flex gap-8 flex-1">
        <div>
          <p className="text-tertiary uppercase tracking-wider text-xs font-semibold">Questions</p>
          <p className="text-2xl font-bold" data-testid="text-question-count">{survey.questionCount || 0}</p>
        </div>
        <div>
          <p className="text-tertiary uppercase tracking-wider text-xs font-semibold">Responses</p>
          <p className="text-2xl font-bold" data-testid="text-response-count">{survey.responseCount ?? 0}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 py-5 gap-3 flex flex-col mt-auto">
        <Button variant="outline" className="font-semibold" onClick={onEdit} data-testid={`button-edit-${index}`} style={{ color: '#2F8FA5' }}><Edit3 className="w-4 h-4 mr-2" />Edit</Button>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button onClick={onAnalyze} data-testid={`button-analyze-${index}`} disabled={survey.responseCount === 0} className="font-semibold" style={{ backgroundColor: survey.responseCount === 0 ? 'rgba(47, 143, 165, 0.15)' : '#2F8FA5', color: survey.responseCount === 0 ? '#2F8FA5' : '#FFF' }}>
              <BarChart3 className="w-4 h-4 mr-2" />Analyze
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{survey.responseCount === 0 ? "Collect responses first" : "View analytics"}</TooltipContent>
        </Tooltip>
      </div>

      {/* Template Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent data-testid="dialog-save-template">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>Create a reusable template</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input type="text" value={templateData.title} onChange={(e) => setTemplateData({...templateData, title: e.target.value})} placeholder="Template name" className="w-full px-3 py-2 border rounded-md text-sm" data-testid="input-template-title" />
            <textarea value={templateData.description} onChange={(e) => setTemplateData({...templateData, description: e.target.value})} placeholder="Description..." className="w-full px-3 py-2 border rounded-md text-sm resize-none" rows={3} data-testid="input-template-description" />
            <select value={templateData.category} onChange={(e) => setTemplateData({...templateData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" data-testid="select-template-category">
              <option>General</option><option>Training</option><option>Satisfaction</option><option>Assessment</option>
            </select>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setTemplateOpen(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={() => { if (templateData.title.trim() && onSaveAsTemplate) { onSaveAsTemplate(); setTemplateOpen(false); } }} style={{ backgroundColor: "#2F8FA5", color: "#FFF" }} className="flex-1" data-testid="button-confirm-save-template"><Save className="w-4 h-4 mr-2" />Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent data-testid="dialog-share">
          <DialogHeader>
            <DialogTitle>Share Survey</DialogTitle>
            <DialogDescription>Share with respondents</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <img src={qrUrl} alt="QR" className="w-48 h-48 p-3 bg-white rounded-lg border" data-testid="qr-code-image" />
              <Button onClick={() => { const link = document.createElement('a'); link.href = qrUrl.replace("200x200", "400x400"); link.download = `survey-${survey.id}-qr.png`; link.click(); }} variant="outline" className="w-full" data-testid="button-download-qr"><DownloadIcon className="w-4 h-4 mr-2" />QR</Button>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center"><span className="px-2 bg-background text-xs text-muted-foreground">or link</span></div></div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input type="text" value={brandUrl} readOnly className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm" data-testid="input-share-url" />
                <Button onClick={() => { navigator.clipboard.writeText(brandUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="outline" data-testid="button-copy-link">
                  {copied ? <><Check className="w-4 h-4 mr-2" />Copied</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Professional domain • Requires DNS setup</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default memo(SurveyCardComponent);
