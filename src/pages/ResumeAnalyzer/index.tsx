import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Lightbulb, Loader2 } from "lucide-react";

type AnalysisState = "idle" | "loading" | "done";

const MOCK_ANALYSIS = {
  summary:
    "Your resume is well-structured with clear sections. It highlights 5 years of experience in frontend development with strong emphasis on React and TypeScript projects.",
  strengths: [
    "Strong technical skills section with relevant technologies",
    "Quantified achievements in past roles",
    "Clear career progression shown",
    "Good use of action verbs",
  ],
  weaknesses: [
    "Missing a professional summary at the top",
    "Some job descriptions are too brief",
    "No mention of soft skills or leadership experience",
    "Education section lacks relevant coursework",
  ],
  suggestions: [
    "Add a 2–3 sentence professional summary",
    "Expand on your role at Acme Corp with specific metrics",
    "Include any open-source contributions or side projects",
    "Consider adding a skills proficiency indicator",
  ],
};

const LOADING_STEPS = [
  "Parsing document structure…",
  "Evaluating skills and keywords…",
  "Identifying strengths and gaps…",
  "Generating suggestions…",
];

function UploadArea({
  onFileSelected,
  fileName,
}: {
  onFileSelected: (file: File) => void;
  fileName: string | null;
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
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "w-full rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-4 transition-colors text-left",
          isDragging
            ? "border-purple bg-purple/10"
            : fileName
            ? "border-teal bg-teal/5"
            : "border-border bg-surface hover:border-border-hover hover:bg-overlay",
        ].join(" ")}
      >
        <div
          className={[
            "w-14 h-14 rounded-xl flex items-center justify-center",
            fileName ? "bg-teal/15 text-teal" : "bg-purple/15 text-purple",
          ].join(" ")}
        >
          {fileName ? <FileText size={26} /> : <Upload size={26} />}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          {fileName ? (
            <>
              <p className="text-sm font-medium text-primary">{fileName}</p>
              <p className="text-xs text-muted">Click to replace</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-primary">
                Drop your resume here or click to browse
              </p>
              <p className="text-xs text-muted">PDF only</p>
            </>
          )}
        </div>
      </button>
    </>
  );
}

function LoadingState() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-8 py-12"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-purple/15 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={28} className="text-purple" />
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {LOADING_STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.4 + 0.1, duration: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"
            />
            <span className="text-sm text-secondary">{step}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

interface ResultSectionProps {
  title: string;
  icon: React.ReactNode;
  accentClass: string;
  children: React.ReactNode;
  delay?: number;
}

function ResultSection({ title, icon, accentClass, children, delay = 0 }: ResultSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClass}`}>
          {icon}
        </div>
        <h3 className="text-primary">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function BulletList({ items, dotClass }: { items: string[]; dotClass: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
          <span className="text-sm text-secondary leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AnalysisResults() {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 mb-2"
      >
        <CheckCircle size={16} className="text-teal" />
        <span className="text-sm text-teal font-medium">Analysis complete</span>
      </motion.div>

      <ResultSection
        title="Summary"
        icon={<FileText size={16} className="text-secondary" />}
        accentClass="bg-overlay"
        delay={0.05}
      >
        <p className="text-sm text-secondary leading-relaxed">{MOCK_ANALYSIS.summary}</p>
      </ResultSection>

      <ResultSection
        title="Strengths"
        icon={<CheckCircle size={16} className="text-teal" />}
        accentClass="bg-teal/15"
        delay={0.1}
      >
        <BulletList items={MOCK_ANALYSIS.strengths} dotClass="bg-teal" />
      </ResultSection>

      <ResultSection
        title="Weaknesses"
        icon={<AlertCircle size={16} className="text-purple" />}
        accentClass="bg-purple/15"
        delay={0.15}
      >
        <BulletList items={MOCK_ANALYSIS.weaknesses} dotClass="bg-purple" />
      </ResultSection>

      <ResultSection
        title="Suggestions"
        icon={<Lightbulb size={16} className="text-secondary" />}
        accentClass="bg-overlay"
        delay={0.2}
      >
        <ul className="flex flex-col gap-2">
          {MOCK_ANALYSIS.suggestions.map((item, i) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-1.5 text-xs font-medium text-muted shrink-0 w-4 tabular-nums">
                {i + 1}.
              </span>
              <span className="text-sm text-secondary leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </ResultSection>
    </motion.div>
  );
}

export function ResumeAnalyzer() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFileSelected = useCallback((file: File) => {
    setFileName(file.name);
    setState("idle");
  }, []);

  const handleAnalyze = useCallback(() => {
    setState("loading");
    timerRef.current = setTimeout(() => {
      setState("done");
    }, 2000);
  }, []);

  const handleReset = useCallback(() => {
    clearTimeout(timerRef.current ?? undefined);
    timerRef.current = null;
    setState("idle");
    setFileName(null);
  }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-primary">Resume Analyzer</h1>
        <p className="text-secondary mt-1">
          Upload your resume and get AI-powered feedback instantly.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state !== "done" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <UploadArea onFileSelected={handleFileSelected} fileName={fileName} />

            {fileName && state === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <button
                  onClick={handleAnalyze}
                  className="px-5 py-2.5 bg-purple text-primary text-sm font-medium rounded-lg hover:bg-purple-dark transition-colors"
                >
                  Analyze resume
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-overlay text-secondary text-sm font-medium rounded-lg hover:bg-border-hover transition-colors"
                >
                  Clear
                </button>
              </motion.div>
            )}

            {state === "loading" && <LoadingState />}
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <AnalysisResults />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleReset}
              className="self-start px-5 py-2.5 bg-overlay text-secondary text-sm font-medium rounded-lg hover:bg-border-hover transition-colors"
            >
              Analyze another resume
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
