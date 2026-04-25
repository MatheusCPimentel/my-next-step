import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Skill, SkillVariant } from "@/pages/Board/types";

interface TagInputProps {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
  isEditable: boolean;
  defaultVariant?: SkillVariant;
  placeholder?: string;
}

const VARIANT_CLASSES: Record<SkillVariant, string> = {
  neutral: "bg-overlay text-secondary border-border",
  success: "bg-teal/15 text-teal border-teal/20",
  warning: "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
  danger: "bg-red-500/15 text-red-500 border-red-500/20",
};

export function TagInput({
  value,
  onChange,
  isEditable,
  defaultVariant = "neutral",
  placeholder = "",
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      const isDuplicate = value.some(
        (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase(),
      );
      if (!isDuplicate) {
        onChange([...value, { name: trimmed, variant: defaultVariant }]);
      }
    }
    setDraft("");
  };

  if (!isEditable && value.length === 0) {
    return null;
  }

  return (
    <div>
      {isEditable && (
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            placeholder={placeholder}
            className="flex-1"
          />
          <button
            type="button"
            aria-label="Add tag"
            onClick={commit}
            className="flex items-center justify-center w-8 h-8 rounded border border-border text-muted hover:text-primary hover:border-border-hover transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      <div
        className={
          isEditable
            ? "flex flex-wrap gap-1.5 mt-2"
            : "flex flex-wrap gap-1.5"
        }
      >
        {value.map((skill, index) => (
          <span
            key={`${skill.name}-${index}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${VARIANT_CLASSES[skill.variant]}`}
          >
            {skill.name}
            {isEditable && (
              <button
                type="button"
                aria-label={`Remove ${skill.name}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="inline-flex items-center justify-center"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
