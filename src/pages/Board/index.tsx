import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
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
import { BoardColumn } from "@/pages/Board/components/BoardColumn";
import { JobCard } from "@/pages/Board/components/JobCard";
import { AddColumnButton } from "@/pages/Board/components/AddColumnButton";
import { DiscardZone } from "@/pages/Board/components/DiscardZone";
import { DiscardDialog, type DiscardOption } from "@/pages/Board/components/DiscardDialog";
import { JobDialog } from "@/components/JobDialog";
import {
  INITIAL_COLUMNS,
  INITIAL_JOBS,
  newColumnId,
} from "@/pages/Board/mockData";
import type { Column, Job } from "@/pages/Board/types";
import {
  appendStageMove,
  applyCreateTimestamps,
  applyEditTimestamp,
} from "@/pages/Board/stageHistory";

const MAX_COLUMNS = 20;

type ActiveDrag =
  | { type: "card"; id: string }
  | { type: "column"; id: string }
  | null;

type DragPreview = {
  activeJobId: string;
  overColumnId: string;
  overJobId: string | null;
};

type DialogState =
  | { kind: "closed" }
  | { kind: "create"; columnId: string }
  | { kind: "view-or-edit"; job: Job };

export function Board() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [pendingDiscardJob, setPendingDiscardJob] = useState<Job | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const sortableColumnIds = useMemo(
    () => columns.filter((c) => !c.locked).map((c) => c.id),
    [columns],
  );

  const baselineJobsByColumn = useMemo(() => {
    const map = new Map<string, Job[]>();
    columns.forEach((c) => map.set(c.id, []));
    jobs.forEach((j) => {
      const list = map.get(j.columnId);
      if (list) list.push(j);
      else map.set(j.columnId, [j]);
    });
    return map;
  }, [columns, jobs]);

  const jobsByColumn = useMemo(() => {
    if (!dragPreview) return baselineJobsByColumn;

    const draggedJob = jobs.find((j) => j.id === dragPreview.activeJobId);
    if (!draggedJob) return baselineJobsByColumn;

    const sourceColumnId = draggedJob.columnId;
    const targetColumnId = dragPreview.overColumnId;

    const map = new Map(baselineJobsByColumn);

    const previewJob: Job = { ...draggedJob, columnId: targetColumnId };

    if (sourceColumnId === targetColumnId) {
      const baseList = baselineJobsByColumn.get(targetColumnId) ?? [];
      const nextList = baseList.filter((j) => j.id !== dragPreview.activeJobId);
      if (dragPreview.overJobId) {
        const overIndex = nextList.findIndex(
          (j) => j.id === dragPreview.overJobId,
        );
        if (overIndex === -1) nextList.push(previewJob);
        else nextList.splice(overIndex, 0, previewJob);
      } else {
        nextList.push(previewJob);
      }
      map.set(targetColumnId, nextList);
    } else {
      const sourceBase = baselineJobsByColumn.get(sourceColumnId) ?? [];
      const nextSource = sourceBase.filter(
        (j) => j.id !== dragPreview.activeJobId,
      );
      map.set(sourceColumnId, nextSource);

      const targetBase = baselineJobsByColumn.get(targetColumnId) ?? [];
      const nextTarget = targetBase.slice();
      if (dragPreview.overJobId) {
        const overIndex = nextTarget.findIndex(
          (j) => j.id === dragPreview.overJobId,
        );
        if (overIndex === -1) nextTarget.push(previewJob);
        else nextTarget.splice(overIndex, 0, previewJob);
      } else {
        nextTarget.push(previewJob);
      }
      map.set(targetColumnId, nextTarget);
    }

    return map;
  }, [baselineJobsByColumn, jobs, dragPreview]);

  const activeJob = useMemo(
    () =>
      activeDrag?.type === "card"
        ? (jobs.find((j) => j.id === activeDrag.id) ?? null)
        : null,
    [activeDrag, jobs],
  );

  const activeColumn = useMemo(
    () =>
      activeDrag?.type === "column"
        ? (columns.find((c) => c.id === activeDrag.id) ?? null)
        : null,
    [activeDrag, columns],
  );

  const findColumnIdForOver = useCallback(
    (overId: string): string | null => {
      if (overId.startsWith("column-")) {
        return overId.slice("column-".length);
      }
      const byJob = jobs.find((j) => j.id === overId);
      if (byJob) return byJob.columnId;
      const byColumn = columns.find((c) => c.id === overId);
      if (byColumn) return byColumn.id;
      return null;
    },
    [jobs, columns],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type as "card" | "column" | undefined;
    if (type === "card") {
      setActiveDrag({ type: "card", id: String(active.id) });
    } else if (type === "column") {
      setActiveDrag({ type: "column", id: String(active.id) });
    }
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeType = active.data.current?.type;
      if (activeType !== "card") return;
      if (over.id === "discard") return;

      const activeId = String(active.id);
      const overId = String(over.id);
      if (overId === activeId) return;
      const targetColumnId = findColumnIdForOver(overId);
      if (!targetColumnId) return;

      const overIsJob = jobs.some((j) => j.id === overId);
      const overJobId = overIsJob ? overId : null;

      setDragPreview((prev) => {
        if (
          prev &&
          prev.activeJobId === activeId &&
          prev.overColumnId === targetColumnId &&
          prev.overJobId === overJobId
        ) {
          return prev;
        }
        return {
          activeJobId: activeId,
          overColumnId: targetColumnId,
          overJobId,
        };
      });
    },
    [jobs, findColumnIdForOver],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeType = active.data.current?.type;

      if (activeType === "card") {
        if (over?.id === "discard") {
          const job = jobs.find((j) => j.id === active.id);
          if (job) {
            setPendingDiscardJob(job);
          }
        } else if (dragPreview) {
          setJobs((prev) => {
            const activeIndex = prev.findIndex(
              (j) => j.id === dragPreview.activeJobId,
            );
            if (activeIndex === -1) return prev;
            const activeJob = prev[activeIndex];
            const copy = prev.slice();
            copy.splice(activeIndex, 1);

            const sourceColumnId = activeJob.columnId;
            const targetColumnId = dragPreview.overColumnId;
            const movedJob: Job =
              sourceColumnId === targetColumnId
                ? { ...activeJob, columnId: targetColumnId }
                : appendStageMove(
                    { ...activeJob, columnId: targetColumnId },
                    columns.find((c) => c.id === targetColumnId)?.label ?? targetColumnId,
                    new Date().toISOString(),
                  );

            if (dragPreview.overJobId) {
              const overIndex = copy.findIndex(
                (j) => j.id === dragPreview.overJobId,
              );
              if (overIndex === -1) {
                copy.push(movedJob);
              } else {
                copy.splice(overIndex, 0, movedJob);
              }
            } else {
              copy.push(movedJob);
            }

            return copy;
          });
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

      setActiveDrag(null);
      setDragPreview(null);
    },
    [jobs, columns, dragPreview],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    setDragPreview(null);
  }, []);

  const handleConfirmDiscard = useCallback(
    (option: DiscardOption) => {
      if (pendingDiscardJob) {
        const payload =
          option.kind === "rejected"
            ? {
                kind: option.kind,
                stageId: option.stageId,
                questions: option.questions,
                jobId: pendingDiscardJob.id,
              }
            : { kind: option.kind, jobId: pendingDiscardJob.id };
        console.log("discard", payload);
        setJobs((prev) => prev.filter((j) => j.id !== pendingDiscardJob.id));
      }
      setPendingDiscardJob(null);
    },
    [pendingDiscardJob],
  );

  const handleAddColumn = useCallback((insertAt: number, label: string) => {
    setColumns((prev) => {
      if (prev.length >= MAX_COLUMNS) return prev;
      const copy = [...prev];
      copy.splice(insertAt, 0, {
        id: newColumnId(),
        label,
        locked: false,
      });
      return copy;
    });
  }, []);

  const handleRenameColumn = useCallback((id: string, label: string) => {
    if (!label.trim()) return;
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)));
  }, []);

  const handleDeleteColumn = useCallback((id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleJobClick = useCallback((job: Job) => {
    setDialog({ kind: "view-or-edit", job });
  }, []);

  const handleJobSubmit = useCallback((submitted: Job) => {
    setJobs((prev) => {
      const i = prev.findIndex((j) => j.id === submitted.id);
      const now = new Date().toISOString();
      if (i === -1) return [...prev, applyCreateTimestamps(submitted, now)];
      const copy = prev.slice();
      copy[i] = applyEditTimestamp(submitted, now);
      return copy;
    });
  }, []);

  const addDisabled = columns.length >= MAX_COLUMNS;
  const ghostInsertAt = columns[columns.length - 1]?.locked
    ? columns.length - 1
    : columns.length;

  const renderedSlices: React.ReactNode[] = [];
  columns.forEach((column, index) => {
    if (index === ghostInsertAt && !addDisabled) {
      renderedSlices.push(
        <AddColumnButton
          key="add-end"
          onAdd={(label) => handleAddColumn(ghostInsertAt, label)}
          disabled={addDisabled}
        />,
      );
    }
    renderedSlices.push(
      <BoardColumn
        key={column.id}
        column={column}
        jobs={jobsByColumn.get(column.id) ?? []}
        onRename={handleRenameColumn}
        onDelete={handleDeleteColumn}
        onJobClick={handleJobClick}
      />,
    );
  });

  if (ghostInsertAt === columns.length && !addDisabled) {
    renderedSlices.push(
      <AddColumnButton
        key="add-end"
        onAdd={(label) => handleAddColumn(ghostInsertAt, label)}
        disabled={addDisabled}
      />,
    );
  }

  const isCardDragging = activeDrag?.type === "card";

  return (
    <div className="flex flex-col gap-4 -mx-6 h-full min-h-0">
      <div className="flex items-center justify-between px-6">
        <h1 className="text-primary">Board</h1>
        <Button
          onClick={() => setDialog({ kind: "create", columnId: "applied" })}
          className="bg-transparent border border-border-hover text-primary hover:bg-overlay h-9 px-3 gap-2"
        >
          <Plus size={16} />
          Add Job
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortableColumnIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="board-scroll flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-6 pb-2">
            <div className="flex items-stretch gap-3 min-w-full w-fit h-full">
              {renderedSlices}
            </div>
          </div>
        </SortableContext>
        <div
          className={`px-6 transition-opacity ${
            isCardDragging ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <DiscardZone />
        </div>
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
        jobCompany={pendingDiscardJob?.title ?? ""}
        columns={columns}
        onConfirm={handleConfirmDiscard}
      />
      <JobDialog
        mode={dialog.kind === "create" ? "create" : "view"}
        job={dialog.kind === "view-or-edit" ? dialog.job : undefined}
        columnId={dialog.kind === "create" ? dialog.columnId : undefined}
        open={dialog.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setDialog({ kind: "closed" });
        }}
        onSubmit={handleJobSubmit}
      />
    </div>
  );
}
