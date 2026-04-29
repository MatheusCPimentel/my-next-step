import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddColumnButtonProps {
  onAdd: (label: string) => void;
  disabled?: boolean;
}

export function AddColumnButton({ onAdd, disabled }: AddColumnButtonProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver, active } = useDroppable({
    id: "add-column-placeholder",
    data: { type: "add-column-placeholder" },
  });

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  if (disabled) return null;

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
    }
    setValue("");
    setEditing(false);
  };

  const cancel = () => {
    setValue("");
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        ref={setNodeRef}
        className="h-full min-h-0 w-(--board-col-width) shrink-0 bg-surface rounded-xl p-3"
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          placeholder="Column name"
          className="bg-overlay border-border text-primary"
        />
      </div>
    );
  }

  const isCardOver = isOver && active?.data.current?.type === "card";
  const buttonClass = cn(
    "group/add h-full min-h-0 w-(--board-col-width) shrink-0 rounded-xl border border-dashed transition-colors flex flex-col items-center justify-center gap-2 p-3",
    isCardOver
      ? "border-purple text-purple-soft bg-purple/10"
      : "border-border-hover text-muted hover:border-purple hover:text-purple-soft hover:bg-purple/5",
  );
  const innerCircleClass = cn(
    "flex items-center justify-center w-8 h-8 rounded-full border border-dashed transition-colors",
    isCardOver
      ? "border-purple"
      : "border-border-hover group-hover/add:border-purple",
  );

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => setEditing(true)}
      aria-label="Add column"
      className={buttonClass}
    >
      <span className={innerCircleClass}>
        <Plus size={16} />
      </span>
      <span className="text-xs font-medium uppercase tracking-wide">Add column</span>
    </button>
  );
}
