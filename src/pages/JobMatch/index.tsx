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
import { fitScoreClasses } from "@/lib/fitScore";
import type { Skill } from "@/pages/Board/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(8000, "Description must be under 8000 characters"),
});
type FormValues = z.infer<typeof schema>;

type Status = "idle" | "loading" | "done";

const MOCK_RESULT = {
  fitScore: 78,
  overallScore: 72,
  jobOverview:
    "Senior Frontend Engineer role focused on building scalable web products. Stack is React, TypeScript, and Node.js. Team is fully remote with async-first culture.",
  environmentSignals: [
    { type: "positive", text: "Remote-first, async culture, small team" },
    { type: "positive", text: "Low meeting culture" },
    { type: "warning", text: "Fast-paced environment mentioned twice" },
    { type: "warning", text: "On-call rotation implied" },
  ] as Array<{ type: "positive" | "warning" | "negative"; text: string }>,
  requiredSkills: [
    { name: "React", variant: "success" },
    { name: "TypeScript", variant: "success" },
    { name: "Node.js", variant: "warning" },
    { name: "GraphQL", variant: "danger" },
    { name: "AWS", variant: "danger" },
  ] satisfies Skill[],
  niceToHaveSkills: [
    { name: "Next.js", variant: "success" },
    { name: "Tailwind CSS", variant: "success" },
    { name: "Docker", variant: "warning" },
  ] satisfies Skill[],
  contractType: "Full-time",
  salary: "USD 120k-150k / year",
  benefits:
    "Health insurance, 401k matching, home office stipend, unlimited PTO",
  finalVerdict:
    "Good fit overall. You cover the core stack well (React + TypeScript), but Node.js is a gap and AWS/GraphQL are missing entirely. The environment looks healthy. Worth applying — address the backend gaps in your cover letter.",
};

const LOADING_MESSAGES = [
  "Reading job description...",
  "Identifying required skills...",
  "Calculating fit score...",
  "Assessing environment...",
  "Preparing your results...",
];

const PITCH_TEXT =
  "I am a strong fit for this role because of my deep experience with React and TypeScript, having shipped production applications used by thousands of users. While I am still growing my Node.js and AWS skills, I am a fast learner and have worked in similar full-stack environments before.";

function signalIconClass(type: "positive" | "warning" | "negative"): string {
  if (type === "positive") return "bg-teal/15 text-teal";
  if (type === "warning") return "bg-yellow-400/15 text-yellow-400";
  return "bg-red-500/15 text-red-500";
}

function SkillLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-teal" />{" "}
        Strong fit
      </span>
      <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-yellow-400" />{" "}
        Partial fit
      </span>
      <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-red-500" />{" "}
        Not a fit
      </span>
    </div>
  );
}

export function JobMatch() {
  const [status, setStatus] = useState<Status>("idle");
  const [showPitch, setShowPitch] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [submittedInput, setSubmittedInput] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });

  const descriptionValue = watch("description") ?? "";
  const isDescriptionOverLimit = descriptionValue.length > 8000;

  const onValid = (values: FormValues) => {
    setSubmittedInput({ title: values.title, description: values.description });
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
    reset({ title: "", description: "" });
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
  const fit = fitScoreClasses(MOCK_RESULT.fitScore);

  return (
    <div className="max-w-2xl mx-auto pb-10 flex flex-col gap-8">
      <div>
        <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">
          Job Match
        </h1>
        <p className="text-secondary mt-1">
          Paste a job description and find out how well it fits your profile.
        </p>
      </div>

      {status === "idle" && (
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
          <Button
            type="submit"
            disabled={isDescriptionOverLimit}
            className="bg-purple hover:bg-purple/90 text-primary w-full"
          >
            <Sparkles size={14} className="mr-2" /> Analyze
          </Button>
        </form>
      )}

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

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0 * 0.15 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-overlay rounded-lg p-4 flex flex-col items-start gap-2">
                <span
                  className={`text-5xl font-medium ${fit.text}`}
                >
                  {MOCK_RESULT.fitScore}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${fit.badge}`}
                >
                  {fit.label}
                </span>
                <span className="text-xs text-secondary uppercase tracking-widest">
                  Fit score
                </span>
              </div>
              <div className="bg-overlay rounded-lg p-4 flex flex-col items-start gap-2">
                <span className="text-4xl font-medium text-secondary">
                  {MOCK_RESULT.overallScore}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-border text-secondary">
                  Overall
                </span>
                <span className="text-xs text-secondary uppercase tracking-widest">
                  Combined score
                </span>
              </div>
            </div>
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
                      className={`flex-shrink-0 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-medium ${signalIconClass(s.type)}`}
                    >
                      {s.type === "positive" ? "+" : "!"}
                    </span>
                    <span className="leading-relaxed">{s.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 3 * 0.15 }}
          >
            <div className="flex flex-col gap-2">
              <span className={sectionLabel}>Required skills</span>
              <SkillLegend />
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
              <SkillLegend />
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
                      <span className="w-1 h-1 rounded-full bg-teal inline-block mr-2 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 7 * 0.15 }}
          >
            <div
              className={`bg-overlay rounded-lg p-4 flex flex-col gap-2 ${fit.border}`}
            >
              <span className={sectionLabel}>Final verdict</span>
              <p className="text-sm text-primary leading-relaxed">
                {MOCK_RESULT.finalVerdict}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 8 * 0.15 }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
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
          </motion.div>

          {showPitch && (
            <div className="bg-overlay rounded-lg p-4 text-sm text-primary leading-relaxed">
              {PITCH_TEXT}
            </div>
          )}
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
