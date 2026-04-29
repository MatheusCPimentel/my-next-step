import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, renderHook } from "@testing-library/react";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useBoardDnd } from "@/pages/Board/useBoardDnd";
import { INITIAL_COLUMNS, INITIAL_JOBS } from "@/pages/Board/mockData";
import type { Column, Job } from "@/pages/Board/types";

function dragStartEvent(
  id: string,
  type: "card" | "column",
): DragStartEvent {
  return {
    active: {
      id,
      data: { current: { type } },
    },
  } as unknown as DragStartEvent;
}

function dragOverEvent(
  activeId: string,
  overId: string,
  type: "card" | "column" = "card",
): DragOverEvent {
  return {
    active: {
      id: activeId,
      data: { current: { type } },
    },
    over: {
      id: overId,
    },
  } as unknown as DragOverEvent;
}

function dragEndEvent(
  activeId: string,
  overId: string | null,
  type: "card" | "column" = "card",
): DragEndEvent {
  return {
    active: {
      id: activeId,
      data: { current: { type } },
    },
    over: overId ? { id: overId } : null,
  } as unknown as DragEndEvent;
}

interface UseHarnessArgs {
  initialColumns?: Column[];
  initialJobs?: Job[];
  onDiscard?: (job: Job) => void;
}

function useHarness({
  initialColumns,
  initialJobs,
  onDiscard = vi.fn(),
}: UseHarnessArgs = {}) {
  const [columns, setColumns] = useState<Column[]>(
    initialColumns ?? INITIAL_COLUMNS,
  );
  const [jobs, setJobs] = useState<Job[]>(initialJobs ?? INITIAL_JOBS);
  const dnd = useBoardDnd({
    columns,
    jobs,
    setColumns,
    setJobs,
    onDiscard,
  });
  return { columns, jobs, ...dnd };
}

describe("useBoardDnd", () => {
  describe("jobsByColumn", () => {
    it("returns the baseline map when there is no active drag", () => {
      const { result } = renderHook(() => useHarness());

      const map = result.current.jobsByColumn;
      expect(map.get("applied")?.map((j) => j.id)).toEqual(["1", "2", "3"]);
      expect(map.get("hr_interview")?.map((j) => j.id)).toEqual(["4", "5"]);
      expect(map.get("technical_interview")?.map((j) => j.id)).toEqual(["6"]);
      expect(map.get("offer")?.map((j) => j.id)).toEqual(["7"]);
    });

    it("reflects an in-column reorder preview when source and target column match", () => {
      const { result } = renderHook(() => useHarness());

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragOver(dragOverEvent("1", "3"));
      });

      const applied = result.current.jobsByColumn.get("applied");
      // Job 1 should now sit before job 3 in applied
      expect(applied?.map((j) => j.id)).toEqual(["2", "1", "3"]);
    });

    it("reflects a cross-column move preview and removes the job from the source column", () => {
      const { result } = renderHook(() => useHarness());

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragOver(dragOverEvent("1", "5"));
      });

      const applied = result.current.jobsByColumn.get("applied");
      const hr = result.current.jobsByColumn.get("hr_interview");

      expect(applied?.map((j) => j.id)).toEqual(["2", "3"]);
      expect(hr?.map((j) => j.id)).toEqual(["4", "1", "5"]);
    });
  });

  describe("handleDragEnd — discard", () => {
    it("calls onDiscard with the dragged job when over.id === 'discard'", () => {
      const onDiscard = vi.fn();
      const { result } = renderHook(() => useHarness({ onDiscard }));

      act(() => {
        result.current.handleDragStart(dragStartEvent("4", "card"));
      });
      act(() => {
        result.current.handleDragEnd(dragEndEvent("4", "discard"));
      });

      expect(onDiscard).toHaveBeenCalledTimes(1);
      const job = onDiscard.mock.calls[0][0] as Job;
      expect(job.id).toBe("4");
    });
  });

  describe("handleDragEnd — add-column-placeholder", () => {
    it("creates a new column at ghostInsertAt, re-parents the dragged job, and sets pendingNewColumn", () => {
      const { result } = renderHook(() => useHarness());

      const initialLength = result.current.columns.length;
      const insertAt = result.current.ghostInsertAt;

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragEnd(
          dragEndEvent("1", "add-column-placeholder"),
        );
      });

      expect(result.current.columns).toHaveLength(initialLength + 1);
      const created = result.current.columns[insertAt];
      expect(created.locked).toBe(false);
      expect(created.label).toBe("");
      expect(result.current.pendingNewColumn).not.toBeNull();
      expect(result.current.pendingNewColumn?.columnId).toBe(created.id);
      expect(result.current.pendingNewColumn?.jobId).toBe("1");
      expect(result.current.pendingNewColumn?.previousColumnId).toBe("applied");

      // Job should now be in the new column
      const movedJob = result.current.jobs.find((j) => j.id === "1");
      expect(movedJob?.columnId).toBe(created.id);
    });

    it("is a no-op when pendingNewColumn is already set (second drop)", () => {
      const { result } = renderHook(() => useHarness());

      // First drop creates the pending column
      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragEnd(
          dragEndEvent("1", "add-column-placeholder"),
        );
      });

      const lengthAfterFirstDrop = result.current.columns.length;
      const pendingAfterFirst = result.current.pendingNewColumn;

      // Second drop on the placeholder while pending
      act(() => {
        result.current.handleDragStart(dragStartEvent("2", "card"));
      });
      act(() => {
        result.current.handleDragEnd(
          dragEndEvent("2", "add-column-placeholder"),
        );
      });

      // No new column added, pending unchanged
      expect(result.current.columns).toHaveLength(lengthAfterFirstDrop);
      expect(result.current.pendingNewColumn).toBe(pendingAfterFirst);
      // Job 2 should not have been re-parented
      const job2 = result.current.jobs.find((j) => j.id === "2");
      expect(job2?.columnId).toBe("applied");
    });
  });

  describe("handleDragEnd — stage history", () => {
    it("appends a stage history entry for a cross-column move", () => {
      const { result } = renderHook(() => useHarness());

      const before = result.current.jobs.find((j) => j.id === "1")!;
      const beforeHistoryLength = before.stageHistory.length;

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragOver(dragOverEvent("1", "5"));
      });
      act(() => {
        result.current.handleDragEnd(dragEndEvent("1", "5"));
      });

      const after = result.current.jobs.find((j) => j.id === "1")!;
      expect(after.columnId).toBe("hr_interview");
      expect(after.stageHistory).toHaveLength(beforeHistoryLength + 1);
      expect(after.stageHistory[after.stageHistory.length - 1].stage).toBe(
        "HR Interview",
      );
    });

    it("does not append a stage history entry for a same-column reorder", () => {
      const { result } = renderHook(() => useHarness());

      const before = result.current.jobs.find((j) => j.id === "1")!;
      const beforeHistoryLength = before.stageHistory.length;
      const beforeUpdatedAt = before.updatedAt;

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragOver(dragOverEvent("1", "3"));
      });
      act(() => {
        result.current.handleDragEnd(dragEndEvent("1", "3"));
      });

      const after = result.current.jobs.find((j) => j.id === "1")!;
      expect(after.stageHistory).toHaveLength(beforeHistoryLength);
      expect(after.updatedAt).toBe(beforeUpdatedAt);
    });
  });

  describe("handleDragEnd — column reorder", () => {
    it("swaps two non-locked columns when the user reorders them", () => {
      const { result } = renderHook(() => useHarness());

      const beforeOrder = result.current.columns.map((c) => c.id);
      // hr_interview at index 1, technical_interview at index 2 — both unlocked
      expect(beforeOrder).toEqual([
        "applied",
        "hr_interview",
        "technical_interview",
        "offer",
      ]);

      act(() => {
        result.current.handleDragStart(
          dragStartEvent("technical_interview", "column"),
        );
      });
      act(() => {
        result.current.handleDragEnd(
          dragEndEvent("technical_interview", "hr_interview", "column"),
        );
      });

      expect(result.current.columns.map((c) => c.id)).toEqual([
        "applied",
        "technical_interview",
        "hr_interview",
        "offer",
      ]);
    });

    it("refuses to swap when either side is locked", () => {
      const { result } = renderHook(() => useHarness());

      const before = result.current.columns.map((c) => c.id);

      act(() => {
        result.current.handleDragStart(dragStartEvent("applied", "column"));
      });
      act(() => {
        result.current.handleDragEnd(
          dragEndEvent("applied", "hr_interview", "column"),
        );
      });

      expect(result.current.columns.map((c) => c.id)).toEqual(before);
    });
  });

  describe("handlePendingCancel", () => {
    it("reverts the job's columnId and removes the pending column", () => {
      const { result } = renderHook(() => useHarness());

      const initialLength = result.current.columns.length;

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragEnd(
          dragEndEvent("1", "add-column-placeholder"),
        );
      });

      const pendingId = result.current.pendingNewColumn!.columnId;

      act(() => {
        result.current.handlePendingCancel(pendingId);
      });

      expect(result.current.pendingNewColumn).toBeNull();
      expect(result.current.columns).toHaveLength(initialLength);
      const job = result.current.jobs.find((j) => j.id === "1");
      expect(job?.columnId).toBe("applied");
    });
  });

  describe("addDisabled", () => {
    it("flips to true at the 20-column cap", () => {
      const baseColumns: Column[] = Array.from({ length: 20 }, (_, i) => ({
        id: `c${i}`,
        label: `C${i}`,
        locked: i === 0 || i === 19,
      }));

      const { result } = renderHook(() =>
        useHarness({ initialColumns: baseColumns, initialJobs: [] }),
      );

      expect(result.current.addDisabled).toBe(true);
    });

    it("is false when below the cap", () => {
      const { result } = renderHook(() => useHarness());
      expect(result.current.addDisabled).toBe(false);
    });
  });

  describe("handleDragCancel", () => {
    it("clears activeDrag and dragPreview", () => {
      const { result } = renderHook(() => useHarness());

      act(() => {
        result.current.handleDragStart(dragStartEvent("1", "card"));
      });
      act(() => {
        result.current.handleDragOver(dragOverEvent("1", "3"));
      });

      expect(result.current.activeDrag).not.toBeNull();
      // dragPreview is reflected in jobsByColumn order — confirm it's active
      expect(result.current.jobsByColumn.get("applied")?.[0].id).toBe("2");

      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.activeDrag).toBeNull();
      // Without a preview, the baseline order is restored
      expect(result.current.jobsByColumn.get("applied")?.map((j) => j.id))
        .toEqual(["1", "2", "3"]);
    });
  });

});
