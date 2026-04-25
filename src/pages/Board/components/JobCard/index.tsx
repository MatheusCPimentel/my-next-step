import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Job } from "@/pages/Board/types";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-overlay border border-border rounded-lg relative overflow-hidden p-4 flex flex-col gap-3 hover:border-border-hover transition-colors touch-none ${
        dragging ? "cursor-grabbing shadow-lg" : "cursor-grab"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div>
        <p className="text-sm font-medium text-primary">{job.company}</p>
        <p className="text-secondary text-sm mt-0.5">{job.title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {job.requiredSkills.map((s, i) => (
          <span
            key={`${s.name}-${i}`}
            className="px-2 py-0.5 bg-surface rounded text-xs text-muted"
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export const JobCard = memo(JobCardComponent);
