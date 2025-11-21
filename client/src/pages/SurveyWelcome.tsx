import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
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
      <main className="card text-[14px] pl-[40px] pr-[40px] pt-[40px] pb-[40px]" aria-labelledby="survey-title">
        {/* Logo mark */}
        <div className="logo-mark" data-testid="icon-survey-logo">
          <div className="logo-mark-icon"></div>
        </div>

        {/* Heading & subtitle */}
        <h1
          id="survey-title"
          data-testid="text-survey-title"
          className="font-semibold text-[36px]">
          {survey.title}
        </h1>
        <p className="subtitle" data-testid="text-survey-description">
          {survey.description}
        </p>

        {/* Illustration */}
        {illustrationImage && (
          <div className="illustration-wrapper ml-[10px] mr-[10px] pl-[10px] pr-[10px]">
            <img
              src={illustrationImage}
              alt="Survey illustration"
              className="illustration"
              data-testid="img-survey-illustration"
            />
          </div>
        )}

        {/* Benefits list */}
        <h2 className="section-heading text-[24px] font-extrabold" data-testid="text-what-youll-gain">
          What you'll gain:
        </h2>
        <ul className="benefits ml-[75px] mr-[75px]">
          {benefitPoints.map((point, idx) => (
            <li key={idx} data-testid={`text-benefit-${idx}`}>
              {point.trim()}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          size="lg"
          onClick={onStart}
          data-testid="button-start-survey"
          className="w-full max-w-md mx-auto block rounded-full mt-2 font-semibold py-4 text-[22px] ml-[55px] mr-[55px] pt-[7px] pb-[7px]"
        >
          Begin Self-Assessment
        </Button>
        <p className="helper-text" data-testid="text-helper">
          Fast, confidential, and designed for personal growth.
        </p>
      </main>
    </div>
  );
}
