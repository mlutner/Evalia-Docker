import { Check } from "lucide-react";
import { theme } from "@/theme";

interface WizardStepsProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    description: string;
    isOptional?: boolean;
  }[];
}

export default function WizardSteps({ currentStep, steps }: WizardStepsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center">
                  <div
                    style={{
                      backgroundColor: currentStep >= step.number ? theme.colors.primary : 'var(--color-border)',
                      color: currentStep >= step.number ? '#FFFFFF' : theme.text.secondary,
                      transform: currentStep === step.number ? 'scale(1.1)' : 'scale(1)',
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 shadow-sm`}
                    data-testid={`wizard-step-${step.number}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      style={{
                        backgroundColor: currentStep > step.number ? theme.colors.primary : 'var(--color-border)',
                      }}
                      className={`h-full transition-all`}
                    />
                  </div>
                )}
              </div>
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`text-base font-semibold transition-all ${
                      currentStep === step.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.isOptional && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Optional
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-1 hidden sm:block ${
                  currentStep === step.number
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70"
                }`}>
                  {step.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
