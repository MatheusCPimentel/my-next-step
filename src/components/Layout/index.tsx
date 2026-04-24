import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "../Sidebar";

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0, 0, 0, 0.6)" }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer"
            initial={{ x: -220 }}
            animate={{ x: 0 }}
            exit={{ x: -220 }}
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-50 h-screen md:hidden"
          >
            <Sidebar
              isMobileDrawer
              onMobileClose={() => setDrawerOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        <header
          className="flex items-center h-14 px-4 shrink-0 md:hidden"
          style={{
            background: "var(--color-bg-secondary)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded bg-transparent border-0 cursor-pointer transition-colors hover:bg-[var(--color-bg-tertiary)]"
            style={{ color: "var(--color-text-primary)" }}
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
