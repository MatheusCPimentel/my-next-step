import { useState } from "react";
import { Check, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ExpandableValue } from "@/components/ExpandableValue";
import {
  INITIAL_CATEGORIES,
  INITIAL_WEAK_POINTS,
} from "@/pages/LevelUp/mockData";
import type { WeakPoint, WeakPointCategory } from "@/pages/LevelUp/types";
import { cn } from "@/lib/utils";

const COLOR_DOT: Record<WeakPointCategory["color"], string> = {
  coral: "bg-[#D85A30]",
  purple: "bg-purple",
  teal: "bg-teal",
  amber: "bg-[#EF9F27]",
  blue: "bg-[#378ADD]",
};

interface StatCardProps {
  containerClassName?: string;
  label: string;
  value: number;
  valueClass: string;
}

function StatCard({
  containerClassName,
  label,
  value,
  valueClass,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex-1 bg-surface rounded-lg p-4 flex flex-col gap-1",
        containerClassName,
      )}
    >
      <span className="text-xs text-secondary uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-2xl font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

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

function WeakPointItem({
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
                variant="ghost"
                onClick={onCancelEdit}
                className="flex-1 md:flex-initial border border-border-hover text-primary hover:bg-overlay"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 md:flex-initial bg-purple hover:bg-purple/90 text-primary"
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

function CategoryCard({
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

export function LevelUp() {
  const [weakPoints, setWeakPoints] =
    useState<WeakPoint[]>(INITIAL_WEAK_POINTS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const masteredCount = weakPoints.filter((wp) => wp.mastered).length;
  const openCount = weakPoints.length - masteredCount;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMastered = (id: string) => {
    setWeakPoints((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, mastered: !wp.mastered } : wp)),
    );
  };

  const startEdit = (id: string) => {
    setEditingId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string, question: string, answer: string) => {
    setWeakPoints((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, question, answer } : wp)),
    );
    setEditingId(null);
  };

  const removeItem = (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setWeakPoints((prev) => prev.filter((wp) => wp.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  };

  return (
    <div className="max-w-3xl mx-auto pb-10 flex flex-col gap-8">
      <div>
        <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">
          Level Up
        </h1>
        <p className="text-secondary mt-1">
          Track your weak points and turn them into strengths.
        </p>
      </div>

      <div className="grid  grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Open points"
          value={openCount}
          valueClass="text-purple-mid"
        />
        <StatCard
          label="Mastered"
          value={masteredCount}
          valueClass="text-teal"
        />
        <StatCard
          label="From rejections"
          value={weakPoints.length}
          valueClass="text-primary"
          containerClassName="col-span-2 md:col-span-1"
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs text-secondary uppercase tracking-widest">
          To review
        </span>
        <div className="flex flex-col gap-3">
          {INITIAL_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              weakPoints={weakPoints.filter(
                (wp) => wp.categoryId === category.id,
              )}
              expanded={expanded.has(category.id)}
              onToggle={toggleExpand}
              editingId={editingId}
              removingIds={removingIds}
              onToggleMastered={toggleMastered}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
              onRemove={removeItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
