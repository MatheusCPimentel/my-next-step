import { ScoreBar } from "@/pages/JobMatch/components/ScoreBar";

const STEPS = [
  {
    title: "Paste the job description",
    body: "Copy the full JD from any job board — LinkedIn, Greenhouse, Lever, anywhere.",
  },
  {
    title: "AI compares with your profile",
    body: "Your saved resume profile is matched against the required and nice-to-have skills.",
  },
  {
    title: "Get your scores and verdict",
    body: "See fit, environment, and opportunity scores with a final recommendation.",
  },
];

export function Explainer() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-overlay rounded-lg p-4 flex flex-col gap-3">
        <span className="text-sm font-medium text-primary">How it works</span>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-purple/15 text-purple-soft text-xs font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-primary">{step.title}</span>
                <span className="text-xs text-muted leading-relaxed">
                  {step.body}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-overlay rounded-lg p-4 flex flex-col gap-3">
        <span className="text-sm font-medium text-primary">What you'll get</span>
        <span className="text-xs text-secondary uppercase tracking-widest">
          Example output
        </span>
        <div className="flex flex-col gap-3">
          <ScoreBar
            label="Opportunity score"
            sublabel="Worth applying?"
            value={72}
            barClass="bg-teal"
          />
          <ScoreBar
            label="Fit score"
            sublabel="Skills match"
            value={78}
            barClass="bg-teal"
          />
          <ScoreBar
            label="Environment"
            sublabel="How healthy is this place"
            value={65}
            barClass="bg-muted"
          />
        </div>
        <div className="h-px bg-border" />
        <span className="text-xs text-muted">
          + Skills breakdown, environment signals, contract details, benefits,
          and a final verdict.
        </span>
      </div>
    </div>
  );
}
