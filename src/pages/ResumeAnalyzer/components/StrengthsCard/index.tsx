import { CheckCircle } from "lucide-react";
import { SectionCard } from "@/pages/ResumeAnalyzer/components/_shared/SectionCard";
import { BulletList } from "@/pages/ResumeAnalyzer/components/_shared/BulletList";

export function StrengthsCard({
  items,
  delay,
}: {
  items: string[];
  delay?: number;
}) {
  return (
    <SectionCard
      title="Strengths"
      icon={<CheckCircle size={16} className="text-teal" />}
      delay={delay}
    >
      <BulletList items={items} dotClass="bg-teal" />
    </SectionCard>
  );
}
