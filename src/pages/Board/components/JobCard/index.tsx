import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import type { Job } from "@/pages/Board/types";

function fitScoreColorClass(score: number): string {
  if (score < 50) return "text-red-500";
  if (score < 60) return "text-orange-400";
  if (score < 70) return "text-yellow-400";
  if (score < 90) return "text-teal";
  return "text-green-400";
}

interface JobCardProps {
  job: Job;
  dragging?: boolean;
  onClick?: () => void;
}

function JobCardComponent({ job, dragging, onClick }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
    data: { type: "card", columnId: job.columnId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const displayed = job.updatedAt ?? job.createdAt;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-overlay border border-border rounded-lg relative overflow-hidden p-4 flex flex-col gap-3 shrink-0 hover:border-border-hover transition-colors touch-none ${
        dragging ? "cursor-grabbing shadow-lg" : "cursor-grab"
      }`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {job.fromJobMatch && (
          <span className="inline-flex items-center gap-1 bg-purple/10 text-purple-soft border border-purple/20 text-[10px] px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
            AI
          </span>
        )}
        {typeof job.fitScore === "number" ? (
          <span className={`text-xs font-medium ${fitScoreColorClass(job.fitScore)}`}>
            {job.fitScore}%
          </span>
        ) : (
          <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
            Not analyzed
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div>
        <p className="text-sm font-medium text-primary">{job.company}</p>
        <p className="text-secondary text-sm mt-0.5">{job.title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {job.requiredSkills.map((s, i) => (
          <span
            key={`${s.name}-${i}`}
            className="px-2 py-0.5 bg-surface rounded text-xs text-muted"
          >
            {s.name}
          </span>
        ))}
        {displayed && (
          <time
            dateTime={displayed}
            className="text-[10px] text-muted ml-auto flex-shrink-0"
          >
            {format(new Date(displayed), "MMM d")}
          </time>
        )}
      </div>
    </div>
  );
}

export const JobCard = memo(JobCardComponent);
