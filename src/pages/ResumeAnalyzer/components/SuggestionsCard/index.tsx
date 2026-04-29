import { Plus } from "lucide-react";
import { SectionCard } from "@/pages/ResumeAnalyzer/components/_shared/SectionCard";

export function SuggestionsCard({
  items,
  delay,
}: {
  items: string[];
  delay?: number;
}) {
  return (
    <SectionCard
      title="Suggestions"
      icon={<Plus size={16} className="text-purple" />}
      delay={delay}
    >
      <ol className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="w-5 h-5 shrink-0 rounded-full bg-purple/15 text-purple-soft text-xs flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-sm text-secondary leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
