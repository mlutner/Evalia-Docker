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
    <div className="w-full mt-16 md:mt-20 mb-16 md:mb-20 overflow-x-auto">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 min-w-min px-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-stretch gap-1.5 sm:gap-3 md:gap-6 lg:gap-8">
            {/* Step Circle and Label */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                style={{
                  backgroundColor: currentStep >= step.number ? theme.colors.primary : 'var(--color-border)',
                  color: currentStep >= step.number ? '#FFFFFF' : theme.text.secondary,
                  transform: currentStep === step.number ? 'scale(1.1)' : 'scale(1)',
                }}
                className={`w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm md:text-lg transition-all duration-300 shadow-sm flex-shrink-0 relative z-10`}
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

            {/* Connector Line (hidden for last step) */}
            {index < steps.length - 1 && (
              <div className="flex items-start pt-1.5 sm:pt-2 md:pt-3 flex-1 min-w-12 sm:min-w-16 md:min-w-24">
                <div
                  style={{
                    backgroundColor: currentStep > step.number ? theme.colors.primary : 'var(--color-border)',
                  }}
                  className="h-1 w-full transition-all duration-300"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
