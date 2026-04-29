import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeAnalyzerGateProps {
  onBypass: () => void;
  onAnalyzeResume: () => void;
  onSkip: () => void;
}

export function ResumeAnalyzerGate({
  onBypass,
  onAnalyzeResume,
  onSkip,
}: ResumeAnalyzerGateProps) {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-background/60 flex items-center justify-center px-3">
      <button
        type="button"
        onClick={onBypass}
        className="absolute top-4 left-4 text-xs text-muted hover:text-primary transition-colors"
      >
        Dev: bypass gate
      </button>
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 max-w-sm text-center">
        <Lock size={32} className="text-muted mb-4 mx-auto" />
        <h2 className="text-lg font-medium text-primary">
          Analyze your resume first
        </h2>
        <p className="text-sm text-secondary mt-2">
          To get accurate job match results, we need to understand your profile
          first. Complete the Resume Analyzer and we'll take care of the rest.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button variant="default" onClick={onAnalyzeResume}>
            Analyze my resume
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-sm text-muted border-0"
          >
            I'll do this later
          </Button>
        </div>
      </div>
    </div>
  );
}
