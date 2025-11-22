import { useState } from "react";
import logoImage from "@assets/Untitled design (3)_1763764996441.png";
import { Clock, BookOpen, Shield, TrendingUp, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface SurveyWelcomeTemplateProps {
  title: string;
  description?: string | null;
  illustration?: string;
  welcomeMessage?: string | null;
  onStart: () => void;
  estimatedMinutes?: number;
  questionCount?: number;
  privacyStatement?: string;
  dataUsageStatement?: string;
}

export default function SurveyWelcomeTemplate({
  title,
  description,
  illustration,
  welcomeMessage,
  onStart,
  estimatedMinutes,
  questionCount,
  privacyStatement,
  dataUsageStatement,
}: SurveyWelcomeTemplateProps) {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const purposePoints = welcomeMessage
    ? welcomeMessage.split("\n").filter((line) => line.trim())
    : [];

  return (
    <>
      {/* Header Section */}
      <header className="survey-header mt-[0px] mb-[0px] pt-[29px] pb-[16px]">
        {/* Logo */}
        <img 
          src={logoImage} 
          alt="Survey logo" 
          data-testid="icon-survey-logo"
          className="survey-logo-img"
        />
        {/* Title */}
        <h1
          id="survey-title"
          data-testid="text-survey-title"
          className="survey-title text-center text-[40px]">
          {title}
        </h1>
      </header>

      {/* Quick Info Badges */}
      {(estimatedMinutes || questionCount) && (
        <div className="flex justify-center gap-1.5 mb-[12px]" data-testid="quick-info-badges">
          {estimatedMinutes && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded-full text-xs leading-none" data-testid="badge-estimated-time">
              <Clock className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="font-medium text-foreground text-[11px]">~{estimatedMinutes} min</span>
            </div>
          )}
          {questionCount && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded-full text-xs leading-none" data-testid="badge-question-count">
              <BookOpen className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="font-medium text-foreground text-[11px]">{questionCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Subtitle */}
      {description && (
        <p className="hero-subtitle ml-[40px] mr-[40px] mt-[0px] mb-[0px] text-[14px]" data-testid="text-survey-description">
          {description}
        </p>
      )}

      {/* Body */}
      <div className="survey-body">
        {/* Illustration */}
        {illustration && (
          <div className="hero-illustration">
            <img
              src={illustration}
              alt="Survey illustration"
              data-testid="img-survey-illustration"
              className="mt-[10px] mb-[10px]"
            />
          </div>
        )}

        {/* Purpose list */}
        {purposePoints.length > 0 && (
          <>
            <h2 className="hero-section-title" data-testid="text-survey-purpose">The purpose of the survey:</h2>
            <ul className="hero-benefits">
              {purposePoints.map((point, idx) => (
                <li
                  key={idx}
                  data-testid={`text-purpose-${idx}`}>
                  {point.trim()}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Privacy & Data Modal */}
      {(privacyStatement || dataUsageStatement) && (
        <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
          <DialogContent className="max-w-md" data-testid="privacy-data-modal">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy & Data
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {privacyStatement && (
                <div data-testid="privacy-statement-content">
                  <h4 className="text-sm font-semibold mb-2 text-foreground">Privacy</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{privacyStatement}</p>
                </div>
              )}
              {dataUsageStatement && (
                <div data-testid="data-usage-statement-content">
                  <h4 className="text-sm font-semibold mb-2 text-foreground">Data Usage</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{dataUsageStatement}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="survey-footer" style={{ justifyContent: 'center' }}>
        <button
          onClick={onStart}
          data-testid="button-start-survey"
          className="survey-primary mt-[10px] mb-[10px] pt-[10px] pb-[10px]"
          type="button"
        >
          Begin Survey
        </button>
      </footer>

      {/* Privacy & Data Link */}
      {(privacyStatement || dataUsageStatement) && (
        <div className="text-center mt-[12px]">
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer"
            data-testid="button-privacy-link"
            type="button"
          >
            Privacy & Data
          </button>
        </div>
      )}
    </>
  );
}
