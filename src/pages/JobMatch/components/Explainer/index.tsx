import { FeatureSteps } from "@/components/FeatureSteps";
import { ScoreBar } from "@/pages/JobMatch/components/ScoreBar";
import { SectionLabel } from "@/components/SectionLabel";

const EXTRAS = [
  { label: "Skills breakdown", dotClass: "bg-teal" },
  { label: "Environment signals", dotClass: "bg-amber" },
  { label: "Contract & salary", dotClass: "bg-muted" },
  { label: "Benefits", dotClass: "bg-muted" },
  { label: "Final verdict", dotClass: "bg-purple" },
];

export function Explainer() {
  return (
    <div className="flex flex-col gap-3">
      <FeatureSteps
        title="How it works"
        items={[
          {
            title: "Paste the job description",
            description:
              "Copy the full JD from any job board — LinkedIn, Greenhouse, Lever, anywhere.",
          },
          {
            title: "AI compares with your profile",
            description:
              "Your saved resume profile is matched against the required and nice-to-have skills.",
          },
          {
            title: "Get your scores and verdict",
            description:
              "See fit, environment, and opportunity scores with a final recommendation.",
          },
          {
            title: "Generate your fit statement",
            description:
              "After the analysis, generate a personalized answer to the Why are you a good fit? question — ready to paste into any application form.",
          },
        ]}
      />

      <div className="bg-overlay rounded-lg p-4 flex flex-col gap-3">
        <span className="text-sm font-medium text-primary">
          What you'll get
        </span>
        <SectionLabel>Example output</SectionLabel>
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
            barClass="bg-teal"
          />
        </div>
        <div className="h-px bg-border" />
        <ul className="flex flex-col gap-2">
          {EXTRAS.map((extra) => (
            <li key={extra.label} className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${extra.dotClass}`}
              />
              <span className="text-xs text-muted">{extra.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
