import type { ReactNode } from "react";
import { fitScoreClasses } from "@/lib/fitScore";
import { ScoreBar } from "@/pages/JobMatch/components/ScoreBar";

interface ScoreCardProps {
  opportunityScore: number;
  fitScore: number;
  environmentScore: number | null | undefined;
  opportunityDescription: string;
  finalVerdict: string;
  actions?: ReactNode;
}

function opportunityLabel(score: number): string {
  if (score < 50) return "Not worth applying";
  if (score < 60) return "Borderline";
  if (score < 70) return "Partial opportunity";
  if (score < 80) return "Good opportunity";
  return "Excellent opportunity";
}

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ScoreCard({
  opportunityScore,
  fitScore,
  environmentScore,
  opportunityDescription,
  finalVerdict,
  actions,
}: ScoreCardProps) {
  const opportunity = fitScoreClasses(opportunityScore);
  const ringOffset = RING_CIRCUMFERENCE * (1 - opportunityScore / 100);
  const showEnvironment = typeof environmentScore === "number";

  return (
    <div className="bg-overlay rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className={`relative w-20 h-20 shrink-0 ${opportunity.text}`}>
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-medium text-primary leading-none">
              {opportunityScore}
            </span>
            <span className="text-[10px] text-muted mt-0.5">/ 100</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <span className="text-xs uppercase tracking-widest text-muted">
            Opportunity score
          </span>
          <span
            className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs ${opportunity.badge}`}
          >
            {opportunityLabel(opportunityScore)}
          </span>
          <p className="text-xs text-muted leading-relaxed">
            {opportunityDescription}
          </p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3">
        <ScoreBar label="Fit score" sublabel="Skills match" value={fitScore} barClass="bg-teal" />
        {showEnvironment && (
          <ScoreBar label="Environment" sublabel="How healthy is this place" value={environmentScore} barClass="bg-muted" />
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-widest text-muted">
          Final verdict
        </span>
        <p className="text-sm text-secondary leading-relaxed">{finalVerdict}</p>
      </div>
    </div>
  );
}
