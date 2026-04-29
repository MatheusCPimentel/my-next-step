import { Sparkles } from "lucide-react";
import { SectionCard } from "@/pages/ResumeAnalyzer/components/_shared/SectionCard";

export function TopSkillsCard({
  skills,
  delay,
}: {
  skills: Array<{ name: string; level: number }>;
  delay?: number;
}) {
  return (
    <SectionCard
      title="Top skills"
      icon={<Sparkles size={16} className="text-purple-mid" />}
      delay={delay}
    >
      <ul className="flex flex-col gap-3">
        {skills.map((skill) => (
          <li key={skill.name} className="flex items-center gap-3">
            <span className="text-sm text-primary w-32 shrink-0">
              {skill.name}
            </span>
            <span className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <span
                className="block h-full bg-purple rounded-full"
                style={{ width: `${skill.level}%` }}
              />
            </span>
            <span className="text-xs text-muted text-right w-10 shrink-0">
              {skill.level}%
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
