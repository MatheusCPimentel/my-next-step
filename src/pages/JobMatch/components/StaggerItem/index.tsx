import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerItemProps {
  delay: number;
  className?: string;
  children: ReactNode;
}

export function StaggerItem({ delay, className, children }: StaggerItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
