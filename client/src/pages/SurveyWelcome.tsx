import { Loader2, X } from "lucide-react";
import type { Survey } from "@shared/schema";
import SurveyWelcomeTemplate from "@/components/SurveyWelcomeTemplate";

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
        {/* Exit Button */}
        {onBack && (
          <button
            onClick={onBack}
            data-testid="button-exit-survey"
            className="survey-back-button"
            type="button"
            aria-label="Exit survey"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <SurveyWelcomeTemplate
          title="Training Check-in"
          description={survey.description ?? undefined}
          illustration={illustration}
          welcomeMessage={survey.welcomeMessage ?? undefined}
          onStart={onStart}
          estimatedMinutes={survey.estimatedMinutes ?? undefined}
          questionCount={survey.questions?.length || 0}
          privacyStatement={survey.privacyStatement ?? undefined}
          dataUsageStatement={survey.dataUsageStatement ?? undefined}
        />
      </main>
    </div>
  );
}
