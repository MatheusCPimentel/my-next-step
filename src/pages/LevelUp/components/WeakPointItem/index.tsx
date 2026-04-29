import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ExpandableValue } from "@/components/ExpandableValue";
import type { WeakPoint } from "@/pages/LevelUp/types";

interface WeakPointItemProps {
  weakPoint: WeakPoint;
  isEditing: boolean;
  isRemoving: boolean;
  onToggleMastered: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, question: string, answer: string) => void;
  onRemove: (id: string) => void;
}

export function WeakPointItem({
  weakPoint,
  isEditing,
  isRemoving,
  onToggleMastered,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRemove,
}: WeakPointItemProps) {
  const [draftQuestion, setDraftQuestion] = useState(weakPoint.question);
  const [draftAnswer, setDraftAnswer] = useState(weakPoint.answer);

  const handleStartEdit = () => {
    setDraftQuestion(weakPoint.question);
    setDraftAnswer(weakPoint.answer);
    onStartEdit(weakPoint.id);
  };

  const handleSave = () => {
    onSaveEdit(weakPoint.id, draftQuestion, draftAnswer);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 transition-opacity duration-200 ${
        isRemoving ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={weakPoint.mastered}
        aria-label={
          weakPoint.mastered
            ? `Mark "${weakPoint.question}" as not mastered`
            : `Mark "${weakPoint.question}" as mastered`
        }
        onClick={() => onToggleMastered(weakPoint.id)}
        className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ${
          weakPoint.mastered
            ? "bg-teal border-teal"
            : "bg-transparent border-border hover:border-border-hover"
        }`}
      >
        {weakPoint.mastered && (
          <Check size={10} className="text-primary" strokeWidth={3} />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {!isEditing && (
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium ${
                weakPoint.mastered
                  ? "line-through text-secondary"
                  : "text-primary"
              }`}
            >
              {weakPoint.question}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label={`Edit "${weakPoint.question}"`}
                onClick={handleStartEdit}
                className="text-muted hover:text-primary transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                aria-label={`Remove "${weakPoint.question}"`}
                onClick={() => onRemove(weakPoint.id)}
                className="text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-3 mt-0.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary">Question</label>
              <Input
                value={draftQuestion}
                onChange={(e) => setDraftQuestion(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary">Answer</label>
              <Textarea
                value={draftAnswer}
                onChange={(e) => setDraftAnswer(e.target.value)}
                className="min-h-[100px] border border-border rounded-lg"
              />
            </div>
          </div>
        ) : (
          <ExpandableValue
            value={weakPoint.answer}
            className={`text-sm text-secondary leading-relaxed whitespace-pre-wrap ${
              weakPoint.mastered ? "opacity-50" : ""
            }`}
          />
        )}

        <div className="flex items-center justify-between gap-3 mt-1">
          <span
            className={`${
              isEditing ? "hidden md:block" : "inline-flex items-center"
            } text-[10px] text-muted bg-overlay border border-border px-1.5 py-0.5 rounded-full`}
          >
            from: {weakPoint.sourceJob}
          </span>
          {isEditing && (
            <div className="ml-auto w-full md:w-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onCancelEdit}
                className="flex-1 md:flex-initial"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 md:flex-initial"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
