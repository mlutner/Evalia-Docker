import { useState } from "react";
import { Clock, Books, ShieldCheckered } from "phosphor-react";
import { theme } from "@/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { stripMarkdownLines } from "@/lib/markdownUtils";

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
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-teal-50/80 rounded-full text-xs leading-none border border-teal-200 hover-elevate transition-all" data-testid={testId}>
    <Icon weight="bold" size={14} className="text-teal-600" />
    <span className="font-semibold text-teal-900 text-[12px]">{label}</span>
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
    <div className="flex justify-center gap-3 mb-6 flex-wrap" data-testid="quick-info-badges">
      {estimatedMinutes && (
        <QuickInfoBadge icon={Clock} label={`~${estimatedMinutes} min`} testId="badge-estimated-time" />
      )}
      {questionCount && (
        <QuickInfoBadge icon={Books} label={`${questionCount} questions`} testId="badge-question-count" />
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
  const cleanedMessage = stripMarkdownLines(welcomeMessage || "");
  const purposePoints = cleanedMessage
    ? cleanedMessage.split("\n").filter((line) => line.trim())
    : [];

  if (purposePoints.length === 0) return null;

  return (
    <div className="mt-10 animate-fade-in">
      <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2" data-testid="text-survey-purpose">
        <span className="inline-block w-1 h-1 bg-teal-600 rounded-full"></span>
        Survey purpose
      </h2>
      <ul className="space-y-3">
        {purposePoints.map((point, idx) => (
          <li key={idx} data-testid={`text-purpose-${idx}`} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
            <span className="text-teal-600 font-bold mt-0.5 flex-shrink-0">✓</span>
            <span>{point.trim()}</span>
          </li>
        ))}
      </ul>
    </div>
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
            <ShieldCheckered weight="bold" size={16} className="text-teal-600" />
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
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors cursor-pointer"
      data-testid="button-privacy-link"
      type="button"
    >
      <ShieldCheckered weight="bold" size={14} className="text-gray-400" />
      Privacy & Data
    </button>
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
      {/* Main Content Card */}
      <div className="animate-fade-in">
        {/* Header */}
        <header className="mb-8 pt-6 pb-2">
          <h1
            id="survey-title"
            data-testid="text-survey-title"
            className="text-center text-4xl font-bold text-gray-900 tracking-tight mb-4"
          >
            {title}
          </h1>
        </header>

        {/* Quick Info Badges */}
        <div className="mb-8">
          <QuickInfoBadges estimatedMinutes={estimatedMinutes} questionCount={questionCount} />
        </div>

        {/* Description */}
        {description && (
          <div className="mb-10 px-6">
            <p 
              className="text-center text-base text-gray-600 leading-relaxed max-w-2xl mx-auto" 
              data-testid="text-survey-description"
            >
              {description}
            </p>
          </div>
        )}

        {/* Visual Divider */}
        {(illustration || welcomeMessage) && (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8"></div>
        )}

        {/* Body */}
        <div className="px-6">
          {illustration && (
            <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <img
                src={illustration}
                alt="Survey illustration"
                data-testid="img-survey-illustration"
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}
          <PurposeList welcomeMessage={welcomeMessage} />
        </div>

        {/* Footer Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <footer className="flex flex-col items-center gap-8">
            {/* Primary CTA Button */}
            <button
              onClick={onStart}
              data-testid="button-start-survey"
              className="px-8 py-3.5 rounded-lg font-semibold text-white shadow-md hover:shadow-lg hover-elevate active-elevate-2 transition-all duration-200"
              type="button"
              style={{
                backgroundColor: theme.colors.primaryHex,
              }}
            >
              Begin Survey
            </button>

            {/* Privacy Link */}
            <PrivacyDataLink
              onClick={() => setIsPrivacyModalOpen(true)}
              privacyStatement={privacyStatement}
              dataUsageStatement={dataUsageStatement}
            />
          </footer>
        </div>
      </div>

      {/* Modal */}
      <PrivacyDataModal
        open={isPrivacyModalOpen}
        onOpenChange={setIsPrivacyModalOpen}
        privacyStatement={privacyStatement}
        dataUsageStatement={dataUsageStatement}
      />
    </>
  );
}
