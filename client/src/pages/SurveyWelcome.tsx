import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import type { Survey } from "@shared/schema";
import logoImage from "@assets/Untitled design (3)_1763753515951.png";

interface SurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
  isLoading?: boolean;
  illustrationImage?: string;
}

export default function SurveyWelcome({
  survey,
  onStart,
  isLoading = false,
  illustrationImage,
}: SurveyWelcomeProps) {
  const benefitPoints = survey.welcomeMessage
    ? survey.welcomeMessage.split("\n").filter((line) => line.trim())
    : [
        "A snapshot of how others experience your leadership",
        "Insight into communication & decision styles",
        "A personalized style profile you can use immediately",
      ];

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
        {/* Logo and Title Section */}
        <div className="hero-header">
          {/* Logo mark */}
          <img 
            src={logoImage} 
            alt="Survey logo" 
            className="hero-logo"
            data-testid="icon-survey-logo"
          />

          {/* Heading */}
          <h1
            id="survey-title"
            data-testid="text-survey-title"
            className="hero-title">
            {survey.title}
          </h1>
          <p className="hero-subtitle" data-testid="text-survey-description">
            {survey.description}
          </p>
        </div>

        {/* Illustration */}
        {illustrationImage && (
          <div className="hero-illustration">
            <img
              src={illustrationImage}
              alt="Survey illustration"
              data-testid="img-survey-illustration"
            />
          </div>
        )}

        {/* Benefits list */}
        <h2 className="hero-section-title text-[20px]" data-testid="text-what-youll-gain">
          What you'll gain:
        </h2>
        <ul className="hero-benefits">
          {benefitPoints.map((point, idx) => (
            <li key={idx} data-testid={`text-benefit-${idx}`}>
              {point.trim()}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onStart}
          data-testid="button-start-survey"
          className="hero-button"
        >Begin Survey</button>
        <p className="hero-footnote" data-testid="text-helper">
          Fast, confidential, and designed for personal growth.
        </p>
      </main>
    </div>
  );
}
