import { motion } from "framer-motion";
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
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: delay ?? 0 }}
    >
      <SectionCard
        title="Weaknesses"
        icon={<AlertCircle size={16} className="text-coral" />}
        className="h-full"
      >
        <BulletList items={items} dotClass="bg-coral" />
      </SectionCard>
    </motion.div>
  );
}
