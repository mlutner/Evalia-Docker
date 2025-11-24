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
    <div className="w-full mt-16 md:mt-20 mb-16 md:mb-20 overflow-x-auto px-2">
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-w-min">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isUpcoming = currentStep < step.number;
          
          return (
            <div key={step.number} className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  style={{
                    backgroundColor: currentStep >= step.number 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--muted))',
                    color: currentStep >= step.number ? '#FFFFFF' : 'hsl(var(--muted-foreground))',
                    transform: isActive ? 'scale(1.15)' : isCompleted ? 'scale(1)' : 'scale(0.95)',
                    boxShadow: isActive 
                      ? '0 0 0 4px rgba(47, 143, 165, 0.15)' 
                      : 'none',
                  }}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-sm md:text-xl transition-all duration-500 flex-shrink-0 relative z-10 ${
                    isActive ? 'shadow-lg' : 'shadow-md'
                  }`}
                  data-testid={`wizard-step-${step.number}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 md:w-7 h-5 md:h-7 animate-in zoom-in duration-300" strokeWidth={3} />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-3 md:mt-4 text-center max-w-28 md:max-w-xs">
                  <div
                    className={`text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 line-clamp-2 ${
                      isActive
                        ? "text-foreground"
                        : isCompleted
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.detailedDescription && (
                    <div className={`text-xs mt-0.5 sm:mt-1 leading-tight hidden sm:block line-clamp-2 transition-all duration-300 ${
                      isActive
                        ? "text-foreground/60"
                        : "text-muted-foreground/60"
                    }`}>
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
                <div className="flex items-center flex-1 min-w-8 sm:min-w-12 md:min-w-16 -mx-1 sm:-mx-1.5 md:-mx-2">
                  <div
                    style={{
                      backgroundColor: currentStep > step.number 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--muted))',
                    }}
                    className="h-2 w-full transition-all duration-500 rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
