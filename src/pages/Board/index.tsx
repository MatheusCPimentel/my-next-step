import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BoardColumn } from "@/pages/Board/components/BoardColumn";
import { JobCard } from "@/pages/Board/components/JobCard";
import { AddColumnButton } from "@/pages/Board/components/AddColumnButton";
import { DiscardZone } from "@/pages/Board/components/DiscardZone";
import { DiscardDialog } from "@/pages/Board/components/DiscardDialog";
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
import { useBoardDnd } from "@/pages/Board/useBoardDnd";

const MAX_COLUMNS = 20;

type DialogState =
  | { kind: "closed" }
  | { kind: "create"; columnId: string }
  | { kind: "view-or-edit"; jobId: string };

export function Board() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [pendingDiscardJob, setPendingDiscardJob] = useState<Job | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });

  const {
    sensors,
    sortableColumnIds,
    jobsByColumn,
    activeJob,
    activeColumn,
    activeDrag,
    pendingNewColumn,
    setPendingNewColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handlePendingCancel,
    ghostInsertAt,
    addDisabled,
  } = useBoardDnd({
    columns,
    jobs,
    setColumns,
    setJobs,
    onDiscard: (job) => setPendingDiscardJob(job),
  });

  const handleConfirmDiscard = useCallback(() => {
    if (pendingDiscardJob) {
      setJobs((prev) => prev.filter((j) => j.id !== pendingDiscardJob.id));
    }
    setPendingDiscardJob(null);
  }, [pendingDiscardJob]);

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

  const handleRenameColumn = useCallback(
    (id: string, label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      setColumns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, label: trimmed } : c)),
      );
      if (pendingNewColumn && pendingNewColumn.columnId === id) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === pendingNewColumn.jobId
              ? appendStageMove(j, trimmed, new Date().toISOString())
              : j,
          ),
        );
        setPendingNewColumn(null);
      }
    },
    [pendingNewColumn, setPendingNewColumn],
  );

  const handleDeleteColumn = useCallback((id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleJobClick = useCallback((job: Job) => {
    setDialog({ kind: "view-or-edit", jobId: job.id });
  }, []);

  const dialogJob = useMemo(
    () =>
      dialog.kind === "view-or-edit"
        ? jobs.find((j) => j.id === dialog.jobId)
        : undefined,
    [dialog, jobs],
  );

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
    const isPending = pendingNewColumn?.columnId === column.id;
    renderedSlices.push(
      <BoardColumn
        key={column.id}
        column={column}
        jobs={jobsByColumn.get(column.id) ?? []}
        onRename={handleRenameColumn}
        onDelete={handleDeleteColumn}
        onJobClick={handleJobClick}
        initialEditing={isPending}
        onEditCancel={isPending ? handlePendingCancel : undefined}
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
          variant="outline"
          onClick={() => setDialog({ kind: "create", columnId: "applied" })}
          className="h-9 px-3 gap-2"
        >
          <Plus size={16} />
          <span>Add Job</span>
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
            <div className="w-(--board-col-width) bg-surface rounded-xl p-3 opacity-90 shadow-lg">
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
        job={dialogJob}
        columnId={dialog.kind === "create" ? dialog.columnId : undefined}
        open={dialog.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setDialog({ kind: "closed" });
        }}
        onSubmit={handleJobSubmit}
        onJobUpdate={handleJobSubmit}
      />
    </div>
  );
}
