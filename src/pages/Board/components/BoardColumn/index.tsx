import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Inbox, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/pages/Board/components/JobCard";
import type { Column, Job } from "@/pages/Board/types";

interface BoardColumnProps {
  column: Column;
  jobs: Job[];
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onJobClick?: (job: Job) => void;
}

function BoardColumnComponent({
  column,
  jobs,
  onRename,
  onDelete,
  onJobClick,
}: BoardColumnProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.label);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", columnId: column.id },
    disabled: column.locked,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onRename(column.id, trimmed);
    } else {
      setDraft(column.label);
    }
    setEditing(false);
  };

  const cancelRename = () => {
    setDraft(column.label);
    setEditing(false);
  };

  const handleTrashClick = () => {
    if (jobs.length > 0) {
      setBlockDialogOpen(true);
    } else {
      setDeleteDialogOpen(true);
    }
  };

  const jobIds = useMemo(() => jobs.map((j) => j.id), [jobs]);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="relative flex-1 min-w-[272px] h-full min-h-0 bg-surface rounded-xl p-3 flex flex-col gap-3"
      >
        <div
          className={`group/header flex items-center gap-2 px-1 py-1 relative ${
            column.locked ? "" : "cursor-grab active:cursor-grabbing touch-none"
          }`}
          {...(column.locked ? {} : attributes)}
          {...(column.locked ? {} : listeners)}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelRename();
                }
              }}
              className="flex-1 min-w-0 bg-transparent text-xs font-medium uppercase tracking-wide text-primary outline-none border-b border-border-hover focus:border-purple px-0 py-0.5"
            />
          ) : (
            <span
              className={`text-xs font-medium uppercase tracking-wide text-muted select-none w-fit ${
                column.locked ? "" : "cursor-text"
              }`}
              onDoubleClick={() => {
                if (!column.locked) {
                  setDraft(column.label);
                  setEditing(true);
                }
              }}
            >
              {column.label}
            </span>
          )}
          <div className="ml-auto w-5 h-5 shrink-0 flex items-center justify-center">
            {column.locked || editing ? (
              <span className="w-full h-full rounded-full bg-overlay flex items-center justify-center text-xs text-muted tabular-nums">
                {jobs.length}
              </span>
            ) : (
              <>
                <span className="w-full h-full rounded-full bg-overlay flex items-center justify-center text-xs text-muted tabular-nums group-hover/header:hidden">
                  {jobs.length}
                </span>
                <button
                  type="button"
                  aria-label="Delete column"
                  onClick={handleTrashClick}
                  className="hidden group-hover/header:flex w-full h-full items-center justify-center text-muted hover:text-primary"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setDroppableRef}
            className={`flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 rounded-lg transition-colors ${
              isOver ? "bg-overlay/40" : ""
            }`}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={onJobClick ? () => onJobClick(job) : undefined}
              />
            ))}
            {jobs.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Inbox size={28} className="text-muted" />
                <span className="text-sm text-secondary">No applications yet</span>
                {column.id === "applied" && (
                  <span className="text-xs text-muted">
                    Analyze a job in Job Match to get started
                  </span>
                )}
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="bg-surface border border-border text-primary">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Cannot delete column
            </DialogTitle>
            <DialogDescription className="text-secondary">
              Move or discard the jobs in this column first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-border bg-transparent">
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-surface border border-border text-primary">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Delete "{column.label}"?
            </DialogTitle>
            <DialogDescription className="text-secondary">
              This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-border bg-transparent">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(column.id);
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const BoardColumn = memo(BoardColumnComponent);
