import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeatureSteps } from "@/components/FeatureSteps";
import { AIResumeVerdictCard } from "@/pages/ResumeAnalyzer/components/AIResumeVerdictCard";
import { StrengthsCard } from "@/pages/ResumeAnalyzer/components/StrengthsCard";
import { WeaknessesCard } from "@/pages/ResumeAnalyzer/components/WeaknessesCard";
import { AttentionPointsCard } from "@/pages/ResumeAnalyzer/components/AttentionPointsCard";
import { ATSScoreCard } from "@/pages/ResumeAnalyzer/components/ATSScoreCard";
import { TopSkillsCard } from "@/pages/ResumeAnalyzer/components/TopSkillsCard";
import { SuggestionsCard } from "@/pages/ResumeAnalyzer/components/SuggestionsCard";
import { cn } from "@/lib/utils";

const INITIAL_SUMMARY =
  "You are a senior frontend engineer with 5 years of experience in React and TypeScript. You have shipped production applications at scale, with a track record of quantified achievements. Your resume shows clear career progression but lacks soft skills and leadership context.";

const ADJUSTED_SUMMARY =
  "You are a senior frontend engineer with 5 years of experience in React and TypeScript, with additional context in team collaboration and cross-functional projects. You have shipped production applications at scale with quantified impact.";

const ANALYSIS_LOADING_MESSAGES = [
  "Reading your resume...",
  "Analyzing experience...",
  "Checking ATS compatibility...",
  "Preparing your feedback...",
];

const MOCK_ANALYSIS = {
  summary:
    "Your resume is well-structured with clear sections. It highlights 5 years of experience in frontend development with strong emphasis on React and TypeScript projects.",
  strengths: [
    "Strong technical skills section with relevant, current technologies",
    "Quantified achievements in past roles (revenue, traffic, performance gains)",
    "Clear career progression across 3 increasingly senior positions",
    "Good use of action verbs in role descriptions",
  ],
  weaknesses: [
    "No professional summary at the top — recruiters skim that first",
    "Some role descriptions are too brief to convey impact",
    "Missing soft skills and leadership / mentoring context",
  ],
  attentionPoints: [
    "Education section is sparse — consider adding relevant coursework or honors",
    "No mention of side projects or open-source work",
    "Tooling list is broad — risks looking generalist instead of specialized",
  ],
  atsScore: 72,
  atsBadge: "Good",
  atsExplanation:
    "Your resume is readable by most ATS systems. Adding more role-specific keywords and avoiding multi-column layouts would push this score higher.",
  suggestions: [
    "Add a 2–3 sentence professional summary above your experience",
    "Expand on your role at Acme Corp with specific metrics (users, latency, $)",
    "Mention any open-source contributions, talks, or side projects",
    "Group skills by category (Languages / Frameworks / Tooling) for clarity",
  ],
};

const MOCK_SKILLS = [
  { name: "React", level: 92 },
  { name: "TypeScript", level: 88 },
  { name: "Node.js", level: 65 },
  { name: "CSS / Tailwind", level: 80 },
  { name: "Testing", level: 55 },
  { name: "System design", level: 48 },
];

const WHAT_WE_ANALYZE_ITEMS = [
  {
    title: "Upload your PDF",
    description:
      "We read your resume securely. Nothing is stored without your permission.",
  },
  {
    title: "AI scans every section",
    description:
      "Experience, skills, achievements, formatting and ATS compatibility are all checked.",
  },
  {
    title: "Get your feedback",
    description:
      "Strengths, weaknesses, and actionable suggestions to improve your resume.",
  },
  {
    title: "Save your profile",
    description: "Confirm your AI-generated profile to unlock Job Match.",
  },
];

const WHAT_WE_ANALYZE_EXTRAS: Array<{
  label: string;
  color: "teal" | "coral" | "amber" | "purple";
}> = [
  { label: "Strengths & achievements", color: "teal" },
  { label: "Weaknesses & gaps", color: "coral" },
  { label: "Attention points", color: "amber" },
  { label: "ATS score & tips", color: "purple" },
];

function UploadZone({
  file,
  onFileSelected,
  onClearFile,
}: {
  file: File | null;
  onFileSelected: (file: File) => void;
  onClearFile: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.type === "application/pdf") {
        onFileSelected(dropped);
      }
    },
    [onFileSelected],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected && selected.type === "application/pdf") {
        onFileSelected(selected);
      }
    },
    [onFileSelected],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "w-full border-2 border-dashed rounded-xl flex items-center justify-center text-center transition-colors h-full min-h-[240px]",
          isDragging
            ? "border-purple bg-purple/10"
            : "border-border hover:border-purple/50",
        )}
      >
        {file ? (
          <div className="flex flex-col items-center gap-3 px-6">
            <FileText size={32} className="text-purple-mid" />
            <span className="text-sm font-medium text-primary truncate max-w-full">
              {file.name}
            </span>
            <button
              type="button"
              onClick={onClearFile}
              aria-label="Remove file"
              className="text-xs text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <X size={14} />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-3 px-6 py-10"
          >
            <Upload size={32} className="text-purple-mid" />
            <span className="text-sm font-medium text-primary">
              Drop your resume here or click to browse
            </span>
            <span className="text-xs text-muted">PDF only · max 10MB</span>
          </button>
        )}
      </div>
    </>
  );
}

type Phase = "upload" | "analysis";

export function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [profileSummary, setProfileSummary] = useState(INITIAL_SUMMARY);
  const [savedProfile, setSavedProfile] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustText, setAdjustText] = useState("");
  const [reEvaluating, setReEvaluating] = useState(false);

  // Loading-overlay timing: cycle text every 600ms, advance to analysis phase after 2.5s.
  useEffect(() => {
    if (!analyzing) return;
    const intervalId = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % ANALYSIS_LOADING_MESSAGES.length);
    }, 600);
    const timeoutId = setTimeout(() => {
      setAnalyzing(false);
      setPhase("analysis");
    }, 2500);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [analyzing]);

  const startAnalysis = useCallback(() => {
    setLoadingMessageIndex(0);
    setAnalyzing(true);
  }, []);

  // Re-evaluate timing: swap to adjusted summary after 1.5s and close the editor.
  useEffect(() => {
    if (!reEvaluating) return;
    const id = setTimeout(() => {
      setProfileSummary(ADJUSTED_SUMMARY);
      setReEvaluating(false);
      setAdjustOpen(false);
      setAdjustText("");
    }, 1500);
    return () => clearTimeout(id);
  }, [reEvaluating]);

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setAdjustOpen(false);
      setAdjustText("");
      setReEvaluating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">
            Resume Analyzer
          </h1>
          <p className="text-secondary mt-1">
            {phase === "upload"
              ? "Upload your resume and get AI-powered feedback instantly."
              : "Here's what we found."}
          </p>
        </div>
        {phase === "analysis" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            Confirm profile
          </Button>
        )}
      </div>

      {phase === "upload" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex-1">
              <UploadZone
                file={file}
                onFileSelected={setFile}
                onClearFile={() => setFile(null)}
              />
            </div>
            <Button
              variant="default"
              disabled={!file}
              onClick={startAnalysis}
              className="w-full h-11 text-base"
            >
              Analyze resume
            </Button>
          </div>
          <div className="md:col-span-1">
            <FeatureSteps
              title="What we analyze"
              items={WHAT_WE_ANALYZE_ITEMS}
              extras={WHAT_WE_ANALYZE_EXTRAS}
            />
          </div>
        </div>
      )}

      {phase === "analysis" && (
        <>
          <div className="flex md:hidden flex-col gap-4">
            <AIResumeVerdictCard verdict={MOCK_ANALYSIS.summary} delay={0} />
            <ATSScoreCard
              score={MOCK_ANALYSIS.atsScore}
              label={MOCK_ANALYSIS.atsBadge}
              description={MOCK_ANALYSIS.atsExplanation}
              delay={0.15}
            />
            <TopSkillsCard skills={MOCK_SKILLS} delay={0.3} />
            <StrengthsCard items={MOCK_ANALYSIS.strengths} delay={0.45} />
            <WeaknessesCard items={MOCK_ANALYSIS.weaknesses} delay={0.6} />
            <AttentionPointsCard
              items={MOCK_ANALYSIS.attentionPoints}
              delay={0.75}
            />
            <SuggestionsCard items={MOCK_ANALYSIS.suggestions} delay={0.9} />
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4">
            <AIResumeVerdictCard
              verdict={MOCK_ANALYSIS.summary}
              delay={0}
              className="md:col-span-2"
            />
            <StrengthsCard items={MOCK_ANALYSIS.strengths} delay={0.15} />
            <ATSScoreCard
              score={MOCK_ANALYSIS.atsScore}
              label={MOCK_ANALYSIS.atsBadge}
              description={MOCK_ANALYSIS.atsExplanation}
              delay={0.3}
            />
            <WeaknessesCard items={MOCK_ANALYSIS.weaknesses} delay={0.45} />
            <TopSkillsCard skills={MOCK_SKILLS} delay={0.6} />
            <AttentionPointsCard
              items={MOCK_ANALYSIS.attentionPoints}
              delay={0.75}
            />
            <SuggestionsCard items={MOCK_ANALYSIS.suggestions} delay={0.9} />
          </div>
        </>
      )}

      {analyzing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center max-w-sm text-center">
            <Loader2 size={32} className="animate-spin text-purple" />
            <p className="text-sm text-secondary mt-4 min-h-[20px]">
              {ANALYSIS_LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90dvh] overflow-y-auto flex flex-col gap-4">
          {!savedProfile && (
            <>
              <DialogHeader>
                <DialogTitle>Your profile</DialogTitle>
                <DialogDescription>
                  This is what the AI understood about you. Confirm or adjust
                  before saving.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-overlay border border-border rounded-xl p-4">
                <p className="text-sm text-secondary leading-relaxed">
                  {profileSummary}
                </p>
              </div>

              {!adjustOpen && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="default"
                    onClick={() => setSavedProfile(true)}
                  >
                    Looks good, save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAdjustOpen(true)}
                  >
                    I want to adjust
                  </Button>
                </div>
              )}

              {adjustOpen && (
                <div className="flex flex-col gap-3">
                  <Textarea
                    value={adjustText}
                    onChange={(e) => setAdjustText(e.target.value)}
                    placeholder="Describe what you want to change or add..."
                    rows={4}
                    maxLength={500}
                    className="border border-border rounded-lg"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      disabled={reEvaluating}
                      onClick={() => {
                        setAdjustOpen(false);
                        setAdjustText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      disabled={reEvaluating}
                      onClick={() => setReEvaluating(true)}
                    >
                      {reEvaluating && (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      )}
                      <span>
                        {reEvaluating ? "Re-evaluating..." : "Re-evaluate"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {savedProfile && (
            <div className="flex flex-col items-center text-center p-2">
              <CheckCircle size={32} className="text-teal mb-3" />
              <h2 className="text-lg font-medium text-primary">
                Profile saved
              </h2>
              <p className="text-sm text-secondary mt-2">
                You can now use Job Match to analyze job descriptions against
                your profile.
              </p>
              <Button
                variant="default"
                className="mt-6"
                onClick={() => {
                  setModalOpen(false);
                  navigate("/job-match");
                }}
              >
                Go to Job Match
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
