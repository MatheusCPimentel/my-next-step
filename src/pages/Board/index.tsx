type Stage = "applied" | "hr_interview" | "technical_interview" | "offer";

interface Job {
  id: string;
  company: string;
  title: string;
  tags: string[];
  stage: Stage;
}

interface KanbanColumnDef {
  id: Stage;
  label: string;
}

const COLUMNS: KanbanColumnDef[] = [
  { id: "applied", label: "Applied" },
  { id: "hr_interview", label: "HR Interview" },
  { id: "technical_interview", label: "Technical Interview" },
  { id: "offer", label: "Offer" },
];

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    company: "Stripe",
    title: "Senior Frontend Engineer",
    tags: ["React", "TypeScript"],
    stage: "applied",
  },
  {
    id: "2",
    company: "Linear",
    title: "Product Engineer",
    tags: ["React", "Electron"],
    stage: "applied",
  },
  {
    id: "3",
    company: "Vercel",
    title: "Software Engineer",
    tags: ["Next.js", "Go"],
    stage: "applied",
  },
  {
    id: "4",
    company: "GitHub",
    title: "Senior Software Engineer",
    tags: ["Ruby", "React"],
    stage: "hr_interview",
  },
  {
    id: "5",
    company: "Notion",
    title: "Frontend Engineer",
    tags: ["React", "TypeScript"],
    stage: "hr_interview",
  },
  {
    id: "6",
    company: "Figma",
    title: "Software Engineer",
    tags: ["TypeScript", "WebGL"],
    stage: "technical_interview",
  },
  {
    id: "7",
    company: "Anthropic",
    title: "Frontend Engineer",
    tags: ["React", "Python"],
    stage: "offer",
  },
];

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-overlay border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-border-hover transition-colors cursor-default">
      <div>
        <p className="text-sm font-medium text-primary">{job.company}</p>
        <p className="text-xs text-secondary mt-0.5">{job.title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="px-2 py-0.5 bg-surface rounded text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  jobs,
}: {
  column: KanbanColumnDef;
  jobs: Job[];
}) {
  return (
    <div className="w-[272px] min-w-[272px] shrink-0 bg-surface rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1 py-1">
        <span className="text-sm font-medium text-primary">{column.label}</span>
        <span className="text-xs text-muted bg-overlay px-1.5 py-0.5 rounded tabular-nums">
          {jobs.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <p className="text-xs text-muted text-center py-8">
            No applications yet
          </p>
        )}
      </div>
    </div>
  );
}

export function Board() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary">Board</h1>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            jobs={MOCK_JOBS.filter((job) => job.stage === column.id)}
          />
        ))}
      </div>
    </div>
  );
}
