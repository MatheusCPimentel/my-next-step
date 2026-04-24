import { useDroppable } from "@dnd-kit/core";

export function DiscardZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "discard" });

  const base =
    "border-2 border-dashed rounded-xl p-6 text-center text-sm transition-colors";
  const inactive = "border-border bg-surface/40 text-muted";
  const active = "border-purple/40 bg-purple/10 text-purple";

  return (
    <div
      ref={setNodeRef}
      className={`${base} ${isOver ? active : inactive}`}
    >
      Drop here to archive this job
    </div>
  );
}
