import { Link } from "react-router-dom";
import {
  Kanban,
  FileText,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
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
    description:
      "Your pipeline at a glance. Drag cards across stages, add new applications, and archive jobs when they close.",
    path: "/board",
    icon: Kanban,
  },
  {
    label: "Resume Analyzer",
    description:
      "Upload your resume and get AI feedback on strengths, weaknesses, and ATS compatibility before you apply anywhere.",
    path: "/resume",
    icon: FileText,
  },
  {
    label: "Job Match",
    description:
      "Paste a job description to score how well it fits your profile, surface red flags, and generate a pitch for outreach.",
    path: "/job",
    icon: Briefcase,
  },
  {
    label: "LevelUp",
    description:
      "Turn rejected interviews into a study plan. Track the questions that tripped you up and mark them mastered over time.",
    path: "/levelup",
    icon: TrendingUp,
  },
];

interface Activity {
  id: string;
  kind: "moved" | "added" | "discarded";
  company: string;
  target?: string;
  timeAgo: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    kind: "moved",
    company: "Stripe",
    target: "Technical Interview",
    timeAgo: "2 days ago",
  },
  { id: "a2", kind: "added", company: "Linear", timeAgo: "4 days ago" },
  {
    id: "a3",
    kind: "moved",
    company: "GitHub",
    target: "HR Interview",
    timeAgo: "1 week ago",
  },
  {
    id: "a4",
    kind: "discarded",
    company: "Acme Corp",
    timeAgo: "2 weeks ago",
  },
  {
    id: "a5",
    kind: "moved",
    company: "Figma",
    target: "Offer",
    timeAgo: "3 weeks ago",
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
      className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-border-hover transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-sm text-secondary mt-1 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const { kind, company, target, timeAgo } = activity;

  const iconWrapperClass =
    kind === "moved"
      ? "bg-purple/10 text-purple"
      : kind === "added"
        ? "bg-teal/10 text-teal"
        : "bg-overlay text-muted";

  const Icon = kind === "moved" ? ArrowRight : kind === "added" ? Plus : X;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconWrapperClass}`}
      >
        <Icon size={18} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm text-primary">
          {kind === "moved" && (
            <>
              You moved <strong className="font-medium">{company}</strong> to {target}
            </>
          )}
          {kind === "added" && (
            <>
              You added <strong className="font-medium">{company}</strong> to Applied
            </>
          )}
          {kind === "discarded" && (
            <>
              You discarded <strong className="font-medium">{company}</strong>
            </>
          )}
        </p>
        <span className="text-xs text-muted">{timeAgo}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.path} {...action} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest">
          Recent activity
        </h2>
        <div className="flex flex-col gap-2">
          {MOCK_ACTIVITIES.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </div>
  );
}
