import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Job } from "@/pages/Board/types";

interface JobCardProps {
  job: Job;
  dragging?: boolean;
}

export function JobCard({ job, dragging }: JobCardProps) {
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
      className={`bg-overlay border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-border-hover transition-colors ${
        dragging ? "cursor-grabbing shadow-lg" : "cursor-grab"
      }`}
    >
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
