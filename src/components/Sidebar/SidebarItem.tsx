import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  label: string;
  path: string;
  icon: LucideIcon;
  collapsed: boolean;
}

export function SidebarItem({
  label,
  path,
  icon: Icon,
  collapsed,
}: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) =>
        [
          "flex items-center h-10 rounded text-[13px] font-medium transition-colors no-underline w-full",
          isActive
            ? "bg-purple/50 text-primary"
            : "text-secondary hover:bg-overlay",
        ].join(" ")
      }
    >
      <div className="w-10 h-10 flex items-center justify-center shrink-0 mx-auto">
        <Icon size={18} />
      </div>

      <motion.span
        animate={{
          maxWidth: collapsed ? 0 : 200,
          opacity: collapsed ? 0 : 1,
        }}
        transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
        className="whitespace-nowrap overflow-hidden flex-1"
        style={{ pointerEvents: collapsed ? "none" : "auto" }}
      >
        {label}
      </motion.span>
    </NavLink>
  );
}
