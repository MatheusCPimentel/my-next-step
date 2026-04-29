import { useState } from "react";
import { SectionLabel } from "@/components/SectionLabel";
import {
  INITIAL_CATEGORIES,
  INITIAL_WEAK_POINTS,
} from "@/pages/LevelUp/mockData";
import type { WeakPoint } from "@/pages/LevelUp/types";
import { StatCard } from "@/pages/LevelUp/components/StatCard";
import { CategoryCard } from "@/pages/LevelUp/components/CategoryCard";

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
        <SectionLabel>To review</SectionLabel>
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
