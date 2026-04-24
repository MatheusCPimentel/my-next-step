import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddColumnButtonProps {
  insertAt: number;
  onAdd: (insertAt: number, label: string) => void;
  disabled?: boolean;
}

export function AddColumnButton({
  insertAt,
  onAdd,
  disabled,
}: AddColumnButtonProps) {
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
      onAdd(insertAt, trimmed);
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
      <div className="w-[272px] min-w-[272px] shrink-0 bg-surface rounded-xl p-3">
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
      className="group/add relative self-stretch w-1 shrink-0 flex items-center justify-center"
    >
      <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border opacity-0 group-hover/add:opacity-100 transition-opacity" />
      <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-purple text-primary opacity-0 group-hover/add:opacity-100 transition-opacity hover:bg-purple/80">
        <Plus size={14} />
      </span>
    </button>
  );
}
