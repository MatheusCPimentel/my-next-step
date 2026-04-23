import { Link } from "react-router-dom";
import { Kanban, FileText, Briefcase, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MOCK_USER = { name: "John" };

const MOCK_STATS = {
  openProcesses: 3,
  improvementPoints: 7,
};

interface QuickAction {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Board",
    description: "Track your active applications",
    path: "/board",
    icon: Kanban,
  },
  {
    label: "Resume Analyzer",
    description: "Get AI feedback on your resume",
    path: "/resume",
    icon: FileText,
  },
  {
    label: "Job Analyzer",
    description: "Score a job description fit",
    path: "/job",
    icon: Briefcase,
  },
  {
    label: "LevelUp",
    description: "Close gaps from past interviews",
    path: "/levelup",
    icon: TrendingUp,
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-1">
      <span className="text-4xl font-medium text-primary">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

function QuickActionCard({ label, description, path, icon: Icon }: QuickAction) {
  return (
    <Link
      to={path}
      className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-border-hover transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export function Dashboard() {
  return (
    <div className="max-w-2xl flex flex-col gap-10">
      <div>
        <h1 className="text-primary">
          {getGreeting()}, {MOCK_USER.name}
        </h1>
        <p className="text-secondary mt-1">Here's where you stand today.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Open processes"
            value={MOCK_STATS.openProcesses}
          />
          <StatCard
            label="Improvement points"
            value={MOCK_STATS.improvementPoints}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.path} {...action} />
          ))}
        </div>
      </section>
    </div>
  );
}
