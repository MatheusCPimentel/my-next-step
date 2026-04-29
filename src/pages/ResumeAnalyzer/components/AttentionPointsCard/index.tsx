import { motion } from "framer-motion";
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
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: delay ?? 0 }}
    >
      <SectionCard
        title="Attention points"
        icon={<AlertTriangle size={16} className="text-amber" />}
        className="h-full"
      >
        <BulletList items={items} dotClass="bg-amber" />
      </SectionCard>
    </motion.div>
  );
}
