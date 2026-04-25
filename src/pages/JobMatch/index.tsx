import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/TagInput";
import { JobDialog } from "@/components/JobDialog";
import {
  MOCK_RESULT,
  LOADING_MESSAGES,
  PITCH_TEXT,
} from "@/pages/JobMatch/mockData";
import { signalDotClass } from "@/pages/JobMatch/helpers";
import { ScoreCard } from "@/pages/JobMatch/components/ScoreCard";
import { Explainer } from "@/pages/JobMatch/components/Explainer";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(8000, "Description must be under 8000 characters"),
  additionalContext: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

type Status = "idle" | "loading" | "done";

export function JobMatch() {
  const [status, setStatus] = useState<Status>("idle");
  const [showPitch, setShowPitch] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [submittedInput, setSubmittedInput] = useState<{
    title: string;
    description: string;
    additionalContext: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", additionalContext: "" },
  });

  const descriptionValue = watch("description") ?? "";
  const isDescriptionOverLimit = descriptionValue.length > 8000;

  const onValid = (values: FormValues) => {
    setSubmittedInput({
      title: values.title,
      description: values.description,
      additionalContext: values.additionalContext ?? "",
    });
    setShowPitch(false);
    setPitchLoading(false);
    setStatus("loading");
  };

  const handleGeneratePitch = () => {
    setPitchLoading(true);
  };

  const handleReset = () => {
    setStatus("idle");
    setShowPitch(false);
    setPitchLoading(false);
    setSubmittedInput(null);
    reset({ title: "", description: "", additionalContext: "" });
  };

  useEffect(() => {
    if (status !== "loading") return;
    const id = setTimeout(() => setStatus("done"), 1500);
    return () => clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (status !== "loading") {
      setLoadingMessageIndex(0);
      return;
    }
    const id = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 600);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (!pitchLoading) return;
    const id = setTimeout(() => {
      setPitchLoading(false);
      setShowPitch(true);
    }, 1000);
    return () => clearTimeout(id);
  }, [pitchLoading]);

  const sectionLabel = "text-xs text-secondary uppercase tracking-widest";

  const titleBlock = (
    <div>
      <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">Job Match</h1>
      <p className="text-secondary mt-1">
        Paste a job description and find out how well it fits your profile.
      </p>
    </div>
  );

  return (
    <div className="mx-auto w-full pb-10 flex flex-col gap-8">
      {status === "idle" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            {titleBlock}
            <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary">Job title</label>
                <Input
                  placeholder="Senior Frontend Engineer at Acme"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs">{errors.title.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary">Job description</label>
                <Textarea
                  maxLength={8000}
                  placeholder="Paste the full job description here..."
                  className="min-h-[240px] border border-border rounded-lg"
                  error={errors.description?.message}
                  {...register("description")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary">Additional context</label>
                <Textarea
                  placeholder="Anything the job description doesn't cover — recruiter info, company culture impressions, why you're interested..."
                  className="min-h-[80px] border border-border rounded-lg"
                  {...register("additionalContext")}
                />
              </div>
              <Button
                type="submit"
                disabled={isDescriptionOverLimit}
                className="bg-purple hover:bg-purple/90 text-primary w-full"
              >
                <Sparkles size={14} className="mr-2" /> Analyze
              </Button>
            </form>
          </div>
          <Explainer />
        </div>
      )}

      {status !== "idle" && titleBlock}

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <Loader2 size={32} className="animate-spin text-purple" />
          <span className="text-secondary text-sm">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </span>
        </div>
      )}

      {status === "done" && (
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-fit border border-border-hover bg-transparent text-primary hover:bg-overlay"
          >
            Analyze another job
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <div className="md:col-span-2 flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0 }}
              >
                <ScoreCard
                  opportunityScore={MOCK_RESULT.opportunityScore}
                  fitScore={MOCK_RESULT.fitScore}
                  environmentScore={MOCK_RESULT.environmentScore}
                  opportunityDescription={MOCK_RESULT.opportunityDescription}
                  finalVerdict={MOCK_RESULT.finalVerdict}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 1 * 0.15 }}
              >
                <div className="bg-overlay rounded-lg p-4 flex flex-col gap-2">
                  <span className={sectionLabel}>Job overview</span>
                  <p className="text-sm text-primary leading-relaxed">
                    {MOCK_RESULT.jobOverview}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 2 * 0.15 }}
              >
                <div className="bg-overlay rounded-lg p-4 flex flex-col gap-3">
                  <span className={sectionLabel}>Environment assessment</span>
                  <ul className="flex flex-col gap-2">
                    {MOCK_RESULT.environmentSignals.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-primary"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${signalDotClass(s.type)}`}
                        />
                        <span className="leading-relaxed">{s.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-1 flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 3 * 0.15 }}
              >
                <div className="flex flex-col gap-2">
                  <span className={sectionLabel}>Required skills</span>
                  <TagInput
                    value={MOCK_RESULT.requiredSkills}
                    onChange={() => {}}
                    isEditable={false}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 4 * 0.15 }}
              >
                <div className="flex flex-col gap-2">
                  <span className={sectionLabel}>Nice to have skills</span>
                  <TagInput
                    value={MOCK_RESULT.niceToHaveSkills}
                    onChange={() => {}}
                    isEditable={false}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 5 * 0.15 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-overlay rounded-lg p-3 flex flex-col gap-1">
                    <span className="text-xs text-secondary uppercase tracking-widest">
                      Contract type
                    </span>
                    <span className="text-sm text-primary font-medium">
                      {MOCK_RESULT.contractType}
                    </span>
                  </div>
                  <div className="bg-overlay rounded-lg p-3 flex flex-col gap-1">
                    <span className="text-xs text-secondary uppercase tracking-widest">
                      Salary
                    </span>
                    <span className="text-sm text-primary font-medium">
                      {MOCK_RESULT.salary}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 6 * 0.15 }}
              >
                <div className="bg-overlay rounded-lg p-4 flex flex-col gap-2">
                  <span className={sectionLabel}>Benefits</span>
                  <ul className="flex flex-col gap-1">
                    {MOCK_RESULT.benefits
                      .split(",")
                      .map((b) => b.trim())
                      .filter(Boolean)
                      .map((b) => (
                        <li
                          key={b}
                          className="flex items-center text-sm text-primary"
                        >
                          <span className="w-1 h-1 rounded-full bg-muted inline-block mr-2 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="mt-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 7 * 0.15 }}
          >
            <div className="flex gap-2">
              {MOCK_RESULT.fitScore >= 60 && (
                <Button
                  variant="ghost"
                  disabled={pitchLoading}
                  onClick={handleGeneratePitch}
                  className="border border-border-hover bg-transparent text-primary hover:bg-overlay"
                >
                  {pitchLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-2" /> Generate why I am
                      a great fit
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-purple hover:bg-purple/90 text-primary"
              >
                Add to Board
              </Button>
            </div>
            {showPitch && (
              <div className="bg-overlay rounded-lg p-4 text-sm text-primary leading-relaxed">
                {PITCH_TEXT}
              </div>
            )}
          </motion.div>
        </div>
      )}

      <JobDialog
        mode="create"
        columnId="applied"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={() => setDialogOpen(false)}
        job={{
          id: "",
          columnId: "applied",
          company: "",
          title: submittedInput?.title ?? "",
          description: submittedInput?.description ?? "",
          matchVerdict: MOCK_RESULT.finalVerdict,
          requiredSkills: MOCK_RESULT.requiredSkills.map((s) => ({
            name: s.name,
            variant: "neutral",
          })),
          niceToHaveSkills: MOCK_RESULT.niceToHaveSkills.map((s) => ({
            name: s.name,
            variant: "neutral",
          })),
          contractType: MOCK_RESULT.contractType,
          salary: MOCK_RESULT.salary,
          benefits: MOCK_RESULT.benefits,
          fromJobMatch: true,
          fitScore: MOCK_RESULT.fitScore,
          createdAt: "",
          updatedAt: "",
          stageHistory: [],
        }}
      />
    </div>
  );
}
