import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Briefcase,
  TrendingUp,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { labelKey: "Dashboard" as const, path: "/", icon: LayoutDashboard },
  { labelKey: "Board" as const, path: "/board", icon: Kanban },
  {
    labelKey: "Resume Analyzer" as const,
    path: "/resume",
    icon: FileText,
  },
  { labelKey: "Job Analyzer" as const, path: "/job", icon: Briefcase },
  { labelKey: "Level Up" as const, path: "/levelup", icon: TrendingUp },
] as const;

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-5 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          My Next Step
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ labelKey, path, icon: Icon }) => (
          <NavLink
            key={labelKey}
            to={path}
            end={path === "/"}
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded transition-colors no-underline"
            style={({ isActive }) => ({
              background: isActive ? "var(--color-purple)" : "transparent",
              color: isActive ? "#fff" : "var(--color-text-secondary)",
            })}
          >
            <Icon size={16} />
            {labelKey}
          </NavLink>
        ))}
      </nav>

      <div
        className="flex flex-col gap-1 px-2 py-3 shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5 px-2.5 py-1.5">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
            style={{
              background: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <User size={14} style={{ color: "var(--color-text-muted)" }} />
          </div>
          <span
            className="text-[13px] truncate"
            style={{ color: "var(--color-text-secondary)" }}
          >
            John Doe
          </span>
        </div>

        <button
          className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded text-[13px] font-medium transition-colors"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            textAlign: "left",
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden md:flex flex-col w-[220px] shrink-0"
        style={{
          background: "var(--color-bg-secondary)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer — slides in from left */}
      <aside
        className="fixed top-0 left-0 z-50 h-full flex flex-col w-[220px] md:hidden transition-transform duration-[250ms] ease-in-out"
        style={{
          background: "var(--color-bg-secondary)",
          borderRight: "1px solid var(--color-border)",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar with hamburger */}
        <header
          className="flex items-center md:hidden h-14 px-4 shrink-0"
          style={{
            background: "var(--color-bg-secondary)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded transition-colors"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-primary)",
            }}
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
