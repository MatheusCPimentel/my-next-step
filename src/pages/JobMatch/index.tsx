import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  Copy,
  Info,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TagInput } from "@/components/TagInput";
import { JobDialog } from "@/components/JobDialog";
import { SectionLabel } from "@/components/SectionLabel";
import {
  MOCK_RESULT,
  LOADING_MESSAGES,
  PITCH_TEXT,
} from "@/pages/JobMatch/mockData";
import { ScoreCard } from "@/pages/JobMatch/components/ScoreCard";
import { Explainer } from "@/pages/JobMatch/components/Explainer";
import { AIVerdictCard } from "@/components/AIVerdictCard";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(8000, "Description must be under 8000 characters"),
  additionalContext: z
    .string()
    .max(1000, "Additional context must be under 1000 characters")
    .optional(),
});
type FormValues = z.infer<typeof schema>;

type Status = "idle" | "loading" | "done";

export function JobMatch() {
  const navigate = useNavigate();
  const [hasCompletedResumeAnalyzer, setHasCompletedResumeAnalyzer] =
    useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [showPitch, setShowPitch] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchCopied, setPitchCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [submittedInput, setSubmittedInput] = useState<{
    title: string;
    description: string;
    additionalContext: string;
  } | null>(null);
  const pitchRef = useRef<HTMLDivElement | null>(null);

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
  const additionalContextValue = watch("additionalContext") ?? "";
  const isDescriptionOverLimit = descriptionValue.length > 8000;
  const isAdditionalContextOverLimit = additionalContextValue.length > 1000;

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

  const handleCopyPitch = async () => {
    await navigator.clipboard.writeText(PITCH_TEXT);
    setPitchCopied(true);
  };

  useEffect(() => {
    if (!pitchCopied) return;
    const id = setTimeout(() => setPitchCopied(false), 2000);
    return () => clearTimeout(id);
  }, [pitchCopied]);

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

  useEffect(() => {
    if (!showPitch) return;
    pitchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showPitch]);

  const generateIcon = pitchLoading ? (
    <Loader2 size={16} className="animate-spin mr-2" />
  ) : showPitch ? (
    <Check size={14} className="mr-2" />
  ) : (
    <Sparkles size={14} className="mr-2" />
  );
  const generateLabel = pitchLoading
    ? "Generating..."
    : showPitch
      ? "Generated"
      : "Why am I a fit?";

  const generateActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pitchLoading || showPitch}
        onClick={handleGeneratePitch}
        className={showPitch ? "opacity-60 cursor-not-allowed" : undefined}
      >
        {generateIcon}
        <span>{generateLabel}</span>
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="What does this generate?"
            className="text-muted hover:text-primary transition-colors"
          >
            <Info size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          <p>
            Generates a personalized answer to the Why are you a good fit?
            question based on your profile and this job description. Ready to
            paste into any application form.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const titleBlock = (
    <div>
      <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">
        Job Match
      </h1>
      <p className="text-secondary mt-1">
        Paste a job description and find out how well it fits your profile.
      </p>
    </div>
  );

  return (
    <div className="relative">
      <div className="mx-auto w-full min-h-[calc(100vh-5rem)] pb-10 flex flex-col gap-8">
        {status === "idle" && (
          <>
            {titleBlock}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <div className="md:col-span-2 flex flex-col">
                <form
                  onSubmit={handleSubmit(onValid)}
                  className="flex-1 flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary">Job title</label>
                    <Input
                      placeholder="Senior Frontend Engineer at Acme"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-secondary">
                      Job description
                    </label>
                    <Textarea
                      maxLength={8000}
                      placeholder="Paste the full job description here..."
                      className="flex-1 min-h-[280px] border border-border rounded-lg"
                      error={errors.description?.message}
                      {...register("description")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary">
                      Additional context
                    </label>
                    <Textarea
                      maxLength={1000}
                      placeholder="Anything the job description doesn't cover — recruiter info, company culture impressions, why you're interested..."
                      className="min-h-[100px] border border-border rounded-lg"
                      error={errors.additionalContext?.message}
                      {...register("additionalContext")}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      isDescriptionOverLimit || isAdditionalContextOverLimit
                    }
                    className="w-full h-11 text-base"
                  >
                    <Sparkles size={14} className="mr-2" />
                    <span>Analyze</span>
                  </Button>
                </form>
              </div>
              <Explainer />
            </div>
          </>
        )}

        {status === "loading" && (
          <>
            {titleBlock}
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
              <Loader2 size={32} className="animate-spin text-purple" />
              <span className="text-secondary text-sm">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </span>
            </div>
          </>
        )}

        {status === "done" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {titleBlock}
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw size={16} className="mr-2" />
                  <span>Analyze another job</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  Add to Board
                </Button>
              </div>
            </div>

            <AIVerdictCard
              title="AI Final Verdict"
              verdict={MOCK_RESULT.finalVerdict}
              action={MOCK_RESULT.fitScore >= 60 ? generateActions : undefined}
            />

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
                    environmentSignals={MOCK_RESULT.environmentSignals}
                  />
                </motion.div>

                <AnimatePresence>
                  {showPitch && (
                    <motion.div
                      key="pitch"
                      ref={pitchRef}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="relative bg-overlay rounded-lg p-4 border-l-2 border-purple/40"
                    >
                      <span className="absolute top-2 left-3 text-4xl text-purple/40 font-serif leading-none">
                        “
                      </span>

                      <button
                        type="button"
                        onClick={handleCopyPitch}
                        aria-label={
                          pitchCopied
                            ? "Pitch copied"
                            : "Copy pitch to clipboard"
                        }
                        className="absolute bottom-3 right-4 transition-colors"
                      >
                        {pitchCopied ? (
                          <Check size={16} className="text-teal" />
                        ) : (
                          <Copy
                            size={16}
                            className="text-muted hover:text-primary"
                          />
                        )}
                      </button>
                      <p className="px-5 font-serif italic text-base text-primary leading-relaxed">
                        {PITCH_TEXT}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 1 * 0.15 }}
                >
                  <div className="bg-overlay rounded-lg p-4 flex flex-col gap-2">
                    <SectionLabel>Job overview</SectionLabel>
                    <p className="text-sm text-primary leading-relaxed">
                      {MOCK_RESULT.jobOverview}
                    </p>
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
                    <SectionLabel>Required skills</SectionLabel>
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
                    <SectionLabel>Nice to have skills</SectionLabel>
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
                  <div className="bg-overlay rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1 pb-4 border-b border-border">
                      <SectionLabel tone="muted">Salary</SectionLabel>
                      <span className="text-lg font-medium text-primary">
                        {MOCK_RESULT.salary}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <SectionLabel tone="muted">Contract type</SectionLabel>
                        <span className="text-sm font-medium text-primary">
                          {MOCK_RESULT.contractType}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <SectionLabel tone="muted">Work type</SectionLabel>
                        <span className="text-sm font-medium text-primary">
                          {MOCK_RESULT.workType}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 6 * 0.15 }}
                >
                  <div className="bg-overlay rounded-lg p-4 flex flex-col gap-2">
                    <SectionLabel>Benefits</SectionLabel>
                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
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

      {!hasCompletedResumeAnalyzer && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-background/60 flex items-center justify-center px-3">
          <button
            type="button"
            onClick={() => setHasCompletedResumeAnalyzer((v) => !v)}
            className="absolute top-4 left-4 text-xs text-muted hover:text-primary transition-colors"
          >
            Dev: bypass gate
          </button>
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 max-w-sm text-center">
            <Lock size={32} className="text-muted mb-4 mx-auto" />
            <h2 className="text-lg font-medium text-primary">
              Analyze your resume first
            </h2>
            <p className="text-sm text-secondary mt-2">
              To get accurate job match results, we need to understand your
              profile first. Complete the Resume Analyzer and we'll take care of
              the rest.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button variant="default" onClick={() => navigate("/resume")}>
                Analyze my resume
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-sm text-muted border-0"
              >
                I'll do this later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
