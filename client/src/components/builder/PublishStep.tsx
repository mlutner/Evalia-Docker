import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface PublishStepProps {
  title: string;
  description: string;
  welcomeMessage: string;
  thankYouMessage: string;
  generatingField: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onWelcomeChange: (value: string) => void;
  onThankYouChange: (value: string) => void;
  onGenerateText: (fieldType: "description" | "welcomeMessage" | "thankYouMessage") => void;
}

export default function PublishStep({
  title,
  description,
  welcomeMessage,
  thankYouMessage,
  generatingField,
  onTitleChange,
  onDescriptionChange,
  onWelcomeChange,
  onThankYouChange,
  onGenerateText,
}: PublishStepProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold mb-3">Finalize Your Survey</h2>
        <p className="text-muted-foreground text-lg">
          Add details to make your survey shine
        </p>
      </div>

      <div className="space-y-6 bg-card border rounded-lg p-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Survey Title <span className="text-destructive">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`text-base ${!title.trim() ? 'border-destructive' : ''}`}
            placeholder="Enter a clear, descriptive title..."
            data-testid="input-survey-title"
          />
          {!title.trim() && (
            <p className="text-xs text-destructive mt-1">
              Title is required to publish your survey
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Description</label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onGenerateText("description")}
              disabled={generatingField !== null}
              data-testid="button-ai-description"
              className="text-xs h-7"
            >
              {generatingField === "description" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Suggest
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="text-sm resize-none"
            placeholder="Brief description of what this survey is about (optional)"
            rows={3}
            data-testid="input-survey-description"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Appears under the title on the welcome screen
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Welcome Message</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGenerateText("welcomeMessage")}
                disabled={generatingField !== null}
                data-testid="button-ai-welcome"
                className="text-xs h-7"
              >
                {generatingField === "welcomeMessage" ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => onWelcomeChange(e.target.value)}
              className="text-sm resize-none"
              placeholder="Greet your respondents (optional)"
              rows={3}
              data-testid="input-welcome-message"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shown on the welcome screen before questions
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Thank You Message</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGenerateText("thankYouMessage")}
                disabled={generatingField !== null}
                data-testid="button-ai-thankyou"
                className="text-xs h-7"
              >
                {generatingField === "thankYouMessage" ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={thankYouMessage}
              onChange={(e) => onThankYouChange(e.target.value)}
              className="text-sm resize-none"
              placeholder="Thank respondents for their time (optional)"
              rows={3}
              data-testid="input-thank-you-message"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shown after survey completion
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          Ready to share? Click "Save & Publish" below to make your survey live!
        </p>
      </div>
    </div>
  );
}
