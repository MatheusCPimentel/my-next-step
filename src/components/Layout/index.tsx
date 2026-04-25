import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "../Sidebar";

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const fullWidth = pathname.startsWith("/board");

  return (
    <div className="flex h-screen overflow-hidden">
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

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <header className="flex items-center h-14 px-4 shrink-0 md:hidden bg-surface border-b border-border">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded bg-transparent border-0 cursor-pointer transition-colors hover:bg-overlay text-primary"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-10 bg-page">
          <div
            className={`mx-auto w-full ${fullWidth ? "h-full" : "max-w-7xl"}`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
