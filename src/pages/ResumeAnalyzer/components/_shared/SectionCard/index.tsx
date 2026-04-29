import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
  delay?: number;
}

export function SectionCard({
  title,
  icon,
  className,
  children,
  delay,
}: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: delay ?? 0 }}
      className={cn(
        "bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 h-full",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-medium text-primary">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
