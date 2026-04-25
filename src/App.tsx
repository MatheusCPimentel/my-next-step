import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Board } from "./pages/Board";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";
import { JobMatch } from "./pages/JobMatch";
import { LevelUp } from "./pages/LevelUp";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board" element={<Board />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/job" element={<JobMatch />} />
          <Route path="/levelup" element={<LevelUp />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

export default App;
