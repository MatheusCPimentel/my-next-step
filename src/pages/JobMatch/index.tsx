import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { JobDialog } from "@/components/JobDialog";
import { MOCK_RESULT, LOADING_MESSAGES, PITCH_TEXT } from "@/pages/JobMatch/mockData";
import { jobMatchSchema, type FormValues } from "@/pages/JobMatch/types";
import { JobMatchForm } from "@/pages/JobMatch/components/JobMatchForm";
import { JobMatchResult } from "@/pages/JobMatch/components/JobMatchResult";
import { ResumeAnalyzerGate } from "@/pages/JobMatch/components/ResumeAnalyzerGate";

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
    resolver: zodResolver(jobMatchSchema),
    defaultValues: { title: "", description: "", additionalContext: "" },
  });

  const descriptionValue = watch("description") ?? "";
  const additionalContextValue = watch("additionalContext") ?? "";
  const isDescriptionOverLimit = descriptionValue.length > 8000;
  const isAdditionalContextOverLimit = additionalContextValue.length > 1000;
  const isSubmitDisabled =
    isDescriptionOverLimit || isAdditionalContextOverLimit;

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
          <JobMatchForm
            titleBlock={titleBlock}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onValid={onValid}
            isSubmitDisabled={isSubmitDisabled}
          />
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
          <JobMatchResult
            titleBlock={titleBlock}
            onReset={handleReset}
            onAddToBoard={() => setDialogOpen(true)}
            pitchRef={pitchRef}
            showPitch={showPitch}
            pitchLoading={pitchLoading}
            pitchCopied={pitchCopied}
            onGeneratePitch={handleGeneratePitch}
            onCopyPitch={handleCopyPitch}
          />
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
        <ResumeAnalyzerGate
          onBypass={() => setHasCompletedResumeAnalyzer((v) => !v)}
          onAnalyzeResume={() => navigate("/resume")}
          onSkip={() => navigate("/")}
        />
      )}
    </div>
  );
}
