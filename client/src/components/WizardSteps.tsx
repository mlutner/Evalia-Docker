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
    <div className="w-full mb-12">
      <div className="flex items-center justify-center gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              style={{
                backgroundColor: currentStep >= step.number ? theme.colors.primary : 'var(--color-border)',
                color: currentStep >= step.number ? '#FFFFFF' : theme.text.secondary,
                transform: currentStep === step.number ? 'scale(1.15)' : 'scale(1)',
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 shadow-sm`}
              data-testid={`wizard-step-${step.number}`}
            >
              {currentStep > step.number ? (
                <Check className="w-7 h-7" />
              ) : (
                step.number
              )}
            </div>
            <div className="mt-4 text-center max-w-xs">
              <div
                className={`text-sm font-semibold transition-all ${
                  currentStep === step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
              {step.detailedDescription && (
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.detailedDescription}
                </div>
              )}
              {step.isOptional && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground mt-2">
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
