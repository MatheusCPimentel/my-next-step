import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import type { Job } from "@/pages/Board/types";

function fitScorePillClasses(score: number): { pill: string; dot: string } {
  if (score < 50)
    return {
      pill: "bg-red-500/8 border-red-500/15 text-red-500",
      dot: "bg-red-500",
    };
  if (score < 60)
    return {
      pill: "bg-orange-400/8 border-orange-400/15 text-orange-400",
      dot: "bg-orange-400",
    };
  if (score < 70)
    return {
      pill: "bg-yellow-400/8 border-yellow-400/15 text-yellow-400",
      dot: "bg-yellow-400",
    };
  if (score < 80)
    return {
      pill: "bg-teal/8 border-teal/15 text-teal",
      dot: "bg-teal",
    };
  return {
    pill: "bg-green-400/8 border-green-400/15 text-green-400",
    dot: "bg-green-400",
  };
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
  const fitScoreClasses =
    typeof job.fitScore === "number" ? fitScorePillClasses(job.fitScore) : null;

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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute top-2 right-2">
        {fitScoreClasses ? (
          <span
            className={`inline-flex items-center gap-1 border text-[10px] font-medium px-1.5 py-0.5 rounded-full ${fitScoreClasses.pill}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${fitScoreClasses.dot}`}
            />
            {job.fitScore}% fit
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 border text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500/8 border-red-500/15 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Not analyzed
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-primary">{job.company}</p>
        <p className="text-secondary text-xs mt-0.5">{job.title}</p>
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
