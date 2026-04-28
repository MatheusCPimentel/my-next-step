import { motion } from "framer-motion";
import { AIVerdictCard } from "@/components/AIVerdictCard";
import { cn } from "@/lib/utils";

export function AIResumeVerdictCard({
  verdict,
  delay,
  className,
}: {
  verdict: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("h-full", className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: delay ?? 0 }}
    >
      <AIVerdictCard title="AI Resume Verdict" verdict={verdict} />
    </motion.div>
  );
}
