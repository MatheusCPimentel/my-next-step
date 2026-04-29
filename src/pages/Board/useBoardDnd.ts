import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { newColumnId } from "@/pages/Board/mockData";
import { appendStageMove } from "@/pages/Board/stageHistory";
import type { Column, Job } from "@/pages/Board/types";

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

type PendingNewColumn = {
  columnId: string;
  jobId: string;
  previousColumnId: string;
};

interface UseBoardDndArgs {
  columns: Column[];
  jobs: Job[];
  setColumns: Dispatch<SetStateAction<Column[]>>;
  setJobs: Dispatch<SetStateAction<Job[]>>;
  onDiscard: (job: Job) => void;
}

export function useBoardDnd({
  columns,
  jobs,
  setColumns,
  setJobs,
  onDiscard,
}: UseBoardDndArgs) {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [pendingNewColumn, setPendingNewColumn] =
    useState<PendingNewColumn | null>(null);

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

  const ghostInsertAt = useMemo(
    () =>
      columns[columns.length - 1]?.locked ? columns.length - 1 : columns.length,
    [columns],
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
      if (overId === "add-column-placeholder" && activeType === "card") {
        setDragPreview(null);
        return;
      }
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
            onDiscard(job);
          }
        } else if (over?.id === "add-column-placeholder") {
          if (pendingNewColumn) {
            setActiveDrag(null);
            setDragPreview(null);
            return;
          }
          const job = jobs.find((j) => j.id === active.id);
          if (!job) {
            setActiveDrag(null);
            setDragPreview(null);
            return;
          }
          const newId = newColumnId();
          const insertAt = ghostInsertAt;
          const previousColumnId = job.columnId;

          setColumns((prev) => {
            if (prev.length >= MAX_COLUMNS) return prev;
            const copy = [...prev];
            copy.splice(insertAt, 0, { id: newId, label: "", locked: false });
            return copy;
          });
          setJobs((prev) =>
            prev.map((j) => (j.id === job.id ? { ...j, columnId: newId } : j)),
          );
          setPendingNewColumn({
            columnId: newId,
            jobId: job.id,
            previousColumnId,
          });

          setActiveDrag(null);
          setDragPreview(null);
          return;
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
    [
      jobs,
      columns,
      dragPreview,
      pendingNewColumn,
      ghostInsertAt,
      onDiscard,
      setColumns,
      setJobs,
    ],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    setDragPreview(null);
  }, []);

  const handlePendingCancel = useCallback(
    (id: string) => {
      if (!pendingNewColumn || pendingNewColumn.columnId !== id) return;
      const { jobId, previousColumnId } = pendingNewColumn;
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, columnId: previousColumnId } : j,
        ),
      );
      setColumns((prev) => prev.filter((c) => c.id !== id));
      setPendingNewColumn(null);
    },
    [pendingNewColumn, setColumns, setJobs],
  );

  const addDisabled = columns.length >= MAX_COLUMNS;

  return {
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
  } as const;
}
