import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, RotateCcw } from "lucide-react";
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
import { UploadZone } from "@/pages/ResumeAnalyzer/components/UploadZone";
import {
  ADJUSTED_SUMMARY,
  ANALYSIS_LOADING_MESSAGES,
  INITIAL_SUMMARY,
  MOCK_ANALYSIS,
  MOCK_SKILLS,
  WHAT_WE_ANALYZE_EXTRAS,
  WHAT_WE_ANALYZE_ITEMS,
} from "@/pages/ResumeAnalyzer/mockData";

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
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPhase("upload");
                setFile(null);
              }}
              className="w-full md:w-auto"
            >
              <RotateCcw size={14} className="mr-2" />
              <span>Analyze another resume</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="w-full md:w-auto"
            >
              Confirm profile
            </Button>
          </div>
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
              delay={0.15}
            />
            <WeaknessesCard items={MOCK_ANALYSIS.weaknesses} delay={0.3} />
            <TopSkillsCard skills={MOCK_SKILLS} delay={0.3} />
            <AttentionPointsCard
              items={MOCK_ANALYSIS.attentionPoints}
              delay={0.45}
            />
            <SuggestionsCard items={MOCK_ANALYSIS.suggestions} delay={0.45} />
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
