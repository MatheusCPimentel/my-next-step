import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BoardColumn } from "@/pages/Board/BoardColumn";
import { JobCard } from "@/pages/Board/JobCard";
import { AddColumnButton } from "@/pages/Board/AddColumnButton";
import { DiscardZone } from "@/pages/Board/DiscardZone";
import { DiscardDialog, type DiscardOption } from "@/pages/Board/DiscardDialog";
import {
  INITIAL_COLUMNS,
  INITIAL_JOBS,
  newColumnId,
} from "@/pages/Board/mockData";
import type { Column, Job } from "@/pages/Board/types";

const MAX_COLUMNS = 20;

type ActiveDrag =
  | { type: "card"; id: string }
  | { type: "column"; id: string }
  | null;

export function Board() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [pendingDiscardJob, setPendingDiscardJob] = useState<Job | null>(null);
  const originalColumnIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const sortableColumnIds = columns.filter((c) => !c.locked).map((c) => c.id);

  const jobsByColumn = (columnId: string) =>
    jobs.filter((j) => j.columnId === columnId);

  const activeJob =
    activeDrag?.type === "card"
      ? jobs.find((j) => j.id === activeDrag.id) ?? null
      : null;
  const activeColumn =
    activeDrag?.type === "column"
      ? columns.find((c) => c.id === activeDrag.id) ?? null
      : null;

  const findColumnIdForOver = (overId: string): string | null => {
    if (overId.startsWith("column-")) {
      return overId.slice("column-".length);
    }
    const byJob = jobs.find((j) => j.id === overId);
    if (byJob) return byJob.columnId;
    const byColumn = columns.find((c) => c.id === overId);
    if (byColumn) return byColumn.id;
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type as "card" | "column" | undefined;
    if (type === "card") {
      const job = jobs.find((j) => j.id === active.id);
      if (job) originalColumnIdRef.current = job.columnId;
      setActiveDrag({ type: "card", id: String(active.id) });
    } else if (type === "column") {
      setActiveDrag({ type: "column", id: String(active.id) });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeType = active.data.current?.type;
    if (activeType !== "card") return;
    if (over.id === "discard") return;

    const draggingJob = jobs.find((j) => j.id === active.id);
    if (!draggingJob) return;

    const targetColumnId = findColumnIdForOver(String(over.id));
    if (!targetColumnId) return;

    if (draggingJob.columnId === targetColumnId) {
      const overIsJob = jobs.some((j) => j.id === over.id);
      if (!overIsJob) return;
      setJobs((prev) => {
        const activeIndex = prev.findIndex((j) => j.id === active.id);
        const overIndex = prev.findIndex((j) => j.id === over.id);
        if (activeIndex === -1 || overIndex === -1) return prev;
        if (activeIndex === overIndex) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(activeIndex, 1);
        copy.splice(overIndex, 0, moved);
        return copy;
      });
      return;
    }

    setJobs((prev) =>
      prev.map((j) =>
        j.id === active.id ? { ...j, columnId: targetColumnId } : j
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    if (activeType === "card") {
      if (over?.id === "discard") {
        const job = jobs.find((j) => j.id === active.id);
        const originalColumnId = originalColumnIdRef.current;
        if (job && originalColumnId && job.columnId !== originalColumnId) {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === job.id ? { ...j, columnId: originalColumnId } : j
            )
          );
        }
        if (job) {
          setPendingDiscardJob(
            originalColumnId
              ? { ...job, columnId: originalColumnId }
              : job
          );
        }
      }
    } else if (activeType === "column" && over) {
      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId !== overId) {
        const activeCol = columns.find((c) => c.id === activeId);
        const overCol = columns.find((c) => c.id === overId);
        if (activeCol && overCol && !activeCol.locked && !overCol.locked) {
          setColumns((prev) => {
            const activeIndex = prev.findIndex((c) => c.id === activeId);
            const overIndex = prev.findIndex((c) => c.id === overId);
            if (activeIndex === -1 || overIndex === -1) return prev;
            const copy = [...prev];
            const [moved] = copy.splice(activeIndex, 1);
            copy.splice(overIndex, 0, moved);
            return copy;
          });
        }
      }
    }

    originalColumnIdRef.current = null;
    setActiveDrag(null);
  };

  const handleConfirmDiscard = (option: DiscardOption) => {
    if (pendingDiscardJob) {
      const payload =
        option.kind === "rejected"
          ? {
              kind: option.kind,
              stageId: option.stageId,
              jobId: pendingDiscardJob.id,
            }
          : { kind: option.kind, jobId: pendingDiscardJob.id };
      console.log("discard", payload);
      setJobs((prev) => prev.filter((j) => j.id !== pendingDiscardJob.id));
    }
    setPendingDiscardJob(null);
  };

  const handleAddColumn = (insertAt: number, label: string) => {
    if (columns.length >= MAX_COLUMNS) return;
    setColumns((prev) => {
      const copy = [...prev];
      copy.splice(insertAt, 0, {
        id: newColumnId(),
        label,
        locked: false,
      });
      return copy;
    });
  };

  const handleRenameColumn = (id: string, label: string) => {
    if (!label.trim()) return;
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label } : c))
    );
  };

  const handleDeleteColumn = (id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  };

  const addDisabled = columns.length >= MAX_COLUMNS;

  const renderedSlices: React.ReactNode[] = [];
  columns.forEach((column, index) => {
    if (index > 0) {
      renderedSlices.push(
        <AddColumnButton
          key={`add-${index}`}
          insertAt={index}
          onAdd={handleAddColumn}
          disabled={addDisabled}
        />
      );
    }

    renderedSlices.push(
      <BoardColumn
        key={column.id}
        column={column}
        jobs={jobsByColumn(column.id)}
        onRename={handleRenameColumn}
        onDelete={handleDeleteColumn}
      />
    );
  });

  return (
    <div className="flex flex-col gap-6 -mx-6">
      <h1 className="text-primary px-6">Board</h1>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableColumnIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="w-full overflow-x-auto px-6 pb-2">
            <div className="flex items-stretch gap-3 w-fit">
              {renderedSlices}
            </div>
          </div>
        </SortableContext>
        {activeDrag?.type === "card" && (
          <div className="px-6">
            <DiscardZone />
          </div>
        )}
        <DragOverlay>
          {activeJob ? <JobCard job={activeJob} dragging /> : null}
          {activeColumn ? (
            <div className="w-[272px] bg-surface rounded-xl p-3 opacity-90 shadow-lg">
              <div className="flex items-center gap-2 px-1 py-1">
                <span className="text-sm font-medium text-primary">
                  {activeColumn.label}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <DiscardDialog
        open={pendingDiscardJob !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDiscardJob(null);
        }}
        jobCompany={pendingDiscardJob?.company ?? ""}
        columns={columns}
        onConfirm={handleConfirmDiscard}
      />
    </div>
  );
}
