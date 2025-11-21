import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, BarChart3, Download, Share2, Check, Copy, Edit3, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export interface Survey {
  id: string;
  title: string;
  createdAt: string;
  responseCount: number;
  questionCount: number;
}

interface SurveyCardProps {
  survey: Survey;
  onEdit: () => void;
  onView: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  onDelete: () => void;
  onManageRespondents?: () => void;
  onShare?: () => void;
  index?: number;
}

export default function SurveyCard({ survey, onEdit, onView, onAnalyze, onExport, onDelete, onManageRespondents, index = 0 }: SurveyCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const shareUrl = `${window.location.origin}/survey/${survey.id}`;
  
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
            <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="menu-delete">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex-1">
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
              Share this link with people to collect responses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              Anyone with this link can submit a response to your survey.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
