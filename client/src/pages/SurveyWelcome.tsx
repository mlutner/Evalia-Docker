import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Survey } from "@shared/schema";

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
    <div className="page">
      <main className="card" aria-labelledby="survey-title">
        {/* Logo mark */}
        <div className="logo-mark" data-testid="icon-survey-logo">
          <div className="logo-mark-icon"></div>
        </div>

        {/* Heading & subtitle */}
        <h1 id="survey-title" data-testid="text-survey-title">
          {survey.title}
        </h1>
        <p className="subtitle" data-testid="text-survey-description">
          {survey.description}
        </p>

        {/* Illustration */}
        {illustrationImage && (
          <div className="illustration-wrapper">
            <img
              src={illustrationImage}
              alt="Survey illustration"
              className="illustration"
              data-testid="img-survey-illustration"
            />
          </div>
        )}

        {/* Benefits list */}
        <h2 className="section-heading" data-testid="text-what-youll-gain">
          What you'll gain:
        </h2>
        <ul className="benefits">
          {benefitPoints.map((point, idx) => (
            <li key={idx} data-testid={`text-benefit-${idx}`}>
              {point.trim()}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="cta-button-wrapper">
          <Button
            size="lg"
            onClick={onStart}
            data-testid="button-start-survey"
            className="w-full max-w-md mx-auto block rounded-full font-semibold py-3 text-lg"
            style={{
              backgroundColor: "#0A1F32",
              color: "#CCFF00",
              height: "54px",
              borderRadius: "28px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#112A45";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0A1F32";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Begin Self-Assessment
          </Button>
        </div>
        <p className="helper-text" data-testid="text-helper">
          Fast, confidential, and designed for personal growth.
        </p>
      </main>
    </div>
  );
}
