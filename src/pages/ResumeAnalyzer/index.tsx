import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  FileText,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FeatureSteps } from "@/components/FeatureSteps";
import { Stepper } from "@/components/Stepper";
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
  atsTips: [
    "Add 3–5 keywords from the job descriptions you target most",
    "Use a single-column layout — multi-column resumes break ATS parsers",
    "Save as .pdf with selectable text, not as a scanned image",
  ],
  suggestions: [
    "Add a 2–3 sentence professional summary above your experience",
    "Expand on your role at Acme Corp with specific metrics (users, latency, $)",
    "Mention any open-source contributions, talks, or side projects",
    "Group skills by category (Languages / Frameworks / Tooling) for clarity",
  ],
};

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

const STEPPER_STEPS = [
  { label: "Upload" },
  { label: "Analysis" },
  { label: "Your profile" },
];

function BulletList({
  items,
  dotClass,
}: {
  items: readonly string[];
  dotClass: string;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}
          />
          <span className="text-sm text-secondary leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-medium text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}

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
              <X size={14} /> Remove
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

function WhyThisMattersCard() {
  const bullets = [
    "This profile is used by Job Match to analyze how well you fit a role.",
    "The more accurate it is, the better your match scores will be.",
    "You can always come back and update it later.",
  ];
  return (
    <section className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <h2 className="text-xs uppercase text-muted tracking-widest">
        Why this matters
      </h2>
      <ul className="flex flex-col gap-3">
        {bullets.map((text) => (
          <li key={text} className="flex items-start gap-2.5">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-mid shrink-0" />
            <span className="text-sm text-secondary leading-relaxed">
              {text}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border mt-2 pt-3">
        <p className="text-xs text-muted leading-relaxed">
          <span className="text-primary font-medium">Tip:</span> mention your
          seniority level, main technologies, and the kind of roles you're
          looking for.
        </p>
      </div>
    </section>
  );
}

export function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [profileSummary, setProfileSummary] = useState(INITIAL_SUMMARY);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustText, setAdjustText] = useState("");
  const [reEvaluating, setReEvaluating] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const profileSectionRef = useRef<HTMLDivElement>(null);

  // Loading-overlay timing: cycle text every 600ms, advance to step 2 after 2.5s.
  useEffect(() => {
    if (!analyzing) return;
    const intervalId = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % ANALYSIS_LOADING_MESSAGES.length);
    }, 600);
    const timeoutId = setTimeout(() => {
      setAnalyzing(false);
      setCurrentStep(2);
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

  const handleStepClick = (step: number) => {
    if (step === 2 && currentStep === 3) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setCurrentStep(step as 1 | 2 | 3);
  };

  const handleContinueClick = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentStep(3);
      setTimeout(() => {
        profileSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl">
          Resume Analyzer
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mt-1">
          <p className="text-secondary">
            {currentStep === 1
              ? "Upload your resume and get AI-powered feedback instantly."
              : "Here's what we found."}
          </p>
          {(currentStep === 2 || currentStep === 3) && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs border border-teal/20 self-start md:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Analysis complete
            </span>
          )}
        </div>
      </div>

      <Stepper
        steps={STEPPER_STEPS}
        currentStep={currentStep}
        onClick={handleStepClick}
      />

      {currentStep === 1 && (
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

      {(currentStep === 2 || currentStep === 3) && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <SectionCard
              title="Summary"
              icon={<FileText size={16} className="text-muted" />}
            >
              <p className="text-sm text-secondary leading-relaxed">
                {MOCK_ANALYSIS.summary}
              </p>
            </SectionCard>

            <SectionCard
              title="ATS score"
              icon={<Activity size={16} className="text-purple-mid" />}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium text-purple-mid">
                  {MOCK_ANALYSIS.atsScore}
                </span>
                <span className="text-sm text-muted">/ 100</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-purple/10 text-purple-mid">
                  {MOCK_ANALYSIS.atsBadge}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-overlay overflow-hidden">
                <div
                  className="h-full bg-purple"
                  style={{ width: `${MOCK_ANALYSIS.atsScore}%` }}
                />
              </div>
              <BulletList
                items={MOCK_ANALYSIS.atsTips}
                dotClass="bg-purple/40"
              />
            </SectionCard>

            <SectionCard
              title="Strengths"
              icon={<CheckCircle size={16} className="text-teal" />}
            >
              <BulletList items={MOCK_ANALYSIS.strengths} dotClass="bg-teal" />
            </SectionCard>

            <SectionCard
              title="Weaknesses"
              icon={<AlertCircle size={16} className="text-[#D85A30]" />}
            >
              <BulletList
                items={MOCK_ANALYSIS.weaknesses}
                dotClass="bg-[#D85A30]"
              />
            </SectionCard>

            <SectionCard
              title="Attention points"
              icon={<AlertTriangle size={16} className="text-[#EF9F27]" />}
            >
              <BulletList
                items={MOCK_ANALYSIS.attentionPoints}
                dotClass="bg-[#EF9F27]"
              />
            </SectionCard>

            <SectionCard
              title="Suggestions"
              icon={<Plus size={16} className="text-purple" />}
            >
              <ol className="flex flex-col gap-2">
                {MOCK_ANALYSIS.suggestions.map((item, i) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-purple/15 text-purple-soft text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-secondary leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </div>

          <AnimatePresence>
            {currentStep === 3 && (
              <motion.div
                ref={profileSectionRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-8 pt-8 border-t border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-medium text-primary mb-1">
                        Your profile
                      </h2>
                      <p className="text-sm text-secondary mb-4">
                        This is what the AI understood about you. Confirm or
                        adjust before saving.
                      </p>
                    </div>
                    {!savedProfile && (
                      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
                        <p className="text-sm text-secondary leading-relaxed">
                          {profileSummary}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="default"
                            onClick={() => setSavedProfile(true)}
                          >
                            Looks good, save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setAdjustOpen((v) => !v)}
                          >
                            I want to adjust
                          </Button>
                        </div>
                        {adjustOpen && (
                          <div className="flex flex-col gap-3 mt-2">
                            <Textarea
                              value={adjustText}
                              onChange={(e) => setAdjustText(e.target.value)}
                              placeholder="Describe what you want to change or add..."
                              rows={4}
                              maxLength={500}
                              className="border border-border rounded-lg"
                            />
                            <Button
                              variant="default"
                              disabled={reEvaluating}
                              onClick={() => setReEvaluating(true)}
                              className="self-start"
                            >
                              {reEvaluating ? (
                                <>
                                  <Loader2
                                    size={16}
                                    className="animate-spin mr-2"
                                  />
                                  Re-evaluating...
                                </>
                              ) : (
                                "Re-evaluate"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {savedProfile && (
                      <div className="bg-surface border border-border rounded-xl p-8 text-center flex flex-col items-center">
                        <CheckCircle size={32} className="text-teal mb-3" />
                        <h2 className="text-lg font-medium text-primary">
                          Profile saved
                        </h2>
                        <p className="text-sm text-secondary mt-2">
                          You can now use Job Match to analyze job descriptions
                          against your profile.
                        </p>
                        <Button
                          variant="default"
                          className="mt-6"
                          onClick={() => navigate("/job-match")}
                        >
                          Go to Job Match
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <WhyThisMattersCard />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {(currentStep === 2 || currentStep === 3) && !analyzing && (
        <button
          type="button"
          onClick={handleContinueClick}
          className="fixed bottom-6 right-6 z-50 bg-purple text-primary px-5 py-3 rounded-full shadow-none flex items-center gap-2 hover:bg-purple-dark transition-colors"
        >
          {currentStep === 3 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {currentStep === 3 ? "Back to analysis" : "Review your profile"}
        </button>
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
    </div>
  );
}
