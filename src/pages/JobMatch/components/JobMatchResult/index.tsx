import type { ReactNode, RefObject } from "react";
import {
  Check,
  Copy,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TagInput } from "@/components/TagInput";
import { SectionLabel } from "@/components/SectionLabel";
import { AIVerdictCard } from "@/components/AIVerdictCard";
import { ScoreCard } from "@/pages/JobMatch/components/ScoreCard";
import { StaggerItem } from "@/pages/JobMatch/components/StaggerItem";
import { MOCK_RESULT, PITCH_TEXT } from "@/pages/JobMatch/mockData";

interface JobMatchResultProps {
  titleBlock: ReactNode;
  onReset: () => void;
  onAddToBoard: () => void;
  pitchRef: RefObject<HTMLDivElement | null>;
  showPitch: boolean;
  pitchLoading: boolean;
  pitchCopied: boolean;
  onGeneratePitch: () => void;
  onCopyPitch: () => void;
}

export function JobMatchResult({
  titleBlock,
  onReset,
  onAddToBoard,
  pitchRef,
  showPitch,
  pitchLoading,
  pitchCopied,
  onGeneratePitch,
  onCopyPitch,
}: JobMatchResultProps) {
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
        onClick={onGeneratePitch}
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {titleBlock}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw size={16} className="mr-2" />
            <span>Analyze another job</span>
          </Button>
          <Button variant="default" size="sm" onClick={onAddToBoard}>
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
          <StaggerItem delay={0}>
            <ScoreCard
              opportunityScore={MOCK_RESULT.opportunityScore}
              fitScore={MOCK_RESULT.fitScore}
              environmentScore={MOCK_RESULT.environmentScore}
              opportunityDescription={MOCK_RESULT.opportunityDescription}
              environmentSignals={MOCK_RESULT.environmentSignals}
            />
          </StaggerItem>

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
                  onClick={onCopyPitch}
                  aria-label={
                    pitchCopied ? "Pitch copied" : "Copy pitch to clipboard"
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

          <StaggerItem delay={1 * 0.15}>
            <div className="bg-overlay rounded-lg p-4 flex flex-col gap-2">
              <SectionLabel>Job overview</SectionLabel>
              <p className="text-sm text-primary leading-relaxed">
                {MOCK_RESULT.jobOverview}
              </p>
            </div>
          </StaggerItem>
        </div>

        <div className="md:col-span-1 flex flex-col gap-6">
          <StaggerItem delay={3 * 0.15}>
            <div className="flex flex-col gap-2">
              <SectionLabel>Required skills</SectionLabel>
              <TagInput
                value={MOCK_RESULT.requiredSkills}
                onChange={() => {}}
                isEditable={false}
              />
            </div>
          </StaggerItem>

          <StaggerItem delay={4 * 0.15}>
            <div className="flex flex-col gap-2">
              <SectionLabel>Nice to have skills</SectionLabel>
              <TagInput
                value={MOCK_RESULT.niceToHaveSkills}
                onChange={() => {}}
                isEditable={false}
              />
            </div>
          </StaggerItem>

          <StaggerItem delay={5 * 0.15}>
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
          </StaggerItem>

          <StaggerItem delay={6 * 0.15}>
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
          </StaggerItem>
        </div>
      </div>
    </div>
  );
}
