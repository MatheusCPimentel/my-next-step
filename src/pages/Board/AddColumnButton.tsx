import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddColumnButtonProps {
  onAdd: (label: string) => void;
  disabled?: boolean;
}

export function AddColumnButton({ onAdd, disabled }: AddColumnButtonProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="h-full w-[272px] min-w-[272px] shrink-0 bg-surface rounded-xl p-3">
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

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label="Add column"
      className="group/add h-full w-[272px] min-w-[272px] shrink-0 rounded-xl border border-dashed border-border-hover text-muted hover:border-purple hover:text-purple-soft hover:bg-purple/5 transition-colors flex flex-col items-center justify-center gap-2 p-3"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-border-hover group-hover/add:border-purple transition-colors">
        <Plus size={16} />
      </span>
      <span className="text-xs font-medium uppercase tracking-wide">Add column</span>
    </button>
  );
}
