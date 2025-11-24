import { useState } from "react";
import { Clock, BookOpen, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// Badge component for time and question count
const QuickInfoBadge = ({ 
  icon: Icon, 
  label, 
  testId 
}: { 
  icon: typeof Clock; 
  label: string; 
  testId: string;
}) => (
  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded-full text-xs leading-none" data-testid={testId}>
    <Icon className="w-2.5 h-2.5 text-muted-foreground" />
    <span className="font-medium text-foreground text-[11px]">{label}</span>
  </div>
);

// Quick info badges section
const QuickInfoBadges = ({ 
  estimatedMinutes, 
  questionCount 
}: { 
  estimatedMinutes?: number; 
  questionCount?: number;
}) => {
  if (!estimatedMinutes && !questionCount) return null;
  
  return (
    <div className="flex justify-center gap-1.5 mb-[12px]" data-testid="quick-info-badges">
      {estimatedMinutes && (
        <QuickInfoBadge icon={Clock} label={`~${estimatedMinutes} min`} testId="badge-estimated-time" />
      )}
      {questionCount && (
        <QuickInfoBadge icon={BookOpen} label={`${questionCount}`} testId="badge-question-count" />
      )}
    </div>
  );
};

// Purpose list section
const PurposeList = ({ 
  welcomeMessage 
}: { 
  welcomeMessage?: string | null;
}) => {
  const purposePoints = welcomeMessage
    ? welcomeMessage.split("\n").filter((line) => line.trim())
    : [];

  if (purposePoints.length === 0) return null;

  return (
    <>
      <h2 className="hero-section-title" data-testid="text-survey-purpose">The purpose of the survey:</h2>
      <ul className="hero-benefits">
        {purposePoints.map((point, idx) => (
          <li key={idx} data-testid={`text-purpose-${idx}`}>
            {point.trim()}
          </li>
        ))}
      </ul>
    </>
  );
};

// Privacy & Data Modal
const PrivacyDataModal = ({
  open,
  onOpenChange,
  privacyStatement,
  dataUsageStatement,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  privacyStatement?: string;
  dataUsageStatement?: string;
}) => {
  if (!privacyStatement && !dataUsageStatement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
};

// Privacy & Data link button
const PrivacyDataLink = ({
  onClick,
  privacyStatement,
  dataUsageStatement,
}: {
  onClick: () => void;
  privacyStatement?: string;
  dataUsageStatement?: string;
}) => {
  if (!privacyStatement && !dataUsageStatement) return null;

  return (
    <div className="text-center mt-[12px]">
      <button
        onClick={onClick}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer"
        data-testid="button-privacy-link"
        type="button"
      >
        Privacy & Data
      </button>
    </div>
  );
};

// Main component
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

  return (
    <>
      {/* Header */}
      <header className="survey-header mt-[0px] mb-[0px] pt-[29px] pb-[16px]">
        <h1
          id="survey-title"
          data-testid="text-survey-title"
          className="survey-title text-center text-[40px]"
        >
          {title}
        </h1>
      </header>

      {/* Quick Info */}
      <QuickInfoBadges estimatedMinutes={estimatedMinutes} questionCount={questionCount} />

      {/* Description */}
      {description && (
        <p className="hero-subtitle ml-[40px] mr-[40px] mt-[0px] mb-[0px] text-[14px]" data-testid="text-survey-description">
          {description}
        </p>
      )}

      {/* Body */}
      <div className="survey-body">
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
        <PurposeList welcomeMessage={welcomeMessage} />
      </div>

      {/* Modal and Link */}
      <PrivacyDataModal
        open={isPrivacyModalOpen}
        onOpenChange={setIsPrivacyModalOpen}
        privacyStatement={privacyStatement}
        dataUsageStatement={dataUsageStatement}
      />

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

      {/* Privacy Link */}
      <PrivacyDataLink
        onClick={() => setIsPrivacyModalOpen(true)}
        privacyStatement={privacyStatement}
        dataUsageStatement={dataUsageStatement}
      />
    </>
  );
}
