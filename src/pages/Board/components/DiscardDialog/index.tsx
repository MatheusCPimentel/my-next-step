import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Column } from "@/pages/Board/types";

export type InterviewQuestion = { question: string; answer: string };
export type DiscardOption =
  | { kind: "discard" }
  | { kind: "rejected"; stageId: string; questions: InterviewQuestion[] };

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
  const [step, setStep] = useState<"choose" | "stage" | "debrief">("choose");
  const [stageId, setStageId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setStep("choose");
      setStageId(null);
      setQuestions([]);
      setShowErrors(false);
    }
  }

  const visibleStages = columns.filter((c) => !c.locked);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const addQuestion = () => {
    if (questions.length >= 8) return;
    setQuestions((prev) => [...prev, { question: "", answer: "" }]);
  };

  const updateQuestion = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const hasInvalid = questions.some(
      (q) => !q.question.trim() || !q.answer.trim(),
    );
    if (hasInvalid) {
      setShowErrors(true);
      return;
    }
    if (!stageId) return;
    onConfirm({ kind: "rejected", stageId, questions });
  };

  const title =
    step === "choose"
      ? `Remove ${jobCompany}?`
      : step === "stage"
        ? "Which stage were you rejected at?"
        : "What went wrong?";

  const description =
    step === "choose"
      ? "Choose how to archive this job. Rejected will capture the stage for LevelUp."
      : step === "stage"
        ? "Pick the stage where the rejection happened."
        : "Optional. Adding questions helps you improve later in LevelUp. Skip if you don't want to add anything.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
              className="flex flex-col items-start gap-1 rounded-lg border border-purple bg-purple hover:bg-purple/90 p-4 text-left transition-colors"
            >
              <span className="text-sm font-medium text-primary">Rejected</span>
              <span className="text-xs text-primary/80">
                Failed at a stage. We'll capture which one.
              </span>
            </button>
          </div>
        ) : step === "stage" ? (
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
                  onClick={() => {
                    setStageId(column.id);
                    setStep("debrief");
                  }}
                  className="flex items-center justify-between rounded-lg border border-border bg-overlay hover:bg-overlay/80 px-4 py-3 text-left transition-colors"
                >
                  <span className="text-sm text-primary">{column.label}</span>
                  <span className="text-xs text-muted">Select</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-overlay p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start gap-2">
                    <Input
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(index, "question", e.target.value)
                      }
                      placeholder="Question they asked"
                      aria-invalid={
                        showErrors && !q.question.trim() ? true : undefined
                      }
                      className="flex-1 border-b-0"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      aria-label="Remove question"
                      className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="border-b border-border" />
                  <Textarea
                    value={q.answer}
                    onChange={(e) =>
                      updateQuestion(index, "answer", e.target.value)
                    }
                    placeholder="What should the answer have been?"
                    maxLength={500}
                    aria-invalid={
                      showErrors && !q.answer.trim() ? true : undefined
                    }
                  />
                </div>
              ))}
            </div>
            {questions.length < 8 && (
              <button
                type="button"
                onClick={addQuestion}
                className="self-start inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
              >
                <Plus size={14} />
                <span>Add question</span>
              </button>
            )}
            <DialogFooter className="sm:items-center">
              {showErrors &&
                questions.some(
                  (q) => !q.question.trim() || !q.answer.trim(),
                ) && (
                  <p className="text-red-500 text-xs sm:mr-auto">
                    Please fill in all fields before confirming
                  </p>
                )}
              <Button onClick={handleConfirm}>Confirm</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
