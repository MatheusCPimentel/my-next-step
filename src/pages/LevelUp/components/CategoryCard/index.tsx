import { ChevronDown } from "lucide-react";
import type { WeakPoint, WeakPointCategory } from "@/pages/LevelUp/types";
import { WeakPointItem } from "@/pages/LevelUp/components/WeakPointItem";

const COLOR_DOT: Record<WeakPointCategory["color"], string> = {
  coral: "bg-coral",
  purple: "bg-purple",
  teal: "bg-teal",
  amber: "bg-amber",
  blue: "bg-blue",
};

interface CategoryCardProps {
  category: WeakPointCategory;
  weakPoints: WeakPoint[];
  expanded: boolean;
  onToggle: (id: string) => void;
  editingId: string | null;
  removingIds: Set<string>;
  onToggleMastered: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, question: string, answer: string) => void;
  onRemove: (id: string) => void;
}

export function CategoryCard({
  category,
  weakPoints,
  expanded,
  onToggle,
  editingId,
  removingIds,
  onToggleMastered,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRemove,
}: CategoryCardProps) {
  return (
    <div className="bg-surface rounded-lg overflow-hidden">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onToggle(category.id)}
        className="w-full flex items-center gap-3 p-4 hover:bg-overlay/40 transition-colors"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${COLOR_DOT[category.color]}`}
        />
        <span className="text-sm font-medium text-primary">
          {category.name}
        </span>
        <span className="text-xs text-muted bg-overlay px-2 py-0.5 rounded-full">
          {weakPoints.length}
        </span>
        <ChevronDown
          size={16}
          className={`ml-auto text-muted transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="flex flex-col">
          {weakPoints.map((wp) => (
            <div key={wp.id} className="border-t border-border">
              <WeakPointItem
                weakPoint={wp}
                isEditing={editingId === wp.id}
                isRemoving={removingIds.has(wp.id)}
                onToggleMastered={onToggleMastered}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
