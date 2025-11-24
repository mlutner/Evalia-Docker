import { Check } from "lucide-react";
import { theme } from "@/theme";

interface WizardStepsProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    description: string;
    detailedDescription?: string;
    isOptional?: boolean;
  }[];
}

export default function WizardSteps({ currentStep, steps }: WizardStepsProps) {
  return (
    <div className="w-full mb-8 md:mb-12 overflow-x-auto">
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-6 lg:gap-8 min-w-min px-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center flex-shrink-0">
            <div
              style={{
                backgroundColor: currentStep >= step.number ? theme.colors.primary : 'var(--color-border)',
                color: currentStep >= step.number ? '#FFFFFF' : theme.text.secondary,
                transform: currentStep === step.number ? 'scale(1.1)' : 'scale(1)',
              }}
              className={`w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm md:text-lg transition-all duration-300 shadow-sm flex-shrink-0`}
              data-testid={`wizard-step-${step.number}`}
            >
              {currentStep > step.number ? (
                <Check className="w-4 sm:w-5 md:w-7 h-4 sm:h-5 md:h-7" />
              ) : (
                step.number
              )}
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4 text-center max-w-24 sm:max-w-32 md:max-w-xs">
              <div
                className={`text-xs sm:text-sm md:text-sm font-semibold transition-all line-clamp-2 ${
                  currentStep === step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
              {step.detailedDescription && (
                <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight hidden sm:block line-clamp-2">
                  {step.detailedDescription}
                </div>
              )}
              {step.isOptional && (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground mt-1 inline-block text-center">
                  Optional
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
