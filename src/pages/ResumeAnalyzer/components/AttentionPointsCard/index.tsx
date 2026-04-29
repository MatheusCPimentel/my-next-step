import { AlertTriangle } from "lucide-react";
import { SectionCard } from "@/pages/ResumeAnalyzer/components/_shared/SectionCard";
import { BulletList } from "@/pages/ResumeAnalyzer/components/_shared/BulletList";

export function AttentionPointsCard({
  items,
  delay,
}: {
  items: string[];
  delay?: number;
}) {
  return (
    <SectionCard
      title="Attention points"
      icon={<AlertTriangle size={16} className="text-amber" />}
      delay={delay}
    >
      <BulletList items={items} dotClass="bg-amber" />
    </SectionCard>
  );
}
