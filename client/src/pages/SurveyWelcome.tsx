import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type { Survey } from "@shared/schema";
import logoImage from "@assets/Untitled design (3)_1763762102562.png";

interface SurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  illustrationImage?: string;
  defaultIllustration?: string;
}

export default function SurveyWelcome({
  survey,
  onStart,
  onBack,
  isLoading = false,
  illustrationImage,
  defaultIllustration,
}: SurveyWelcomeProps) {
  // Use survey illustration if available, otherwise use passed prop or default
  let illustration = survey.illustrationUrl || illustrationImage || defaultIllustration;
  // Fix old paths that use /assets/ instead of /attached_assets/
  if (illustration && illustration.startsWith('/assets/')) {
    illustration = illustration.replace('/assets/', '/attached_assets/');
  }
  const purposePoints = survey.welcomeMessage
    ? survey.welcomeMessage.split("\n").filter((line) => line.trim())
    : [];

  if (isLoading) {
    return (
      <div className="page">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg">Loading survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-shell">
      <main className="survey-card pl-[45px] pr-[45px]" aria-labelledby="survey-title">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            data-testid="button-back-survey"
            className="survey-back-button"
            type="button"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {/* Header Section */}
        <header className="survey-header mt-[0px] mb-[0px] pt-[29px] pb-[29px]">
          {/* Logo */}
          <div className="survey-logo mt-[0px] mb-[0px] ml-[0px] mr-[0px] bg-[#ffffff] pl-[0px] pr-[0px] pt-[0px] pb-[0px]">
            <img 
              src={logoImage} 
              alt="Survey logo" 
              data-testid="icon-survey-logo"
            />
          </div>
          {/* Title */}
          <h1
            id="survey-title"
            data-testid="text-survey-title"
            className="survey-title text-center text-[40px]">
            Training Check-in
          </h1>
        </header>

        {/* Subtitle */}
        <p className="hero-subtitle ml-[40px] mr-[40px] mt-[15px] mb-[15px] text-[13px]" data-testid="text-survey-description">
          {survey.description}
        </p>

        {/* Body */}
        <div className="survey-body">
          {/* Illustration */}
          {illustration && (
            <div className="hero-illustration">
              <img
                src={illustration}
                alt="Survey illustration"
                data-testid="img-survey-illustration"
              />
            </div>
          )}

          {/* Purpose list */}
          <h2 className="hero-section-title" data-testid="text-survey-purpose">The purpose of the survey:</h2>
          <ul className="hero-benefits">
            {purposePoints.map((point, idx) => (
              <li
                key={idx}
                data-testid={`text-purpose-${idx}`}
                className="mt-[3px] mb-[3px]">
                {point.trim()}
              </li>
            ))}
          </ul>
        </div>

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
        <p className="survey-footnote" data-testid="text-helper">
          Fast, confidential, and designed for personal growth.
        </p>
      </main>
    </div>
  );
}
