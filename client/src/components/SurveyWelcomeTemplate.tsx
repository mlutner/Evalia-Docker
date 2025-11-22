import { useState } from "react";
import logoImage from "@assets/Untitled design (3)_1763764996441.png";
import { Clock, BookOpen, Shield, TrendingUp, ChevronDown } from "lucide-react";

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
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);
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
        <div className="flex justify-center gap-4 mb-[24px]" data-testid="quick-info-badges">
          {estimatedMinutes && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm" data-testid="badge-estimated-time">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">~{estimatedMinutes} min</span>
            </div>
          )}
          {questionCount && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm" data-testid="badge-question-count">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{questionCount} questions</span>
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

      {/* Privacy & Data Collapsible Section */}
      {(privacyStatement || dataUsageStatement) && (
        <div className="mx-[40px] mb-[16px] border border-border rounded-md" data-testid="privacy-data-section">
          <button
            onClick={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            data-testid="button-privacy-toggle"
            type="button"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Privacy & Data</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform ${isPrivacyExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          
          {isPrivacyExpanded && (
            <div className="px-4 py-3 border-t border-border bg-muted/20 space-y-3">
              {privacyStatement && (
                <div data-testid="privacy-statement-content">
                  <h4 className="text-xs font-semibold mb-1 text-foreground">Privacy</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{privacyStatement}</p>
                </div>
              )}
              {dataUsageStatement && (
                <div data-testid="data-usage-statement-content">
                  <h4 className="text-xs font-semibold mb-1 text-foreground">Data Usage</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{dataUsageStatement}</p>
                </div>
              )}
            </div>
          )}
        </div>
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
      <p className="survey-footnote text-center" data-testid="text-helper">
        Confidential and anonymous
      </p>
    </>
  );
}
