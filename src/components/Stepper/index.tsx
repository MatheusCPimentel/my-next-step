import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  steps: Array<{ label: string }>;
  currentStep: number;
  onClick?: (step: number) => void;
};

export function Stepper({ steps, currentStep, onClick }: StepperProps) {
  return (
    <div className="w-full flex items-start">
      {steps.map((step, idx) => {
        const num = idx + 1;
        const completed = num < currentStep;
        const active = num === currentStep;
        const interactive = completed && Boolean(onClick);
        const circleClass = cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          completed && "bg-teal/20 text-teal",
          active && "bg-purple text-primary",
          !completed && !active && "bg-overlay text-muted border border-border",
          interactive && "cursor-pointer hover:bg-teal/30 transition-colors",
        );
        return (
          <Fragment key={step.label}>
            <div className="flex flex-col items-center min-w-[80px]">
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onClick!(num)}
                  className={circleClass}
                >
                  <Check size={14} />
                </button>
              ) : (
                <div className={circleClass}>
                  {completed ? <Check size={14} /> : num}
                </div>
              )}
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  active ? "text-primary" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 mt-4",
                  completed ? "bg-teal" : "bg-border",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
