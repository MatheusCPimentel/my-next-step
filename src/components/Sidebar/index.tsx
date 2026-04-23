import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  User,
  Home,
  Kanban,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Board", path: "/board", icon: Kanban },
  { label: "Resume Analyzer", path: "/resume", icon: FileText },
  { label: "Job Analyzer", path: "/job", icon: Briefcase },
  { label: "LevelUp", path: "/levelup", icon: TrendingUp },
] as const;

interface SidebarProps {
  isMobileDrawer?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  isMobileDrawer = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const effectivelyCollapsed = isMobileDrawer ? false : collapsed;

  return (
    <motion.aside
      animate={{ width: effectivelyCollapsed ? 64 : 220 }}
      transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
      className="flex flex-col h-full overflow-hidden shrink-0 bg-surface border-r border-border"
    >
      <header className="flex items-center shrink-0 h-14 border-b border-border">
        <AnimatePresence initial={false}>
          {!effectivelyCollapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.1, duration: 0.15 },
              }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex items-center gap-2 flex-1 pl-4 overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-purple">
                <span className="text-[11px] font-bold text-primary">M</span>
              </div>

              <span className="font-bold text-[15px] whitespace-nowrap tracking-tight text-primary">
                MyNextStep
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-16 h-14 flex items-center justify-center shrink-0 ml-auto">
          <button
            onClick={
              isMobileDrawer ? onMobileClose : () => setCollapsed(!collapsed)
            }
            className="w-10 h-10 flex items-center justify-center rounded bg-transparent border-0 cursor-pointer transition-colors hover:bg-overlay text-muted"
          >
            {isMobileDrawer ? (
              <X size={18} />
            ) : effectivelyCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </header>

      <nav className="flex-1 flex flex-col gap-1 px-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
            collapsed={effectivelyCollapsed}
          />
        ))}
      </nav>

      <footer className="flex flex-col gap-1 px-2 py-4 shrink-0 border-t border-border">
        <div className="flex items-center h-10 rounded">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 mx-auto">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-overlay border border-border">
              <User size={14} className="text-muted" />
            </div>
          </div>
          <motion.span
            animate={{
              maxWidth: effectivelyCollapsed ? 0 : 200,
              opacity: effectivelyCollapsed ? 0 : 1,
            }}
            transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
            className="whitespace-nowrap overflow-hidden flex-1 text-[13px] text-muted"
            style={{ pointerEvents: effectivelyCollapsed ? "none" : "auto" }}
          >
            John Doe
          </motion.span>
        </div>

        <button className="w-full bg-transparent border-0 cursor-pointer p-0">
          <div className="flex items-center h-10 rounded transition-colors hover:bg-overlay text-[13px] font-medium text-muted">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 mx-auto">
              <LogOut size={16} />
            </div>
            <motion.span
              animate={{
                maxWidth: effectivelyCollapsed ? 0 : 200,
                opacity: effectivelyCollapsed ? 0 : 1,
              }}
              transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
              className="text-left whitespace-nowrap overflow-hidden flex-1"
              style={{ pointerEvents: effectivelyCollapsed ? "none" : "auto" }}
            >
              Logout
            </motion.span>
          </div>
        </button>
      </footer>
    </motion.aside>
  );
}
