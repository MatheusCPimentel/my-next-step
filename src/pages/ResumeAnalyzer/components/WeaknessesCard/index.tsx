import { AlertCircle } from "lucide-react";
import { SectionCard } from "@/pages/ResumeAnalyzer/components/_shared/SectionCard";
import { BulletList } from "@/pages/ResumeAnalyzer/components/_shared/BulletList";

export function WeaknessesCard({
  items,
  delay,
}: {
  items: string[];
  delay?: number;
}) {
  return (
    <SectionCard
      title="Weaknesses"
      icon={<AlertCircle size={16} className="text-coral" />}
      delay={delay}
    >
      <BulletList items={items} dotClass="bg-coral" />
    </SectionCard>
  );
}
