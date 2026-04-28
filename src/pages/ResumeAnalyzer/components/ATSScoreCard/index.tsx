import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { SectionCard } from "@/pages/ResumeAnalyzer/components/_shared/SectionCard";

export function ATSScoreCard({
  score,
  label,
  description,
  delay,
}: {
  score: number;
  label: string;
  description: string;
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
        title="ATS score"
        icon={<Activity size={16} className="text-purple-mid" />}
        className="h-full"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-medium text-purple-mid">{score}</span>
          <span className="text-lg text-secondary">/ 100</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-purple/10 text-purple-mid">
            {label}
          </span>
        </div>
        <div className="h-2 rounded-full bg-overlay overflow-hidden">
          <div
            className="h-full bg-purple rounded-full"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-sm text-secondary leading-relaxed">{description}</p>
      </SectionCard>
    </motion.div>
  );
}
