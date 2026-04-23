import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Board } from "./pages/Board";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";
import { JobAnalyzer } from "./pages/JobAnalyzer";
import { LevelUp } from "./pages/LevelUp";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board" element={<Board />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/job" element={<JobAnalyzer />} />
        <Route path="/levelup" element={<LevelUp />} />
      </Route>
    </Routes>
  );
}

export default App;
