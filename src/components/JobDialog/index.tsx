import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { TagInput } from "@/components/TagInput";
import { ExpandableValue } from "@/components/ExpandableValue";
import type { Job } from "@/pages/Board/types";

type Mode = "create" | "view" | "edit";

interface JobDialogProps {
  mode: Mode;
  job?: Job;
  columnId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (job: Job) => void;
}

const skillSchema = z.object({
  name: z.string(),
  variant: z.enum(["neutral", "success", "warning", "danger"]),
});

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requiredSkills: z
    .array(skillSchema)
    .min(1, "Add at least one required skill"),
  niceToHaveSkills: z.array(skillSchema),
  matchVerdict: z.string().optional(),
  contractType: z.string().optional(),
  salary: z.string().optional(),
  benefits: z.string().optional(),
  jobUrl: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function defaultsFromJob(job?: Job): FormValues {
  return {
    company: job?.company ?? "",
    title: job?.title ?? "",
    description: job?.description ?? "",
    requiredSkills: job?.requiredSkills ?? [],
    niceToHaveSkills: job?.niceToHaveSkills ?? [],
    matchVerdict: job?.matchVerdict ?? "",
    contractType: job?.contractType ?? "",
    salary: job?.salary ?? "",
    benefits: job?.benefits ?? "",
    jobUrl: job?.jobUrl ?? "",
    notes: job?.notes ?? "",
  };
}

function titleForMode(mode: Mode): string {
  if (mode === "create") return "Create job";
  if (mode === "edit") return "Edit job";
  return "Job details";
}

function descriptionForMode(mode: Mode): string {
  if (mode === "create") return "Add a new job to your board.";
  if (mode === "edit") return "Update the details for this job.";
  return "Review the details for this job.";
}

const generateJobId = () => Math.random().toString(36).slice(2, 10);

export function JobDialog(props: JobDialogProps) {
  const { mode, job, open, onOpenChange, onSubmit } = props;

  const [internalMode, setInternalMode] = useState<Mode>(mode);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInternalMode, setPrevInternalMode] = useState<Mode>(mode);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultsFromJob(job),
  });

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setInternalMode(mode);
      setPrevInternalMode(mode);
      reset(defaultsFromJob(job));
    }
  }

  if (prevInternalMode !== internalMode) {
    setPrevInternalMode(internalMode);
    reset(defaultsFromJob(job));
  }

  const isEditable = internalMode !== "view";

  const leftClass =
    internalMode === "view"
      ? "flex-[2] flex flex-col gap-4"
      : "flex-1 flex flex-col gap-4";
  const rightClass =
    internalMode === "view"
      ? "flex-[1] flex flex-col gap-4"
      : "flex-1 flex flex-col gap-4";

  const onValid = (values: FormValues) => {
    let submitted: Job;
    if (mode === "create") {
      const now = new Date().toISOString();
      submitted = {
        ...(props.job ?? {}),
        id: generateJobId(),
        columnId: props.columnId!,
        createdAt: now,
        updatedAt: now,
        stageHistory: [{ stage: "Applied", date: now }],
        ...values,
      };
    } else {
      submitted = { ...job!, ...values };
    }
    onSubmit(submitted);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (mode === "create") {
      onOpenChange(false);
    } else {
      reset(defaultsFromJob(job));
      setInternalMode("view");
    }
  };

  const fieldLabel = "text-xs text-secondary";
  const errorText = "text-red-500 text-xs";
  const valueText = "text-sm text-primary whitespace-pre-wrap";

  const renderValue = (value: string | undefined) =>
    value ? (
      <p className={valueText}>{value}</p>
    ) : (
      <p className={valueText}>
        <span className="text-muted">—</span>
      </p>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90dvh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
        <DialogHeader>
          <DialogTitle>{titleForMode(internalMode)}</DialogTitle>
          <DialogDescription>
            {descriptionForMode(internalMode)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          <div className={leftClass}>
            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>
                Company <span className="text-muted">*</span>
              </label>
              {isEditable ? (
                <>
                  <Input {...register("company")} placeholder="Company name" />
                  {errors.company && (
                    <p className={errorText}>{errors.company.message}</p>
                  )}
                </>
              ) : (
                renderValue(job?.company)
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>
                Title <span className="text-muted">*</span>
              </label>
              {isEditable ? (
                <>
                  <Input {...register("title")} placeholder="Job title" />
                  {errors.title && (
                    <p className={errorText}>{errors.title.message}</p>
                  )}
                </>
              ) : (
                renderValue(job?.title)
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>
                Description <span className="text-muted">*</span>
              </label>
              {isEditable ? (
                <>
                  <Textarea
                    {...register("description")}
                    placeholder="What is the role about?"
                    className="min-h-[200px] border border-border rounded-lg"
                  />
                  {errors.description && (
                    <p className={errorText}>{errors.description.message}</p>
                  )}
                </>
              ) : (
                <ExpandableValue value={job?.description} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Match verdict</label>
              {isEditable ? (
                <Textarea
                  {...register("matchVerdict")}
                  placeholder="Why is this a match?"
                  className="min-h-[80px] border border-border rounded-lg"
                />
              ) : (
                <ExpandableValue value={job?.matchVerdict} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Notes</label>
              {isEditable ? (
                <Textarea
                  {...register("notes")}
                  placeholder="Anything to remember"
                  className="min-h-[80px] border border-border rounded-lg"
                />
              ) : (
                <ExpandableValue value={job?.notes} />
              )}
            </div>
          </div>

          <div className={rightClass}>
            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>
                Required skills <span className="text-muted">*</span>
              </label>
              <Controller
                name="requiredSkills"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    isEditable={isEditable}
                    defaultVariant="neutral"
                    placeholder="Add a skill"
                  />
                )}
              />
              {isEditable && errors.requiredSkills && (
                <p className={errorText}>
                  {errors.requiredSkills.message as string}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Nice-to-have skills</label>
              {!isEditable && (job?.niceToHaveSkills?.length ?? 0) === 0 ? (
                <p className={valueText}>
                  <span className="text-muted">—</span>
                </p>
              ) : (
                <Controller
                  name="niceToHaveSkills"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      isEditable={isEditable}
                      defaultVariant="neutral"
                      placeholder="Add a skill"
                    />
                  )}
                />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Contract type</label>
              {isEditable ? (
                <Input
                  {...register("contractType")}
                  placeholder="Full-time, contract, etc."
                />
              ) : (
                renderValue(job?.contractType)
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Salary</label>
              {isEditable ? (
                <Input {...register("salary")} placeholder="Salary or range" />
              ) : (
                renderValue(job?.salary)
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Job URL</label>
              {isEditable ? (
                <Input {...register("jobUrl")} placeholder="https://..." />
              ) : (
                renderValue(job?.jobUrl)
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Benefits</label>
              {isEditable ? (
                <Textarea
                  {...register("benefits")}
                  placeholder="Health, equity, PTO..."
                  className="min-h-[80px] border border-border rounded-lg"
                />
              ) : (
                <ExpandableValue value={job?.benefits} />
              )}
            </div>
          </div>
        </div>

        {internalMode === "view" && (job?.stageHistory?.length ?? 0) > 0 && (
          <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2">
            <label className="text-xs text-secondary uppercase tracking-widest">
              History
            </label>
            <ol className="flex flex-col divide-y divide-border">
              {job!.stageHistory.map((entry, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-3 py-2"
                >
                  <span className="text-sm text-primary">{entry.stage}</span>
                  <span className="text-sm text-muted">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <DialogFooter className="border-t-0 bg-transparent mx-0 mb-0 p-0 sm:items-center">
          {internalMode !== "view" && (
            <span className="text-muted text-xs sm:mr-auto">
              * Required fields
            </span>
          )}
          {internalMode === "view" ? (
            <Button onClick={() => setInternalMode("edit")}>Edit</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit(onValid)}>Save</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
