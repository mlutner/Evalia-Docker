import { Loader2, AlertCircle } from "lucide-react";
import type { Survey } from "@shared/schema";
import logoImage from "@assets/Untitled design (3)_1763753515951.png";

interface SurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
  isLoading?: boolean;
  illustrationImage?: string;
  defaultIllustration?: string;
}

export default function SurveyWelcome({
  survey,
  onStart,
  isLoading = false,
  illustrationImage,
  defaultIllustration,
}: SurveyWelcomeProps) {
  // Use survey illustration if available, otherwise use passed prop or default
  const illustration = survey.illustrationUrl || illustrationImage || defaultIllustration;
  const purposePoints = survey.description
    ? survey.description.split("\n").filter((line) => line.trim())
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
      <main className="survey-card" aria-labelledby="survey-title">
        {/* Header Section */}
        <header className="survey-header">
          {/* Logo */}
          <div className="survey-logo">
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
            className="survey-title">
            {survey.title}
          </h1>
        </header>

        {/* Subtitle */}
        <p className="hero-subtitle" data-testid="text-survey-description">
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
          <h2 className="hero-section-title text-[20px]" data-testid="text-survey-purpose">The purpose of the survey:</h2>
          <ul className="hero-benefits">
            {purposePoints.map((point, idx) => (
              <li key={idx} data-testid={`text-purpose-${idx}`}>
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
            className="survey-primary"
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
