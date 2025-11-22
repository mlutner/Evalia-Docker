import logoImage from "@assets/Untitled design (3)_1763764996441.png";
import { Clock, BookOpen, Shield, TrendingUp } from "lucide-react";

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
  const purposePoints = welcomeMessage
    ? welcomeMessage.split("\n").filter((line) => line.trim())
    : [];

  return (
    <>
      {/* Header Section */}
      <header className="survey-header mt-[0px] mb-[0px] pt-[29px] pb-[29px]">
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

      {/* Survey Metadata Bar */}
      {(estimatedMinutes || questionCount || privacyStatement || dataUsageStatement) && (
        <div className="px-[40px] py-[16px] bg-muted/40 border-t border-border mb-[12px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {estimatedMinutes && (
              <div className="flex flex-col items-center gap-1" data-testid="metadata-estimated-time">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">~{estimatedMinutes} min</span>
              </div>
            )}
            {questionCount && (
              <div className="flex flex-col items-center gap-1" data-testid="metadata-question-count">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{questionCount} questions</span>
              </div>
            )}
            {privacyStatement && (
              <div className="flex flex-col items-center gap-1" data-testid="metadata-privacy">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate" title={privacyStatement}>Confidential</span>
              </div>
            )}
            {dataUsageStatement && (
              <div className="flex flex-col items-center gap-1" data-testid="metadata-data-usage">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate" title={dataUsageStatement}>Data insights</span>
              </div>
            )}
          </div>
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
        {privacyStatement || "Confidential and anonymous"}
      </p>
    </>
  );
}
