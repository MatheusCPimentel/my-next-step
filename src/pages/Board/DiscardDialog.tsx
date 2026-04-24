import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Column } from "@/pages/Board/types";

export type DiscardOption =
  | { kind: "discard" }
  | { kind: "rejected"; stageId: string };

interface DiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobCompany: string;
  columns: Column[];
  onConfirm: (option: DiscardOption) => void;
}

export function DiscardDialog({
  open,
  onOpenChange,
  jobCompany,
  columns,
  onConfirm,
}: DiscardDialogProps) {
  const [step, setStep] = useState<"choose" | "stage">("choose");
  const visibleStages = columns.filter((c) => !c.locked);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep("choose");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface border border-border text-primary">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {step === "choose"
              ? `Remove ${jobCompany}?`
              : "Which stage were you rejected at?"}
          </DialogTitle>
          <DialogDescription className="text-secondary">
            {step === "choose"
              ? "Choose how to archive this job. Rejected will capture the stage for LevelUp."
              : "Pick the stage where the rejection happened."}
          </DialogDescription>
        </DialogHeader>

        {step === "choose" ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => onConfirm({ kind: "discard" })}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-overlay hover:bg-overlay/80 p-4 text-left transition-colors"
            >
              <span className="text-sm font-medium text-primary">Discard</span>
              <span className="text-xs text-muted">
                No longer interested or found something better.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStep("stage")}
              className="flex flex-col items-start gap-1 rounded-lg border border-purple/40 bg-purple/15 hover:bg-purple/20 p-4 text-left transition-colors"
            >
              <span className="text-sm font-medium text-purple">Rejected</span>
              <span className="text-xs text-purple/80">
                Failed at a stage. We'll capture which one.
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {visibleStages.length === 0 ? (
              <p className="text-xs text-muted">
                No interview stages yet. Add a stage before discarding as rejected.
              </p>
            ) : (
              visibleStages.map((column) => (
                <button
                  key={column.id}
                  type="button"
                  onClick={() =>
                    onConfirm({ kind: "rejected", stageId: column.id })
                  }
                  className="flex items-center justify-between rounded-lg border border-border bg-overlay hover:bg-overlay/80 px-4 py-3 text-left transition-colors"
                >
                  <span className="text-sm text-primary">{column.label}</span>
                  <span className="text-xs text-muted">Select</span>
                </button>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
