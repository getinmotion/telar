import { WIZARD_STEPS, type WizardStep } from './types';

interface WizardStepperProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  completedSteps: Set<number>;
}

export function WizardStepper({ currentStep, onStepClick, completedSteps }: WizardStepperProps) {
  return (
    <nav className="flex items-center gap-1 w-full max-w-2xl mx-auto mb-16">
      {WIZARD_STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.has(step.id);
        const isClickable = isCompleted || step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex flex-col items-center w-full group transition-all ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tracking-wider transition-all ${
                  isActive
                    ? 'bg-charcoal text-white'
                    : isCompleted
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'border border-charcoal/15 text-charcoal/30'
                }`}
              >
                {isCompleted && !isActive ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  step.id + 1
                )}
              </div>
              <span
                className={`mt-2 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${
                  isActive
                    ? 'text-charcoal'
                    : isCompleted
                    ? 'text-primary/70'
                    : 'text-charcoal/25'
                }`}
              >
                {step.label}
              </span>
              <span
                className={`text-[9px] transition-colors ${
                  isActive ? 'text-charcoal/50' : 'text-charcoal/20'
                }`}
              >
                {step.sublabel}
              </span>
            </button>
            {idx < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 mt-[-20px] transition-colors ${
                  isCompleted ? 'bg-primary/30' : 'bg-charcoal/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
