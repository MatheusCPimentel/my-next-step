import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CollapsibleLabelProps {
  collapsed: boolean;
  className?: string;
  children: ReactNode;
}

export function CollapsibleLabel({
  collapsed,
  className,
  children,
}: CollapsibleLabelProps) {
  return (
    <motion.span
      animate={{
        maxWidth: collapsed ? 0 : 200,
        opacity: collapsed ? 0 : 1,
      }}
      transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
      className={className}
      style={{ pointerEvents: collapsed ? "none" : "auto" }}
    >
      {children}
    </motion.span>
  );
}
